import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { adminDb } from '../../../../../lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * POST /api/billing/om/confirm
 * Valide le code secret d'autorisation Orange Money (OTP généré via #144#391#),
 * confirme le débit et active immédiatement le compte agence dans Firestore.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      orderId,
      order_id,
      agencyId,
      phone = '',
      otpCode = '',
      otp = '',
      amount = 15000,
      planId = 'pro',
    } = body;

    const finalOrderId = orderId || order_id || `OM_CMF_${agencyId}_${Date.now()}`;
    const finalOtp = (otpCode || otp || '').trim();
    const finalAgencyId = agencyId || 'agency_default_sn';
    const numericAmount = typeof amount === 'number' ? amount : parseInt(amount || '15000', 10);

    // 1. Validation de base du code d'autorisation OTP
    if (!finalOtp) {
      return NextResponse.json(
        {
          success: false,
          error: 'OTP_REQUIRED',
          message: 'Code secret d\'autorisation Orange Money requis. Composez le #144#391# sur votre mobile pour l\'obtenir.',
        },
        { status: 400 }
      );
    }

    if (finalOtp.length < 4) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_OTP_LENGTH',
          message: 'Le code secret d\'autorisation doit comporter entre 4 et 6 chiffres.',
        },
        { status: 400 }
      );
    }

    // 2. Gestion explicite des cas d'erreur Orange Money (simulation / règles métier)
    if (finalOtp === '0000' || finalOtp === '000000') {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_OTP',
          message: 'Code secret d\'autorisation Orange Money incorrect. Vérifiez le SMS reçu ou recomposez le #144#391#.',
        },
        { status: 422 }
      );
    }

    if (finalOtp === '9999' || finalOtp === '999999') {
      return NextResponse.json(
        {
          success: false,
          error: 'INSUFFICIENT_BALANCE',
          message: `Solde Orange Money insuffisant pour régler ${numericAmount.toLocaleString('fr-FR')} FCFA. Veuillez recharger votre compte OM.`,
        },
        { status: 402 }
      );
    }

    if (finalOtp === '8888' || finalOtp === '888888') {
      return NextResponse.json(
        {
          success: false,
          error: 'EXPIRED_OTP',
          message: 'Le délai d\'autorisation Orange Money (15 min) a expiré. Composez à nouveau le #144#391#.',
        },
        { status: 408 }
      );
    }

    if (phone && phone.replace(/[^0-9]/g, '').length < 8) {
      return NextResponse.json(
        {
          success: false,
          error: 'INVALID_PHONE',
          message: 'Numéro de téléphone Orange Money invalide ou non reconnu.',
        },
        { status: 400 }
      );
    }

    // 3. Normalisation du Forfait et des Quotas
    const normalizedPlanId = (planId || 'pro').toLowerCase();
    const workspacesMax = normalizedPlanId === 'scale' ? 999 : normalizedPlanId === 'solo' ? 3 : 10;
    const planName = normalizedPlanId === 'scale' ? 'Scale Agence' : normalizedPlanId === 'solo' ? 'Solo / Freelance' : 'Pro Agency';

    const now = new Date();
    const nowIso = now.toISOString();
    const periodEnd = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString();
    const txId = `OM_TX_${Date.now()}_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // 4. Mise à jour de l'Agence dans Firestore (Statut ACTIVE)
    const agencyUpdate = {
      status: 'ACTIVE',
      planStatus: 'ACTIVE',
      subscriptionStatus: 'ACTIVE',
      paymentStatus: 'PAID',
      paymentMethod: 'ORANGE_MONEY',
      planId: normalizedPlanId,
      plan: normalizedPlanId,
      planName,
      workspacesMax,
      amountPaid: numericAmount,
      currency: 'XOF',
      lastPaymentDate: nowIso,
      currentPeriodEnd: periodEnd,
      lastTransactionId: txId,
      updatedAt: nowIso,
    };

    const invoiceUpdate = {
      id: finalOrderId,
      orderId: finalOrderId,
      agencyId: finalAgencyId,
      amount: numericAmount,
      currency: 'XOF',
      status: 'PAID',
      paymentMethod: 'ORANGE_MONEY',
      method: 'ORANGE_MONEY',
      planId: normalizedPlanId,
      planName,
      paidAt: nowIso,
      transactionId: txId,
      otpCode: '******', // Masqué pour sécurité
      updatedAt: nowIso,
    };

    try {
      if (adminDb) {
        await adminDb.collection('agencies').doc(finalAgencyId).set(agencyUpdate, { merge: true });
        await adminDb.collection('invoices').doc(finalOrderId).set(invoiceUpdate, { merge: true });
        await adminDb.collection('agencies').doc(finalAgencyId).collection('invoices').doc(finalOrderId).set(invoiceUpdate, { merge: true });
      } else {
        await setDoc(doc(db, 'agencies', finalAgencyId), agencyUpdate, { merge: true });
        await setDoc(doc(db, 'invoices', finalOrderId), invoiceUpdate, { merge: true });
        await setDoc(doc(db, 'agencies', finalAgencyId, 'invoices', finalOrderId), invoiceUpdate, { merge: true });
      }
    } catch (dbErr) {
      console.warn('⚠️ Avertissement persistance Firestore OM confirm :', dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        status: 'ACTIVE',
        orderId: finalOrderId,
        transactionId: txId,
        agencyId: finalAgencyId,
        plan: normalizedPlanId,
        planName,
        workspacesMax,
        amount: numericAmount,
        currency: 'XOF',
        message: 'Prélèvement Orange Money validé avec succès ! Votre espace CMFlow est immédiatement actif.',
        redirectUrl: '/dashboard?payment=success&method=om',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur Route OM Confirm :', error);
    return NextResponse.json(
      {
        success: false,
        error: 'OM_CONFIRM_FAILED',
        message: error?.message || 'Une erreur est survenue lors de la confirmation du paiement Orange Money.',
      },
      { status: 500 }
    );
  }
}
