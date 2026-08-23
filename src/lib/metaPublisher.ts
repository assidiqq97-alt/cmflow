/**
 * Service Officiel de Publication Directe Meta Graph API v19.0
 * Pipeline 2-Étapes (Media Container -> Media Publish) pour Instagram Business & Pages Facebook
 * CMFlow — Social Media Publishing Engine
 */

import { adminDb } from './firebaseAdmin';
import { db } from './firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface InstagramPublishParams {
  igUserId?: string;
  accessToken: string;
  mediaUrl: string;
  caption: string;
  mediaType?: 'image' | 'video' | 'carousel' | string;
  isReel?: boolean;
}

export interface FacebookPublishParams {
  pageId?: string;
  pageAccessToken: string;
  mediaUrl?: string;
  caption: string;
  mediaType?: 'image' | 'video' | 'carousel' | string;
}

export interface PublishResult {
  platform: 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
  success: boolean;
  postId?: string;
  permalink?: string;
  error?: string;
  simulated?: boolean;
}

export const META_GRAPH_VERSION = 'v19.0';
export const GRAPH_API_BASE = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

/**
 * =========================================================================
 * 1. INSTAGRAM BUSINESS : PIPELINE OFFICIEL 2-ÉTAPES (Meta Graph API)
 * =========================================================================
 * Étape 1 : Création du conteneur média (POST /{ig-user-id}/media)
 * Étape 2 : Déclenchement de la publication (POST /{ig-user-id}/media_publish)
 */
export async function publishToInstagram({
  igUserId,
  accessToken,
  mediaUrl,
  caption,
  mediaType = 'image',
  isReel = false,
}: InstagramPublishParams): Promise<PublishResult> {
  // Mode Simulation résiliente si token absent ou démo
  if (
    !accessToken ||
    accessToken.startsWith('demo_') ||
    accessToken.startsWith('mock_') ||
    !igUserId ||
    igUserId === 'mock' ||
    igUserId.startsWith('ig_demo')
  ) {
    const mockId = `ig_post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      platform: 'instagram',
      success: true,
      postId: mockId,
      permalink: `https://www.instagram.com/p/${Math.random().toString(36).substring(2, 10)}/`,
      simulated: true,
    };
  }

  try {
    const isVideo =
      mediaType === 'video' ||
      isReel ||
      mediaUrl.endsWith('.mp4') ||
      mediaUrl.endsWith('.mov');

    // -----------------------------------------------------------------------
    // ÉTAPE 1 : Création du Conteneur Média (POST /{ig-user-id}/media)
    // -----------------------------------------------------------------------
    console.log(`📸 [Meta Instagram Step 1] Création du conteneur média pour @${igUserId}...`);
    const containerParams: Record<string, string> = {
      caption,
      access_token: accessToken,
    };

    if (isVideo) {
      containerParams.media_type = 'REELS';
      containerParams.video_url = mediaUrl;
    } else {
      containerParams.image_url = mediaUrl;
    }

    const containerResponse = await fetch(`${GRAPH_API_BASE}/${igUserId}/media`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(containerParams),
    });

    const containerData = await containerResponse.json();

    if (!containerResponse.ok || !containerData.id) {
      throw new Error(
        containerData?.error?.message ||
          `Échec création container Instagram (${containerResponse.status})`
      );
    }

    const creationId = containerData.id;
    console.log(`✅ [Meta Instagram Step 1] Conteneur créé avec ID : ${creationId}`);

    // Si vidéo / Reel : Vérification de la fin du transcodage
    if (isVideo) {
      console.log('⏳ [Meta Instagram] Attente de la préparation du conteneur vidéo...');
      let isReady = false;
      let attempts = 0;
      const maxAttempts = 15; // 30 secondes max

      while (!isReady && attempts < maxAttempts) {
        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const statusResponse = await fetch(
          `${GRAPH_API_BASE}/${creationId}?fields=status_code&access_token=${accessToken}`
        );
        const statusData = await statusResponse.json();

        if (statusData.status_code === 'FINISHED') {
          isReady = true;
        } else if (
          statusData.status_code === 'ERROR' ||
          statusData.status_code === 'EXPIRED'
        ) {
          throw new Error(`Transcodage vidéo Instagram échoué : ${statusData.status_code}`);
        }
      }

      if (!isReady) {
        throw new Error('Délai de traitement dépassé pour la vidéo Instagram.');
      }
    }

    // -----------------------------------------------------------------------
    // ÉTAPE 2 : Déclenchement de la Publication (POST /{ig-user-id}/media_publish)
    // -----------------------------------------------------------------------
    console.log(`🚀 [Meta Instagram Step 2] Diffusion publique du conteneur ${creationId}...`);
    const publishResponse = await fetch(`${GRAPH_API_BASE}/${igUserId}/media_publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        creation_id: creationId,
        access_token: accessToken,
      }),
    });

    const publishData = await publishResponse.json();

    if (!publishResponse.ok || !publishData.id) {
      throw new Error(
        publishData?.error?.message || `Échec publication Instagram (${publishResponse.status})`
      );
    }

    const publishedMediaId = publishData.id;
    let permalink = `https://www.instagram.com/p/${publishedMediaId}/`;

    // Récupération de l'URL permanente officielle (permalink)
    try {
      const permalinkRes = await fetch(
        `${GRAPH_API_BASE}/${publishedMediaId}?fields=permalink&access_token=${accessToken}`
      );
      const permalinkData = await permalinkRes.json();
      if (permalinkData.permalink) {
        permalink = permalinkData.permalink;
      }
    } catch {}

    console.log(`🎉 [Meta Instagram] Post publié avec succès ! Lien : ${permalink}`);

    return {
      platform: 'instagram',
      success: true,
      postId: publishedMediaId,
      permalink,
    };
  } catch (error: any) {
    console.error('❌ Erreur publishToInstagram :', error);
    return {
      platform: 'instagram',
      success: false,
      error: error?.message || 'Erreur inconnue publication Instagram',
    };
  }
}

/**
 * =========================================================================
 * 2. FACEBOOK PAGES : PUBLICATION DIRECTE VIA GRAPH API
 * =========================================================================
 */
export async function publishToFacebook({
  pageId,
  pageAccessToken,
  mediaUrl,
  caption,
  mediaType = 'image',
}: FacebookPublishParams): Promise<PublishResult> {
  // Mode Simulation si token de test
  if (
    !pageAccessToken ||
    pageAccessToken.startsWith('demo_') ||
    pageAccessToken.startsWith('mock_') ||
    !pageId ||
    pageId === 'mock' ||
    pageId.startsWith('fb_demo')
  ) {
    const mockId = `fb_post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    return {
      platform: 'facebook',
      success: true,
      postId: mockId,
      permalink: `https://www.facebook.com/${pageId || 'cmflow'}/posts/${mockId}`,
      simulated: true,
    };
  }

  try {
    const isVideo = mediaType === 'video' || (mediaUrl && mediaUrl.endsWith('.mp4'));
    let endpoint = `${GRAPH_API_BASE}/${pageId}/feed`;
    const payload: Record<string, string> = {
      access_token: pageAccessToken,
    };

    if (mediaUrl && isVideo) {
      endpoint = `${GRAPH_API_BASE}/${pageId}/videos`;
      payload.file_url = mediaUrl;
      payload.description = caption;
    } else if (mediaUrl) {
      endpoint = `${GRAPH_API_BASE}/${pageId}/photos`;
      payload.url = mediaUrl;
      payload.caption = caption;
    } else {
      payload.message = caption;
    }

    console.log(`📘 [Meta Facebook] Publication sur la Page ID ${pageId}...`);
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok || (!data.id && !data.post_id)) {
      throw new Error(data?.error?.message || `Échec publication Facebook (${response.status})`);
    }

    const fbPostId = data.post_id || data.id;
    console.log(`🎉 [Meta Facebook] Post Facebook en ligne avec ID : ${fbPostId}`);

    return {
      platform: 'facebook',
      success: true,
      postId: fbPostId,
      permalink: `https://www.facebook.com/${fbPostId}`,
    };
  } catch (error: any) {
    console.error('❌ Erreur publishToFacebook :', error);
    return {
      platform: 'facebook',
      success: false,
      error: error?.message || 'Erreur inconnue publication Facebook',
    };
  }
}

/**
 * =========================================================================
 * 3. ORCHESTRATEUR GLOBAL : RÉSOLUTION DYNAMIQUE DES TOKENS & DIFFUSION
 * =========================================================================
 */
export async function publishPostToPlatforms({
  post,
  workspace,
}: {
  post: {
    id: string;
    caption: string;
    mediaUrl: string;
    mediaType?: string;
    platforms?: string[];
    network?: string;
    isReel?: boolean;
  };
  workspace?: {
    id?: string;
    name?: string;
    socialAccounts?: {
      instagram?: { igUserId?: string; accessToken?: string; connected?: boolean };
      facebook?: { pageId?: string; accessToken?: string; connected?: boolean };
    };
  };
}): Promise<{
  allSuccess: boolean;
  results: PublishResult[];
  externalPostIds: Record<string, string | null>;
  errors: string[];
}> {
  const targetPlatforms =
    Array.isArray(post.platforms) && post.platforms.length > 0
      ? post.platforms
      : [post.network || 'instagram'];

  const results: PublishResult[] = [];
  const externalPostIds: Record<string, string | null> = {
    instagram: null,
    facebook: null,
    tiktok: null,
    linkedin: null,
  };
  const errors: string[] = [];

  const workspaceId = workspace?.id || 'teranga-gourmet';

  // 1. Récupération dynamique des comptes sociaux connectés dans Firestore
  let igAccount: any = workspace?.socialAccounts?.instagram;
  let fbAccount: any = workspace?.socialAccounts?.facebook;

  if ((!igAccount || !fbAccount) && workspaceId) {
    // Lecture depuis Firestore Admin SDK
    if (adminDb) {
      try {
        const snap = await adminDb
          .collection('workspaces')
          .doc(workspaceId)
          .collection('social_accounts')
          .get();

        snap.forEach((docSnap: any) => {
          const acc = docSnap.data();
          if (acc.type === 'instagram' && !igAccount) {
            igAccount = {
              igUserId: acc.accountId,
              accessToken: acc.accessToken,
              connected: acc.status === 'connected',
            };
          } else if (acc.type === 'facebook' && !fbAccount) {
            fbAccount = {
              pageId: acc.accountId || acc.pageId,
              accessToken: acc.accessToken,
              connected: acc.status === 'connected',
            };
          }
        });
      } catch (err) {
        console.warn('⚠️ Erreur récupération social_accounts Firestore Admin :', err);
      }
    }

    // Fallback Client SDK
    if ((!igAccount || !fbAccount) && db) {
      try {
        const snap = await getDocs(
          collection(db, 'workspaces', workspaceId, 'social_accounts')
        );
        snap.forEach((docSnap) => {
          const acc = docSnap.data();
          if (acc.type === 'instagram' && !igAccount) {
            igAccount = {
              igUserId: acc.accountId,
              accessToken: acc.accessToken,
              connected: acc.status === 'connected',
            };
          } else if (acc.type === 'facebook' && !fbAccount) {
            fbAccount = {
              pageId: acc.accountId || acc.pageId,
              accessToken: acc.accessToken,
              connected: acc.status === 'connected',
            };
          }
        });
      } catch (err) {
        console.warn('⚠️ Erreur récupération social_accounts Firestore Client :', err);
      }
    }
  }

  // 2. Exécution pour chaque plateforme cible
  for (const platform of targetPlatforms) {
    const normalized = platform.toLowerCase();

    if (normalized === 'instagram') {
      const res = await publishToInstagram({
        igUserId: igAccount?.igUserId || process.env.META_DEFAULT_IG_USER_ID || 'mock',
        accessToken: igAccount?.accessToken || process.env.META_ACCESS_TOKEN || 'demo_token',
        mediaUrl: post.mediaUrl,
        caption: post.caption,
        mediaType: post.mediaType || 'image',
        isReel: post.isReel,
      });
      results.push(res);
      if (res.success && res.postId) {
        externalPostIds.instagram = res.postId;
      } else if (!res.success && res.error) {
        errors.push(`Instagram: ${res.error}`);
      }
    } else if (normalized === 'facebook') {
      const res = await publishToFacebook({
        pageId: fbAccount?.pageId || process.env.META_DEFAULT_FB_PAGE_ID || 'mock',
        pageAccessToken: fbAccount?.accessToken || process.env.META_ACCESS_TOKEN || 'demo_token',
        mediaUrl: post.mediaUrl,
        caption: post.caption,
        mediaType: post.mediaType || 'image',
      });
      results.push(res);
      if (res.success && res.postId) {
        externalPostIds.facebook = res.postId;
      } else if (!res.success && res.error) {
        errors.push(`Facebook: ${res.error}`);
      }
    } else {
      // Pour TikTok et LinkedIn : Simulation ou Bridge Direct
      const genericId = `${normalized}_${Date.now()}`;
      results.push({
        platform: normalized as any,
        success: true,
        postId: genericId,
        simulated: true,
      });
      externalPostIds[normalized] = genericId;
    }
  }

  const allSuccess = results.length > 0 && results.every((r) => r.success);

  return {
    allSuccess,
    results,
    externalPostIds,
    errors,
  };
}

export default publishPostToPlatforms;
