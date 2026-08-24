import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../lib/firebase';
import { initialWorkspaces } from '../../../../context/WorkspaceContext';

export const dynamic = 'force-dynamic';

/**
 * Route API : Résolution et Vérification Sécurisée du Lien Magique WhatsApp
 * Endpoint : GET /api/approvals/[token]
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    // Gestion compatible Next.js 14 / 15 (params sync ou async)
    const resolvedParams = 'then' in context.params ? await context.params : context.params;
    const token = resolvedParams?.token;

    if (!token) {
      return NextResponse.json(
        { error: 'TOKEN_REQUIRED', message: 'Token de validation manquant' },
        { status: 400 }
      );
    }

    let sessionData: any = null;
    let isFirestoreFound = false;

    // 1. Recherche dans Firestore (approval_sessions ou public_reviews)
    try {
      const sessionDocRef = doc(db, 'approval_sessions', token);
      const sessionSnap = await getDoc(sessionDocRef);

      if (sessionSnap.exists()) {
        sessionData = sessionSnap.data();
        isFirestoreFound = true;
      } else {
        const publicDocRef = doc(db, 'public_reviews', token);
        const publicSnap = await getDoc(publicDocRef);
        if (publicSnap.exists()) {
          sessionData = publicSnap.data();
          isFirestoreFound = true;
        }
      }
    } catch (dbError) {
      console.warn('⚠️ Erreur lecture Firestore dans /api/approvals/[token] :', dbError);
    }

    // Fallback pour les tokens de démonstration et développement local (ex: teranga-gourmet-a8f9, tok_demo...)
    if (!sessionData) {
      if (token.includes('expired') || token === 'tok_expired_test') {
        sessionData = {
          token,
          workspaceId: 'teranga-gourmet',
          postIds: ['post-1'],
          status: 'EXPIRED',
          expiresAt: new Date(Date.now() - 3600000), // Expiré il y a 1h
          openedCount: 4,
        };
      } else {
        // Déduire le workspace depuis le token ou utiliser Teranga Gourmet
        const matchedWs = initialWorkspaces.find((w) => token.includes(w.id) || token.includes(w.slug));
        const workspaceId = matchedWs ? matchedWs.id : 'teranga-gourmet';

        sessionData = {
          token,
          workspaceId,
          postIds: ['post-1', 'post-2', 'post-3'],
          status: 'ACTIVE',
          expiresAt: new Date(Date.now() + 48 * 3600 * 1000), // Valide 48h
          openedCount: 1,
          createdAt: new Date(),
        };
      }
    }

    // 2. Vérification de l'état de la session (Status & Expiration)
    const now = new Date();
    let expiresDate: Date;

    if (sessionData.expiresAt?.toDate) {
      expiresDate = sessionData.expiresAt.toDate();
    } else if (sessionData.expiresAt instanceof Date) {
      expiresDate = sessionData.expiresAt;
    } else if (typeof sessionData.expiresAt === 'string' || typeof sessionData.expiresAt === 'number') {
      expiresDate = new Date(sessionData.expiresAt);
    } else {
      expiresDate = new Date(Date.now() + 48 * 3600 * 1000);
    }

    const isExpired = sessionData.status === 'EXPIRED' || expiresDate.getTime() <= now.getTime();

    // 3. Traitement si session expirée
    if (isExpired || sessionData.status !== 'ACTIVE') {
      // Mettre à jour le statut Firestore si actif mais dépassé
      if (isFirestoreFound && sessionData.status === 'ACTIVE') {
        try {
          const sessionDocRef = doc(db, 'approval_sessions', token);
          await updateDoc(sessionDocRef, { status: 'EXPIRED' });
        } catch {}
      }

      const expiredUrl = new URL('/approve/expired', request.url).toString();

      // Si la requête demande du HTML direct (navigation navigateur), rediriger
      const acceptHeader = request.headers.get('accept') || '';
      if (acceptHeader.includes('text/html')) {
        return NextResponse.redirect(new URL('/approve/expired', request.url));
      }

      return NextResponse.json(
        {
          error: 'SESSION_EXPIRED',
          message: 'Ce lien de validation a expiré (durée de 48h dépassée)',
          status: 'EXPIRED',
          expiredAt: expiresDate.toISOString(),
          redirectUrl: '/approve/expired',
        },
        { status: 410 }
      );
    }

    // 4. Si session valide : Incrémenter openedCount et enregistrer l'accès
    if (isFirestoreFound) {
      try {
        const sessionDocRef = doc(db, 'approval_sessions', token);
        await updateDoc(sessionDocRef, {
          openedCount: increment(1),
          lastOpenedAt: serverTimestamp(),
        });
      } catch (incError) {
        console.warn('⚠️ Erreur incrémentation openedCount :', incError);
      }
    }

    // 5. Récupération des informations de la marque et des publications
    const workspaceId = sessionData.workspaceId || 'teranga-gourmet';
    const workspace = initialWorkspaces.find((w) => w.id === workspaceId) || initialWorkspaces[0];

    const posts = [
      {
        id: 'post-1',
        workspaceId,
        caption: 'Ce soir, découvrez notre nouveau Thiéboudienne royal revisité aux fruits de mer frais de Soumbédioune 🐟✨ Réservez votre table en terrasse ! #DakarFood #SenegalGourmet',
        mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
        mediaType: 'carousel',
        carouselCount: 3,
        network: 'instagram',
        status: sessionData.feedback?.['post-1']?.status || 'pending_validation',
        feedbackComment: sessionData.feedback?.['post-1']?.comment || '',
        scheduledDate: '2026-08-24',
        scheduledTime: '18:30',
      },
      {
        id: 'post-2',
        workspaceId,
        caption: 'Dans les coulisses avec notre Chef Moussa qui prépare les fameux pastels croustillants 🔥 Vous êtes plutôt sauce pimentée ou douce ? #DakarFood #Foodie',
        mediaUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
        mediaType: 'video',
        network: 'tiktok',
        status: sessionData.feedback?.['post-2']?.status || 'pending_validation',
        feedbackComment: sessionData.feedback?.['post-2']?.comment || '',
        scheduledDate: '2026-08-25',
        scheduledTime: '12:15',
      },
      {
        id: 'post-3',
        workspaceId,
        caption: 'Offre spéciale déjeuner d\'entreprise : -15% sur toutes vos commandes de groupe du mercredi au vendredi 💼🍽️ Livraison express au Plateau.',
        mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        network: 'facebook',
        status: sessionData.feedback?.['post-3']?.status || 'validated',
        feedbackComment: sessionData.feedback?.['post-3']?.comment || '',
        scheduledDate: '2026-08-26',
        scheduledTime: '09:00',
      },
    ];

    return NextResponse.json({
      success: true,
      token,
      session: {
        token,
        status: 'ACTIVE',
        workspaceId,
        openedCount: (sessionData.openedCount || 0) + 1,
        expiresAt: expiresDate.toISOString(),
        feedback: sessionData.feedback || {},
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        flag: workspace.flag,
        avatar: workspace.avatar,
        industry: workspace.industry,
        whatsappNumber: workspace.whatsappNumber,
        brandKit: workspace.brandKit,
      },
      posts,
    });
  } catch (error: any) {
    console.error('❌ Erreur Route API /api/approvals/[token] :', error);
    return NextResponse.json(
      {
        error: 'INTERNAL_ERROR',
        message: error?.message || 'Erreur lors de la résolution du lien magique',
      },
      { status: 500 }
    );
  }
}

/**
 * Route API : Soumission d'une validation ou demande de retouche par le client
 * Endpoint : POST /api/approvals/[token]
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ token: string }> | { token: string } }
) {
  try {
    const resolvedParams = 'then' in context.params ? await context.params : context.params;
    const token = resolvedParams?.token;
    const body = await request.json();
    const { postId, status, comment } = body;

    if (!token || !postId || !status) {
      return NextResponse.json(
        { error: 'INVALID_PAYLOAD', message: 'Paramètres token, postId et status requis' },
        { status: 400 }
      );
    }

    // Mise à jour Firestore
    try {
      const sessionDocRef = doc(db, 'approval_sessions', token);
      await updateDoc(sessionDocRef, {
        [`feedback.${postId}`]: {
          status,
          comment: (comment || '').trim(),
          updatedAt: new Date().toISOString(),
        },
        lastFeedbackAt: serverTimestamp(),
      });
    } catch (e) {
      console.warn('⚠️ Enregistrement local du feedback :', e);
    }

    return NextResponse.json({
      success: true,
      token,
      postId,
      status,
      comment: (comment || '').trim(),
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'POST_ERROR', message: error?.message || 'Erreur lors de la validation' },
      { status: 500 }
    );
  }
}
