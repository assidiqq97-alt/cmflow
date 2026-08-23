import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebaseAdmin';
import { doc, deleteDoc } from 'firebase/firestore';

/**
 * Route de Déconnexion de Compte Réseau Social (Meta, etc.)
 * Endpoint : POST /api/social/meta/disconnect
 * Body : { workspaceId: string, accountId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { workspaceId, accountId } = body;

    if (!workspaceId || !accountId) {
      return NextResponse.json(
        { success: false, error: 'Paramètres workspaceId et accountId obligatoires' },
        { status: 400 }
      );
    }

    let deleted = false;

    // Suppression via Admin SDK
    if (adminDb) {
      try {
        await adminDb
          .collection('workspaces')
          .doc(workspaceId)
          .collection('social_accounts')
          .doc(accountId)
          .delete();

        await adminDb
          .collection('social_accounts')
          .doc(`${workspaceId}_${accountId}`)
          .delete();

        deleted = true;
      } catch (adminErr) {
        console.warn('⚠️ Erreur suppression Firestore Admin SDK :', adminErr);
      }
    }

    // Fallback Client SDK
    if (!deleted && db) {
      try {
        await deleteDoc(doc(db, 'workspaces', workspaceId, 'social_accounts', accountId));
        deleted = true;
      } catch (clientErr) {
        console.warn('⚠️ Erreur suppression Firestore Client SDK :', clientErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Compte social déconnecté avec succès.',
      accountId,
      workspaceId,
    });
  } catch (error: any) {
    console.error('❌ Erreur lors de la déconnexion du compte social :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur serveur interne' },
      { status: 500 }
    );
  }
}
