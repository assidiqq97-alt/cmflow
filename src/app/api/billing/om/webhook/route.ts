import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { adminDb } from '../../../../../lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    let body: any = {};
    const contentType = request.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      body = await request.json().catch(() => ({}));
    } else {
      const text = await request.text();
      try {
        body = JSON.parse(text);
      } catch {
        const params = new URLSearchParams(text);
        body = Object.fromEntries(params.entries());
      }
    }

    const {
      status,
      order_id,
      pay_token,
      txnid = `om_tx_${Date.now()}`,
      amount,
    } = body;

    // Vérification du statut Orange Money
    if (status === 'SUCCESS' || status === 'success' || status === 'PAID' || status === 'COMPLETED') {
      let agencyId = 'agency_default_sn';
      let planId: 'PRO_AGENCY' | 'SCALE' = 'PRO_AGENCY';

      if (order_id && order_id.startsWith('OM_CMF_')) {
        const parts = order_id.split('_');
        if (parts.length >= 3) {
          agencyId = parts[2];
        }
      }

      const numericAmount = parseInt(amount || '15000', 10);
      if (numericAmount >= 30000) {
        planId = 'SCALE';
      }

      const planName = planId === 'SCALE' ? 'Scale & Franchise' : 'Pro Agency';
      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const nowIso = now.toISOString();

      // 1. Mise à jour du document Agence dans Firestore
      const agencyUpdate = {
        plan: planId,
        planName,
        planStatus: 'ACTIVE',
        subscriptionStatus: 'ACTIVE',
        paymentMethod: 'ORANGE_MONEY',
        amountPaid: numericAmount,
        currency: 'XOF',
        lastPaymentDate: nowIso,
        currentPeriodEnd: periodEnd,
        updatedAt: nowIso,
      };

      try {
        if (adminDb) {
          await adminDb.collection('agencies').doc(agencyId).set(agencyUpdate, { merge: true });
        } else {
          await setDoc(doc(db, 'agencies', agencyId), agencyUpdate, { merge: true });
        }
      } catch (dbErr) {
        console.warn('⚠️ Échec mise à jour agence OM:', dbErr);
      }

      // 2. Mise à jour de la Facture
      const invoiceUpdate = {
        status: 'PAID',
        paidAt: nowIso,
        transactionId: txnid,
        payToken: pay_token || null,
        updatedAt: nowIso,
      };

      try {
        if (adminDb) {
          if (order_id) {
            await adminDb.collection('agencies').doc(agencyId).collection('invoices').doc(order_id).set(invoiceUpdate, { merge: true });
            await adminDb.collection('invoices').doc(order_id).set(invoiceUpdate, { merge: true });
          }
        } else if (order_id) {
          await setDoc(doc(db, 'agencies', agencyId, 'invoices', order_id), invoiceUpdate, { merge: true });
          await setDoc(doc(db, 'invoices', order_id), invoiceUpdate, { merge: true });
        }
      } catch (invErr) {
        console.warn('⚠️ Échec mise à jour facture OM:', invErr);
      }

      // 3. Journalisation de l'activité
      const logId = `log_${Date.now()}_payment_om`;
      const logData = {
        id: logId,
        agencyId,
        workspaceId: agencyId,
        type: 'PAYMENT_RECEIVED',
        action: 'APPROVED',
        method: 'ORANGE_MONEY',
        message: `Paiement Orange Money de ${numericAmount.toLocaleString()} FCFA reçu avec succès. Forfait ${planName} activé pour 30 jours ! 🍊✨`,
        amount: numericAmount,
        currency: 'XOF',
        orderId: order_id,
        transactionId: txnid,
        createdAt: nowIso,
        timestamp: now,
      };

      try {
        if (adminDb) {
          await adminDb.collection('agencies').doc(agencyId).collection('activityLogs').doc(logId).set(logData);
          await adminDb.collection('activityLogs').doc(logId).set(logData);
        } else {
          await setDoc(doc(db, 'agencies', agencyId, 'activityLogs', logId), logData);
          await setDoc(doc(db, 'activityLogs', logId), logData);
        }
      } catch {}

      return NextResponse.json(
        {
          status: 'SUCCESS',
          message: `Notification Orange Money traitée avec succès pour l'agence ${agencyId}.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ status: 'ACKNOWLEDGED', message: 'Statut en attente ou non confirmé.' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Erreur Webhook Orange Money :', error);
    return NextResponse.json(
      { status: 'ERROR', message: error?.message || 'Échec traitement notification Orange Money.' },
      { status: 500 }
    );
  }
}
