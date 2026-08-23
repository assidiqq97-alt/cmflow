import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebaseAdmin';
import { collection, getDocs } from 'firebase/firestore';
import { SocialAccount } from '@/types/social';

/**
 * Route de Récupération des Comptes Sociaux Connectés
 * Endpoint : GET /api/social/meta/accounts?workspaceId=[workspaceId]
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'teranga-gourmet';

    const accounts: SocialAccount[] = [];

    // Tentative de lecture Admin SDK
    if (adminDb) {
      try {
        const snap = await adminDb
          .collection('workspaces')
          .doc(workspaceId)
          .collection('social_accounts')
          .get();

        snap.forEach((d: any) => {
          accounts.push({ id: d.id, ...d.data() } as SocialAccount);
        });
      } catch (adminErr) {
        console.warn('⚠️ Erreur lecture Firestore Admin SDK :', adminErr);
      }
    }

    // Fallback Client SDK si aucun compte via Admin SDK
    if (accounts.length === 0 && db) {
      try {
        const snap = await getDocs(
          collection(db, 'workspaces', workspaceId, 'social_accounts')
        );
        snap.forEach((d) => {
          accounts.push({ id: d.id, ...d.data() } as SocialAccount);
        });
      } catch (clientErr) {
        console.warn('⚠️ Erreur lecture Firestore Client SDK :', clientErr);
      }
    }

    // Sanitisation des données pour ne jamais exposer les tokens d'accès bruts au frontend
    const sanitizedAccounts = accounts.map((acc) => {
      const { accessToken, ...safeData } = acc;
      return {
        ...safeData,
        hasAccessToken: Boolean(accessToken && accessToken.length > 5),
        tokenPreview: accessToken ? `${accessToken.substring(0, 6)}...${accessToken.substring(accessToken.length - 4)}` : undefined,
      };
    });

    return NextResponse.json({
      success: true,
      workspaceId,
      accounts: sanitizedAccounts,
      count: sanitizedAccounts.length,
    });
  } catch (error: any) {
    console.error('❌ Erreur récupération comptes sociaux :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur serveur' },
      { status: 500 }
    );
  }
}
