import { NextRequest, NextResponse } from 'next/server';
import {
  doc,
  getDoc,
  updateDoc,
  setDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebaseAdmin';
import { notifyCMOnDecision } from '@/lib/notifyAgency';
import { initialWorkspaces } from '@/context/WorkspaceContext';

export interface ApprovalWebhookPayload {
  token: string;
  postId: string;
  workspaceId?: string;
  action: 'APPROVED' | 'CHANGES_REQUESTED';
  comment?: string;
}

/**
 * Route API Webhook : Réception et Traitement en Temps Réel des Décisions Client
 * Endpoint : POST /api/webhooks/approvals
 */
export async function POST(request: NextRequest) {
  try {
    const body: ApprovalWebhookPayload = await request.json();
    const { token, postId, workspaceId = 'teranga-gourmet', action, comment = '' } = body;

    // 1. Validation des paramètres requis
    if (!token || !postId || !action) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PAYLOAD',
          message: 'Les champs token, postId et action sont obligatoires.',
        },
        { status: 400 }
      );
    }

    if (action !== 'APPROVED' && action !== 'CHANGES_REQUESTED') {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_ACTION',
          message: 'L\'action doit être soit "APPROVED" soit "CHANGES_REQUESTED".',
        },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    let sessionData: any = null;
    let postData: any = null;
    let isSessionCompleted = false;

    // 2. Vérification du token dans Firestore (approvalSessions / approval_sessions)
    try {
      if (adminDb) {
        let snap = await adminDb.collection('approvalSessions').doc(token).get();
        if (!snap.exists) {
          snap = await adminDb.collection('approval_sessions').doc(token).get();
        }
        if (snap.exists) {
          sessionData = snap.data();
        }
      } else {
        let docRef = doc(db, 'approvalSessions', token);
        let snap = await getDoc(docRef);
        if (!snap.exists()) {
          docRef = doc(db, 'approval_sessions', token);
          snap = await getDoc(docRef);
        }
        if (snap.exists()) {
          sessionData = snap.data();
        }
      }
    } catch (tokenErr) {
      console.warn('⚠️ Erreur lecture session Firestore :', tokenErr);
    }

    // 3. Mise à jour du document Post dans Firestore (posts/${postId})
    const postStatus = action === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED';
    const postUpdate = {
      status: postStatus,
      clientComment: comment.trim() || null,
      reviewedAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      if (adminDb) {
        const postRef = adminDb.collection('posts').doc(postId);
        const pSnap = await postRef.get();
        if (pSnap.exists) {
          postData = pSnap.data();
          await postRef.update(postUpdate);
        } else {
          // Création ou écriture avec merge si inexistant
          await postRef.set({ id: postId, workspaceId, ...postUpdate }, { merge: true });
        }
      } else {
        const postRef = doc(db, 'posts', postId);
        await setDoc(postRef, postUpdate, { merge: true });
      }
    } catch (postErr) {
      console.warn('⚠️ Erreur mise à jour post Firestore :', postErr);
    }

    // 4. Calcul de l'état de la session (Vérifier si tous les posts sont traités)
    const postIds: string[] = sessionData?.postIds || [postId];
    const existingFeedback = sessionData?.feedback || {};
    existingFeedback[postId] = {
      status: postStatus,
      comment: comment.trim() || null,
      reviewedAt: nowIso,
    };

    // Si tous les postIds sont maintenant approuvés ou demandés en retouche
    const allProcessed = postIds.every((id) => existingFeedback[id] && existingFeedback[id].status);
    isSessionCompleted = allProcessed;

    // Mise à jour de la session dans Firestore
    const sessionUpdate = {
      feedback: existingFeedback,
      status: isSessionCompleted ? 'COMPLETED' : 'ACTIVE',
      lastFeedbackAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      if (adminDb) {
        await adminDb.collection('approvalSessions').doc(token).set(sessionUpdate, { merge: true });
        await adminDb.collection('approval_sessions').doc(token).set(sessionUpdate, { merge: true });
      } else {
        await setDoc(doc(db, 'approvalSessions', token), sessionUpdate, { merge: true });
        await setDoc(doc(db, 'approval_sessions', token), sessionUpdate, { merge: true });
      }
    } catch (sessionErr) {
      console.warn('⚠️ Erreur mise à jour session Firestore :', sessionErr);
    }

    // 5. Récupération des informations de la marque
    const targetWorkspaceId = sessionData?.workspaceId || workspaceId;
    const wsMatch = initialWorkspaces.find((w) => w.id === targetWorkspaceId);
    const workspaceName = wsMatch ? `${wsMatch.name} ${wsMatch.flag || ''}` : 'Teranga Gourmet 🇸🇳';
    const postCaption = postData?.caption || (comment ? `Post (${postId})` : 'Publication Instagram / Facebook');

    // 6. Enregistrement de l'entrée d'activité (Activity Log) en temps réel
    const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const logType = action === 'APPROVED' ? 'POST_APPROVED' : 'POST_REVISION';
    const logMessage =
      action === 'APPROVED'
        ? `[${workspaceName}] a validé une publication (${postId})`
        : `[${workspaceName}] demande une retouche : "${comment.slice(0, 60)}"`;

    const activityLogData = {
      id: logId,
      workspaceId: targetWorkspaceId,
      workspaceName,
      type: logType,
      action,
      postId,
      postCaption,
      comment: comment.trim() || null,
      token,
      message: logMessage,
      createdAt: nowIso,
      timestamp: new Date(),
    };

    try {
      if (adminDb) {
        // Dans la sous-collection du workspace
        await adminDb
          .collection('workspaces')
          .doc(targetWorkspaceId)
          .collection('activityLogs')
          .doc(logId)
          .set(activityLogData);

        // Dans la collection globale pour écouteurs temps réel centralisés
        await adminDb.collection('activityLogs').doc(logId).set(activityLogData);
      } else {
        const wsLogRef = doc(db, 'workspaces', targetWorkspaceId, 'activityLogs', logId);
        await setDoc(wsLogRef, {
          ...activityLogData,
          timestamp: serverTimestamp(),
        });

        const globalLogRef = doc(db, 'activityLogs', logId);
        await setDoc(globalLogRef, {
          ...activityLogData,
          timestamp: serverTimestamp(),
        });
      }
    } catch (logErr) {
      console.warn('⚠️ Erreur insertion activityLog :', logErr);
    }

    // 7. Déclenchement Asynchrone de la Notification CM (WhatsApp / Webhooks / Discord / Slack)
    let notifyResult = null;
    try {
      notifyResult = await notifyCMOnDecision({
        workspaceId: targetWorkspaceId,
        workspaceName,
        postCaption,
        action,
        comment,
        token,
        postId,
        agencyWhatsapp: wsMatch?.whatsappNumber || '+221778421902',
      });
    } catch (notifyErr) {
      console.warn('⚠️ Erreur notification CM :', notifyErr);
    }

    // 8. Réponse HTTP 200 avec confirmation complète
    return NextResponse.json({
      success: true,
      message:
        action === 'APPROVED'
          ? 'Décision validée enregistrée avec succès.'
          : 'Demande de retouche transmise au Community Manager.',
      action,
      postId,
      workspaceId: targetWorkspaceId,
      isSessionCompleted,
      sessionStatus: isSessionCompleted ? 'COMPLETED' : 'ACTIVE',
      activityLogId: logId,
      notification: notifyResult,
      timestamp: nowIso,
    });
  } catch (error: any) {
    console.error('❌ Erreur Route Webhook /api/webhooks/approvals :', error);
    return NextResponse.json(
      {
        success: false,
        error: 'INTERNAL_SERVER_ERROR',
        message: error?.message || 'Erreur lors du traitement du webhook de validation.',
      },
      { status: 500 }
    );
  }
}
