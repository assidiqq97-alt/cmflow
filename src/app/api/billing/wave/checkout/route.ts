import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { adminDb } from '../../../../../lib/firebaseAdmin';
import { createWaveCheckoutSession, CMFlowPlans } from '../../../../../lib/waveCheckout';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      agencyId = 'agency_default_sn',
      agencyName = 'Mon Agence CM',
      agencyEmail = 'contact@cmflow.sn',
      planId = 'PRO_AGENCY',
      amount,
      successUrl,
      errorUrl,
    } = body;

    const plan = CMFlowPlans[planId] || CMFlowPlans.PRO_AGENCY;
    const finalAmount = amount || plan.priceXOF;
    const clientReference = `CMF_${agencyId}_${Date.now()}`;

    // 1. Initialisation de la Session Wave Checkout
    const sessionResult = await createWaveCheckoutSession({
      agencyId,
      agencyName,
      agencyEmail,
      planId: planId as any,
      amount: finalAmount,
      successUrl,
      errorUrl,
      clientReference,
    });

    if (!sessionResult.success || !sessionResult.wave_launch_url) {
      return NextResponse.json(
        {
          success: false,
          error: sessionResult.error || 'Impossible de créer la session Wave.',
        },
        { status: 500 }
      );
    }

    const nowIso = new Date().toISOString();
    const invoiceId = `inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // 2. Enregistrement de la transaction en statut PENDING dans Firestore
    const invoiceData = {
      id: invoiceId,
      agencyId,
      agencyName,
      agencyEmail,
      planId,
      planName: plan.name,
      amount: finalAmount,
      currency: 'XOF',
      status: 'PENDING',
      clientReference,
      waveSessionId: sessionResult.sessionId,
      waveLaunchUrl: sessionResult.wave_launch_url,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      if (adminDb) {
        await adminDb
          .collection('agencies')
          .doc(agencyId)
          .collection('invoices')
          .doc(invoiceId)
          .set(invoiceData);
        await adminDb.collection('invoices').doc(invoiceId).set(invoiceData);
      } else {
        await setDoc(doc(db, 'agencies', agencyId, 'invoices', invoiceId), invoiceData);
        await setDoc(doc(db, 'invoices', invoiceId), invoiceData);
      }
    } catch (dbErr) {
      console.warn('⚠️ Avertissement enregistrement Firestore facture :', dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        wave_launch_url: sessionResult.wave_launch_url,
        sessionId: sessionResult.sessionId,
        clientReference,
        invoiceId,
        amount: finalAmount,
        currency: 'XOF',
        plan: plan.name,
        simulated: !!sessionResult.simulated,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur Route Wave Checkout :', error);
    return NextResponse.json(
      {
        success: false,
        error: 'CHECKOUT_INITIALIZATION_FAILED',
        message: error?.message || 'Erreur lors de la création de la session Wave Checkout.',
      },
      { status: 500 }
    );
  }
}
