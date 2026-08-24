import { NextRequest, NextResponse } from 'next/server';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../../../../../lib/firebase';
import { adminDb } from '../../../../../lib/firebaseAdmin';
import { getOrangeMoneyOAuthToken } from '../../../../../lib/orangeMoneyAuth';
import { CMFlowPlans } from '../../../../../lib/waveCheckout';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      agencyId = 'agency_default_sn',
      agencyName = 'Mon Agence CM',
      agencyEmail = 'contact@cmflow.sn',
      phone = '',
      phoneNumber = '',
      planId = 'PRO_AGENCY',
      amount,
      returnUrl,
      cancelUrl,
    } = body;

    const contactPhone = phone || phoneNumber || '';
    const plan = CMFlowPlans[planId] || CMFlowPlans.PRO_AGENCY;
    const finalAmount = amount || plan.priceXOF;

    // 1. Récupération du token d'accès OAuth2 Orange
    const oauthToken = await getOrangeMoneyOAuthToken();

    // 2. Génération de l'identifiant de commande unique
    const orderId = `OM_CMF_${agencyId}_${Date.now()}`;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmflow.sn';

    const rUrl =
      returnUrl || `${baseUrl}/dashboard/billing?status=success&method=om&plan=${planId}&order_id=${orderId}`;
    const cUrl = cancelUrl || `${baseUrl}/dashboard/billing?status=cancelled&method=om&plan=${planId}`;
    const notifUrl = `${baseUrl}/api/billing/om/webhook`;

    const merchantKey = process.env.OM_MERCHANT_KEY || 'om_merchant_key_dakar_99120';
    const omEnv = process.env.OM_ENV || 'dev';
    const omEndpoint =
      omEnv === 'prod'
        ? 'https://api.orange.com/orange-money-webpay/v1/webpayment'
        : 'https://api.orange.com/orange-money-webpay/dev/v1/webpayment';

    let paymentUrl = '';
    let payToken = '';
    let notifToken = '';
    let isSimulated = false;

    // 3. Appel Orange Money Web Payment ou Simulation
    if (
      !process.env.OM_CLIENT_ID ||
      process.env.OM_CLIENT_ID.includes('om_dev') ||
      process.env.NODE_ENV === 'development'
    ) {
      isSimulated = true;
      payToken = `om_ptk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      notifToken = `om_ntk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      paymentUrl = `https://webpayment.orange-money.com/pay?token=${payToken}&order_id=${orderId}&amount=${finalAmount}&cur=OUV`;
    } else {
      const omPayload = {
        merchant_key: merchantKey,
        currency: 'OUV', // Code monétaire UEMOA Orange Money
        order_id: orderId,
        amount: finalAmount,
        return_url: rUrl,
        cancel_url: cUrl,
        notif_url: notifUrl,
        lang: 'fr',
        reference: `CMFlow-${planId}`,
      };

      const omResponse = await fetch(omEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${oauthToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(omPayload),
      });

      const omData = await omResponse.json();

      if (!omResponse.ok || !omData.payment_url) {
        throw new Error(
          omData?.message || omData?.description || `Échec initialisation Orange Money (${omResponse.status})`
        );
      }

      paymentUrl = omData.payment_url;
      payToken = omData.pay_token || '';
      notifToken = omData.notif_token || '';
    }

    const nowIso = new Date().toISOString();

    // 4. Enregistrement de la transaction dans Firestore
    const invoiceData = {
      id: orderId,
      orderId,
      agencyId,
      agencyName,
      agencyEmail,
      phone: contactPhone,
      planId,
      planName: plan.name,
      amount: finalAmount,
      currency: 'XOF',
      status: 'PENDING',
      method: 'ORANGE_MONEY',
      payToken,
      notifToken,
      paymentUrl,
      createdAt: nowIso,
      updatedAt: nowIso,
    };

    try {
      if (adminDb) {
        await adminDb
          .collection('agencies')
          .doc(agencyId)
          .collection('invoices')
          .doc(orderId)
          .set(invoiceData);
        await adminDb.collection('invoices').doc(orderId).set(invoiceData);
      } else {
        await setDoc(doc(db, 'agencies', agencyId, 'invoices', orderId), invoiceData);
        await setDoc(doc(db, 'invoices', orderId), invoiceData);
      }
    } catch (dbErr) {
      console.warn('⚠️ Avertissement enregistrement Firestore OM :', dbErr);
    }

    return NextResponse.json(
      {
        success: true,
        payment_url: paymentUrl,
        checkout_url: paymentUrl,
        pay_token: payToken,
        notif_token: notifToken,
        order_id: orderId,
        orderId,
        agencyId,
        amount: finalAmount,
        phone: contactPhone,
        currency: 'XOF',
        plan: plan.name,
        ussd_code: '#144#391#',
        requires_otp: true,
        simulated: isSimulated,
        message: 'Session Orange Money initialisée. Composez le #144#391# pour obtenir votre code d\'autorisation.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('❌ Erreur Route OM Checkout :', error);
    return NextResponse.json(
      {
        success: false,
        error: 'OM_CHECKOUT_INITIALIZATION_FAILED',
        message: error?.message || 'Erreur lors de la création de la session Orange Money.',
      },
      { status: 500 }
    );
  }
}
