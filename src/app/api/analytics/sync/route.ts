import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { db } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { MetaAnalyticsService } from '@/lib/services/metaAnalyticsService';

/**
 * Route de Synchronisation Directe des Analytics Meta Graph API
 * Endpoint : GET /api/analytics/sync?workspaceId=[workspaceId]
 * Endpoint : POST /api/analytics/sync (Body : { workspaceId?: string })
 */
async function handleAnalyticsSync(request: NextRequest) {
  try {
    let workspaceId = 'teranga-gourmet';

    if (request.method === 'POST') {
      try {
        const body = await request.json();
        if (body.workspaceId) workspaceId = body.workspaceId;
      } catch {}
    } else {
      const { searchParams } = new URL(request.url);
      if (searchParams.get('workspaceId')) {
        workspaceId = searchParams.get('workspaceId')!;
      }
    }

    console.log(`📊 [Analytics Sync Trigger] Déclenchement pour l'espace : ${workspaceId}`);

    // Récupération du token Instagram connecté dans Firestore
    let igUserId = process.env.META_DEFAULT_IG_USER_ID || '17841405822384910';
    let accessToken = process.env.META_ACCESS_TOKEN || '';

    if (adminDb) {
      try {
        const snap = await adminDb
          .collection('workspaces')
          .doc(workspaceId)
          .collection('social_accounts')
          .where('type', '==', 'instagram')
          .get();

        snap.forEach((d: any) => {
          const acc = d.data();
          const isIg = acc.type === 'instagram' || acc.provider === 'instagram';
          if (isIg && acc.accessToken) {
            accessToken = acc.accessToken;
            igUserId = acc.accountId;
          }
        });
      } catch (err) {
        console.warn('⚠️ Erreur lecture Admin SDK token analytics :', err);
      }
    }

    if (!accessToken && db) {
      try {
        const snap = await getDocs(
          collection(db, 'workspaces', workspaceId, 'social_accounts')
        );
        snap.forEach((d) => {
          const acc = d.data();
          const isIg = acc.type === 'instagram' || acc.provider === 'instagram';
          if (isIg && acc.accessToken) {
            accessToken = acc.accessToken;
            igUserId = acc.accountId;
          }
        });
      } catch (err) {
        console.warn('⚠️ Erreur lecture Client SDK token analytics :', err);
      }
    }

    // Exécution de la synchronisation via MetaAnalyticsService
    const syncResult = await MetaAnalyticsService.syncWorkspaceAnalytics(
      workspaceId,
      igUserId,
      accessToken
    );

    return NextResponse.json({
      success: true,
      workspaceId,
      accountInsights: syncResult.accountInsights,
      syncedPostsCount: syncResult.syncedPostsCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('❌ Erreur route /api/analytics/sync :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur lors de la synchronisation analytics' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleAnalyticsSync(request);
}

export async function POST(request: NextRequest) {
  return handleAnalyticsSync(request);
}
