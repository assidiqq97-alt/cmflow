import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebaseAdmin';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { InstagramPublisher } from '@/lib/services/instagramPublisher';
import { FacebookPublisher } from '@/lib/services/facebookPublisher';

/**
 * Validation de la clé secrète du Cron Job
 */
function verifyCronAuth(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // En développement local

  const vercelCronHeader = request.headers.get('x-vercel-cron');
  if (vercelCronHeader) return true;

  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.replace(/^Bearer\s+/i, '') === cronSecret) {
    return true;
  }

  const { searchParams } = new URL(request.url);
  if (searchParams.get('secret') === cronSecret || searchParams.get('key') === cronSecret) {
    return true;
  }

  return false;
}

/**
 * Récupère les jetons d'accès et identifiants sociaux du workspace dans Firestore
 */
async function getWorkspaceSocialTokens(workspaceId: string): Promise<{
  instagram?: { igUserId: string; accessToken: string };
  facebook?: { pageId: string; accessToken: string };
}> {
  const tokens: {
    instagram?: { igUserId: string; accessToken: string };
    facebook?: { pageId: string; accessToken: string };
  } = {};

  if (adminDb) {
    try {
      const snap = await adminDb
        .collection('workspaces')
        .doc(workspaceId)
        .collection('social_accounts')
        .get();

      snap.forEach((docSnap: any) => {
        const acc = docSnap.data();
        const isIg = acc.type === 'instagram' || acc.provider === 'instagram';
        const isFb = acc.type === 'facebook' || acc.provider === 'facebook';

        if (isIg && !tokens.instagram && acc.accessToken) {
          tokens.instagram = {
            igUserId: acc.accountId,
            accessToken: acc.accessToken,
          };
        } else if (isFb && !tokens.facebook && acc.accessToken) {
          tokens.facebook = {
            pageId: acc.accountId || acc.pageId,
            accessToken: acc.accessToken,
          };
        }
      });
    } catch (err) {
      console.warn('⚠️ Erreur lecture tokens Admin SDK :', err);
    }
  }

  if ((!tokens.instagram || !tokens.facebook) && db) {
    try {
      const snap = await getDocs(
        collection(db, 'workspaces', workspaceId, 'social_accounts')
      );
      snap.forEach((docSnap) => {
        const acc = docSnap.data();
        const isIg = acc.type === 'instagram' || acc.provider === 'instagram';
        const isFb = acc.type === 'facebook' || acc.provider === 'facebook';

        if (isIg && !tokens.instagram && acc.accessToken) {
          tokens.instagram = {
            igUserId: acc.accountId,
            accessToken: acc.accessToken,
          };
        } else if (isFb && !tokens.facebook && acc.accessToken) {
          tokens.facebook = {
            pageId: acc.accountId || acc.pageId,
            accessToken: acc.accessToken,
          };
        }
      });
    } catch (err) {
      console.warn('⚠️ Erreur lecture tokens Client SDK :', err);
    }
  }

  return tokens;
}

/**
 * Handler Principal : Recherche et Publication Automatique des Posts "SCHEDULED"
 * Endpoint : GET /api/cron/publish ou POST /api/cron/publish
 */
async function handlePublishCron(request: NextRequest) {
  if (!verifyCronAuth(request)) {
    return NextResponse.json(
      { success: false, error: 'UNAUTHORIZED', message: 'Accès non autorisé au Cron Job CMFlow.' },
      { status: 401 }
    );
  }

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0]; // YYYY-MM-DD
  const currentHours = String(now.getHours()).padStart(2, '0');
  const currentMins = String(now.getMinutes()).padStart(2, '0');
  const currentTimeStr = `${currentHours}:${currentMins}`; // HH:mm

  console.log(`⏰ [Cron Trigger] Vérification des publications programmées le ${todayStr} à ${currentTimeStr}...`);

  const results = {
    executedAt: now.toISOString(),
    checkedDate: todayStr,
    checkedTime: currentTimeStr,
    foundCount: 0,
    publishedCount: 0,
    failedCount: 0,
    publishedPosts: [] as any[],
    failedPosts: [] as any[],
  };

  try {
    let candidatePosts: any[] = [];

    // 1. Recherche dans Firestore : statut SCHEDULED, APPROVED ou validated
    if (adminDb) {
      try {
        const snap = await adminDb
          .collection('posts')
          .where('status', 'in', ['SCHEDULED', 'scheduled', 'APPROVED', 'validated'])
          .get();

        snap.forEach((d: any) => {
          candidatePosts.push({ id: d.id, ...d.data() });
        });
      } catch (err) {
        console.warn('⚠️ Erreur Firestore Admin posts :', err);
      }
    }

    if (candidatePosts.length === 0 && db) {
      try {
        const q = query(
          collection(db, 'posts'),
          where('status', 'in', ['SCHEDULED', 'scheduled', 'APPROVED', 'validated'])
        );
        const snap = await getDocs(q);
        snap.forEach((d) => {
          candidatePosts.push({ id: d.id, ...d.data() });
        });
      } catch (err) {
        console.warn('⚠️ Erreur Firestore Client posts :', err);
      }
    }

    // 2. Filtrage temporel : posts dont l'horaire est arrivé (ou passé)
    const postsDue = candidatePosts.filter((post) => {
      const pDate = post.scheduledDate || post.date || todayStr;
      const pTime = post.scheduledTime || post.time || '00:00';

      if (pDate < todayStr) return true;
      if (pDate === todayStr && pTime <= currentTimeStr) return true;
      return false;
    });

    results.foundCount = postsDue.length;
    console.log(`📋 [Cron Posts] ${postsDue.length} publication(s) prête(s) à être diffusée(s).`);

    // 3. Exécution de la publication pour chaque post
    for (const post of postsDue) {
      const workspaceId = post.workspaceId || 'teranga-gourmet';
      const platforms = Array.isArray(post.platforms) && post.platforms.length > 0
        ? post.platforms
        : [post.network || 'instagram'];

      // Récupération des tokens sociaux
      const tokens = await getWorkspaceSocialTokens(workspaceId);
      let postSuccess = true;
      const platformResults: any[] = [];

      for (const platform of platforms) {
        const norm = platform.toLowerCase();

        // A. INSTAGRAM GRAPH API
        if (norm === 'instagram') {
          const igToken = tokens.instagram?.accessToken || process.env.META_ACCESS_TOKEN || '';
          const igUserId = tokens.instagram?.igUserId || process.env.META_DEFAULT_IG_USER_ID || '';

          const igRes = await InstagramPublisher.publish({
            postId: post.id,
            workspaceId,
            igUserId,
            accessToken: igToken,
            caption: post.caption || post.title || '',
            mediaUrl: post.mediaUrl,
            mediaUrls: post.mediaUrls || (post.mediaUrl ? [post.mediaUrl] : []),
            mediaType: post.mediaType || 'image',
            isReel: post.isReel,
          });

          platformResults.push(igRes);
          if (!igRes.success) {
            postSuccess = false;
          }
        }
        // B. FACEBOOK PAGE GRAPH API
        else if (norm === 'facebook') {
          const fbToken = tokens.facebook?.accessToken || process.env.META_ACCESS_TOKEN || '';
          const pageId = tokens.facebook?.pageId || process.env.META_DEFAULT_FB_PAGE_ID || '';

          const fbRes = await FacebookPublisher.publish({
            postId: post.id,
            workspaceId,
            pageId,
            pageAccessToken: fbToken,
            caption: post.caption || post.title || '',
            mediaUrl: post.mediaUrl,
            mediaType: post.mediaType || 'image',
          });

          platformResults.push(fbRes);
          if (!fbRes.success) {
            postSuccess = false;
          }
        }
      }

      if (postSuccess) {
        results.publishedCount++;
        results.publishedPosts.push({
          id: post.id,
          title: post.title,
          platforms: platformResults,
        });
      } else {
        results.failedCount++;
        results.failedPosts.push({
          id: post.id,
          title: post.title,
          errors: platformResults.filter((r) => !r.success).map((r) => r.error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Cron exécuté : ${results.publishedCount} publié(s), ${results.failedCount} échoué(s).`,
      results,
    });
  } catch (error: any) {
    console.error('❌ [Cron Exception] :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur interne Cron' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handlePublishCron(request);
}

export async function POST(request: NextRequest) {
  return handlePublishCron(request);
}
