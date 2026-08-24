import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { adminDb } from '../../../../../lib/firebaseAdmin';
import { verifyWaveWebhookSignature } from '../../../../../lib/waveCheckout';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get('wave-signature') || request.headers.get('Wave-Signature');
    const webhookSecret = process.env.WAVE_WEBHOOK_SECRET || '';

    // 1. Vérification de la Signature de Sécurité Wave
    if (webhookSecret && webhookSecret !== 'wave_whsec_mock' && !process.env.NODE_ENV?.includes('dev')) {
      const isValid = verifyWaveWebhookSignature(rawBody, signatureHeader, webhookSecret);
      if (!isValid) {
        console.error('❌ Signature Webhook Wave Invalide');
        return NextResponse.json(
          { success: false, error: 'INVALID_WAVE_SIGNATURE' },
          { status: 400 }
        );
      }
    }

    let event: any = {};
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, error: 'INVALID_JSON' }, { status: 400 });
    }

    const eventType = event.type || event.event || 'checkout.session.completed';
    const eventData = event.data?.object || event.data || event;

    // 2. Traitement lors de la complétion du paiement Wave
    if (
      eventType === 'checkout.session.completed' ||
      eventData.payment_status === 'succeeded' ||
      eventData.checkout_status === 'complete' ||
      eventData.status === 'succeeded'
    ) {
      const clientRef = eventData.client_reference || '';
      let agencyId = 'agency_default_sn';

      if (clientRef.startsWith('CMF_')) {
        const parts = clientRef.split('_');
        if (parts.length >= 2) {
          agencyId = parts[1];
        }
      }

      const amount = parseInt(eventData.amount || '15000', 10);
      const planId = amount >= 30000 ? 'SCALE' : 'PRO_AGENCY';
      const planName = planId === 'SCALE' ? 'Scale & Franchise' : 'Pro Agency';

      const now = new Date();
      const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(); // +30 jours
      const nowIso = now.toISOString();

      // Mise à jour de l'abonnement de l'Agence dans Firestore
      const subscriptionUpdate = {
        plan: planId,
        planName,
        subscriptionStatus: 'ACTIVE',
        billingCycle: 'monthly',
        amountPaid: amount,
        currency: 'XOF',
        lastPaymentDate: nowIso,
        currentPeriodEnd: periodEnd,
        updatedAt: nowIso,
      };

      try {
        if (adminDb) {
          await adminDb.collection('agencies').doc(agencyId).set(subscriptionUpdate, { merge: true });
        } else {
          await setDoc(doc(db, 'agencies', agencyId), subscriptionUpdate, { merge: true });
        }
      } catch (dbErr) {
        console.warn('⚠️ Échec mise à jour agence Firestore:', dbErr);
      }

      // Mise à jour de la facture
      const invoiceUpdate = {
        status: 'PAID',
        payment_status: 'succeeded',
        paidAt: nowIso,
        waveTransactionId: eventData.transaction_id || eventData.id || `wave_tx_${Date.now()}`,
        updatedAt: nowIso,
      };

      try {
        if (adminDb) {
          const snapshot = await adminDb
            .collection('invoices')
            .where('clientReference', '==', clientRef)
            .limit(1)
            .get();

          if (!snapshot.empty) {
            const invoiceDoc = snapshot.docs[0];
            await invoiceDoc.ref.set(invoiceUpdate, { merge: true });
          }
        }
      } catch (invErr) {
        console.warn('⚠️ Échec mise à jour facture:', invErr);
      }

      // Enregistrement du log d'activité pour l'Agence et le CM
      const logId = `log_${Date.now()}_payment_wave`;
      const logData = {
        id: logId,
        agencyId,
        workspaceId: agencyId,
        type: 'PAYMENT_RECEIVED',
        action: 'APPROVED',
        message: `Paiement Wave de ${amount.toLocaleString()} FCFA validé avec succès. Forfait ${planName} activé pour 30 jours ! 🌊✨`,
        amount,
        currency: 'XOF',
        clientReference: clientRef,
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
          success: true,
          status: 'PROCESSED',
          message: `Abonnement ${planName} validé avec succès pour l'agence ${agencyId}.`,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ received: true, status: 'ignored_event' }, { status: 200 });
  } catch (error: any) {
    console.error('❌ Erreur Webhook Wave :', error);
    return NextResponse.json(
      { success: false, error: 'WEBHOOK_PROCESSING_FAILED', message: error?.message },
      { status: 500 }
    );
  }
}
