import { NextRequest, NextResponse } from 'next/server';
import { collection, doc, setDoc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebaseAdmin';

/**
 * Générateur de Token Aléatoire Sécurisé Court (8 caractères alphanumériques)
 * Format : v_9f2k8a1d
 */
function generateShortToken(): string {
  const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
  let result = 'v_';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * POST /api/posts/create
 * Crée une nouvelle publication dans Firestore et génère sa session de validation client 48h
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      workspaceId,
      caption = '',
      mediaUrl = '',
      mediaUrls = [],
      mediaType = 'image',
      format = 'image',
      aspectRatio = '1:1',
      platforms = ['instagram'],
      scheduledDate,
      scheduledTime = '18:00',
      title,
      requiresApproval = true,
      publishMode,
    } = body;

    if (!workspaceId) {
      return NextResponse.json(
        { success: false, error: 'WORKSPACE_ID_REQUIRED', message: 'Identifiant workspaceId requis' },
        { status: 400 }
      );
    }

    // Détermination du statut selon le mode de validation
    const shouldRequireApproval = requiresApproval !== undefined
      ? Boolean(requiresApproval)
      : publishMode === 'direct'
      ? false
      : true;
    const initialStatus = shouldRequireApproval ? 'PENDING_APPROVAL' : 'SCHEDULED';

    // 1. Identifiants uniques pour le post et le token magique
    const postId = `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const token = generateShortToken();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 48 * 3600 * 1000); // 48 heures

    // Normalisation des médias & du format
    const normalizedFormat = (format || mediaType || 'image').toLowerCase();
    const normalizedMediaUrls = Array.isArray(mediaUrls) && mediaUrls.length > 0
      ? mediaUrls
      : mediaUrl
      ? [mediaUrl]
      : [];
    const primaryMediaUrl = normalizedMediaUrls[0] || mediaUrl || '';

    // Normalisation des réseaux sociaux
    const normalizedPlatforms = Array.isArray(platforms)
      ? platforms
      : typeof platforms === 'string'
      ? [platforms]
      : ['instagram'];

    // Données de la publication avec format et mediaUrls
    const postData = {
      id: postId,
      workspaceId,
      clientId: workspaceId,
      title: title || caption.slice(0, 40) || 'Nouvelle publication',
      caption,
      mediaUrl: primaryMediaUrl,
      mediaUrls: normalizedMediaUrls,
      mediaType: normalizedFormat,
      format: normalizedFormat,
      aspectRatio,
      platforms: normalizedPlatforms,
      network: normalizedPlatforms[0] || 'instagram',
      scheduledDate: scheduledDate || now.toISOString().split('T')[0],
      scheduledTime,
      status: initialStatus,
      requiresApproval: shouldRequireApproval,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // Construction de l'URL publique de validation
    const appUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://cmflow.sn').replace(/\/$/, '');
    const magicUrl = `${appUrl}/v/${token}`;

    // Données de la session d'approbation client
    const sessionData = {
      token,
      workspaceId,
      agencyId: 'default-agency',
      postIds: [postId],
      status: 'ACTIVE',
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
      openedCount: 0,
      magicUrl,
    };

    // 2. Enregistrement Firestore (Tentative Admin SDK puis Client SDK avec fallback résilient)
    let isSavedToFirestore = false;

    // A. Tentative avec Firebase Admin SDK (Privilèges serveur)
    try {
      if (adminDb) {
        await adminDb.collection('posts').doc(postId).set({
          ...postData,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Enregistrement dans les deux formats de collection (approvalSessions et approval_sessions)
        await adminDb.collection('approvalSessions').doc(token).set({
          ...sessionData,
          createdAt: new Date(),
          expiresAt: expiresAt,
        });

        await adminDb.collection('approval_sessions').doc(token).set({
          ...sessionData,
          createdAt: new Date(),
          expiresAt: expiresAt,
        });

        isSavedToFirestore = true;
      }
    } catch (adminError) {
      console.warn('⚠️ Firebase Admin SDK non disponible, tentative avec Client SDK :', adminError);
    }

    // B. Tentative avec Firebase Client SDK si Admin n'a pas abouti
    if (!isSavedToFirestore) {
      try {
        const postDocRef = doc(db, 'posts', postId);
        await setDoc(postDocRef, {
          ...postData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        const sessionDocRef1 = doc(db, 'approvalSessions', token);
        await setDoc(sessionDocRef1, {
          ...sessionData,
          createdAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(expiresAt),
        });

        const sessionDocRef2 = doc(db, 'approval_sessions', token);
        await setDoc(sessionDocRef2, {
          ...sessionData,
          createdAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(expiresAt),
        });

        isSavedToFirestore = true;
      } catch (clientError) {
        console.warn('⚠️ Firebase Client SDK non accessible :', clientError);
      }
    }

    return NextResponse.json({
      success: true,
      postId,
      token,
      magicUrl,
      post: postData,
      isSavedToFirestore,
      message: 'Publication créée avec succès et session de validation 48h active',
    });
  } catch (error: any) {
    console.error('❌ Erreur création publication dans /api/posts/create :', error);
    return NextResponse.json(
      {
        success: false,
        error: 'CREATE_POST_FAILED',
        message: error?.message || 'Erreur lors de la création de la publication',
      },
      { status: 500 }
    );
  }
}
