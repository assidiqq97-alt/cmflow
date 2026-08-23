import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebaseAdmin';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { publishPostToPlatforms } from '@/lib/metaPublisher';

/**
 * Route Déclencheur de Publication Immédiate Meta (Instagram Pro & Facebook)
 * Endpoint : POST /api/posts/publish
 * Body : { postId: string, workspaceId?: string }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { postId, workspaceId = 'teranga-gourmet' } = body;

    if (!postId) {
      return NextResponse.json(
        { success: false, error: 'Paramètre postId manquant' },
        { status: 400 }
      );
    }

    let postData: any = null;

    // 1. Récupération du document post dans Firestore
    if (adminDb) {
      try {
        const snap = await adminDb.collection('posts').doc(postId).get();
        if (snap.exists) {
          postData = { id: snap.id, ...snap.data() };
        }
      } catch (adminErr) {
        console.warn('⚠️ Erreur lecture Admin SDK post :', adminErr);
      }
    }

    if (!postData && db) {
      try {
        const snap = await getDoc(doc(db, 'posts', postId));
        if (snap.exists()) {
          postData = { id: snap.id, ...snap.data() };
        }
      } catch (clientErr) {
        console.warn('⚠️ Erreur lecture Client SDK post :', clientErr);
      }
    }

    // Fallback de démonstration si le post est créé localement
    if (!postData) {
      postData = {
        id: postId,
        workspaceId,
        caption: body.caption || 'Nouvelle publication programmée CMFlow ✨ #CMFlow',
        mediaUrl: body.mediaUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        mediaType: body.mediaType || 'image',
        platforms: body.platforms || ['instagram', 'facebook'],
      };
    }

    // 2. Déclenchement du Pipeline Officiel 2-Étapes Meta
    console.log(`🚀 [Publish API] Déclenchement publication pour le post ${postId}...`);
    const publishSummary = await publishPostToPlatforms({
      post: postData,
      workspace: { id: workspaceId },
    });

    const nowIso = new Date().toISOString();

    if (publishSummary.allSuccess) {
      const updateData = {
        status: 'PUBLISHED',
        publishedAt: nowIso,
        externalPostIds: publishSummary.externalPostIds,
        updatedAt: nowIso,
      };

      // 3. Mise à jour du statut dans Firestore
      if (adminDb) {
        try {
          await adminDb.collection('posts').doc(postId).set(updateData, { merge: true });
        } catch {}
      } else if (db) {
        try {
          await setDoc(doc(db, 'posts', postId), updateData, { merge: true });
        } catch {}
      }

      return NextResponse.json({
        success: true,
        postId,
        status: 'PUBLISHED',
        publishedAt: nowIso,
        externalPostIds: publishSummary.externalPostIds,
        results: publishSummary.results,
      });
    } else {
      return NextResponse.json({
        success: false,
        postId,
        status: 'PUBLISH_FAILED',
        errors: publishSummary.errors,
        results: publishSummary.results,
      }, { status: 422 });
    }
  } catch (error: any) {
    console.error('❌ Erreur lors de la publication directe :', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Erreur interne lors de la publication' },
      { status: 500 }
    );
  }
}
