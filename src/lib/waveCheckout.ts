/**
 * CMFlow — Wave Checkout API Engine (Sénégal 🇸🇳 & Côte d'Ivoire 🇨🇮)
 * Gestion des Abonnements SaaS via Wave Business Checkout (1% de frais)
 */

import crypto from 'crypto';

export interface PlanDetails {
  id: 'STARTER' | 'PRO_AGENCY' | 'SCALE';
  name: string;
  priceXOF: number;
  interval: 'monthly' | 'yearly';
  features: string[];
}

export const CMFlowPlans: Record<string, PlanDetails> = {
  STARTER: {
    id: 'STARTER',
    name: 'Starter Solo',
    priceXOF: 0,
    interval: 'monthly',
    features: ['1 Marque Client', '5 Posts / mois', 'Liens de validation WhatsApp'],
  },
  PRO_AGENCY: {
    id: 'PRO_AGENCY',
    name: 'Pro Agency',
    priceXOF: 15000,
    interval: 'monthly',
    features: [
      'Marques Clients Illimitées',
      'Publication Automatique Meta (Instagram & FB)',
      'Notifications & Toasts Temps Réel',
      'Stockage Média HD Illimité',
      'Support WhatsApp Prioritaire',
    ],
  },
  SCALE: {
    id: 'SCALE',
    name: 'Scale & Franchise',
    priceXOF: 35000,
    interval: 'monthly',
    features: [
      'Tout le forfait Pro Agency',
      'Multi-utilisateurs & Équipes CM',
      'Marque Blanche (White-label)',
      'Rapports d’Engagement PDF Automatisés',
      'Accès API Développeur',
    ],
  },
};

export interface CreateWaveSessionParams {
  agencyId: string;
  agencyName?: string;
  agencyEmail?: string;
  planId: 'PRO_AGENCY' | 'SCALE';
  amount?: number;
  successUrl?: string;
  errorUrl?: string;
  clientReference?: string;
}

export interface WaveSessionResponse {
  success: boolean;
  sessionId: string;
  wave_launch_url: string;
  amount: string;
  currency: string;
  clientReference: string;
  simulated?: boolean;
  error?: string;
}

const WAVE_API_BASE = 'https://api.wave.com/v1';

/**
 * 1. Création d'une Session de Paiement Wave Checkout
 */
export async function createWaveCheckoutSession({
  agencyId,
  agencyName,
  agencyEmail,
  planId,
  amount,
  successUrl,
  errorUrl,
  clientReference,
}: CreateWaveSessionParams): Promise<WaveSessionResponse> {
  const plan = CMFlowPlans[planId] || CMFlowPlans.PRO_AGENCY;
  const finalAmount = amount || plan.priceXOF;
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmflow.sn';

  const ref = clientReference || `CMF_${agencyId}_${Date.now()}`;
  const sUrl =
    successUrl || `${baseUrl}/dashboard/billing?status=success&session_id={CHECKOUT_SESSION_ID}&plan=${planId}`;
  const eUrl = errorUrl || `${baseUrl}/dashboard/billing?status=error&plan=${planId}`;

  const waveApiKey = process.env.WAVE_API_KEY;

  // Mode Simulation sécurisé si clé de test ou environnement local
  if (
    !waveApiKey ||
    waveApiKey.includes('test_sec') ||
    waveApiKey === 'demo_key' ||
    process.env.NODE_ENV === 'development'
  ) {
    const mockSessionId = `cos_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const mockLaunchUrl = `https://pay.wave.com/m/mock_checkout_${mockSessionId}?amount=${finalAmount}&cur=XOF&ref=${ref}`;

    return {
      success: true,
      sessionId: mockSessionId,
      wave_launch_url: mockLaunchUrl,
      amount: String(finalAmount),
      currency: 'XOF',
      clientReference: ref,
      simulated: true,
    };
  }

  try {
    const response = await fetch(`${WAVE_API_BASE}/checkout/sessions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${waveApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: String(finalAmount),
        currency: 'XOF',
        error_url: eUrl,
        success_url: sUrl,
        client_reference: ref,
        aggregated_merchant_id: process.env.WAVE_BUSINESS_ID || undefined,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.wave_launch_url) {
      throw new Error(data?.message || `Erreur Wave API (${response.status})`);
    }

    return {
      success: true,
      sessionId: data.id,
      wave_launch_url: data.wave_launch_url,
      amount: String(finalAmount),
      currency: 'XOF',
      clientReference: ref,
    };
  } catch (err: any) {
    console.error('❌ Erreur createWaveCheckoutSession :', err);
    return {
      success: false,
      sessionId: '',
      wave_launch_url: '',
      amount: String(finalAmount),
      currency: 'XOF',
      clientReference: ref,
      error: err?.message || 'Impossible d’initialiser le paiement Wave.',
    };
  }
}

/**
 * 2. Vérification de la Signature Webhook Wave (HMAC-SHA256)
 */
export function verifyWaveWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) return false;

  try {
    const parts = signatureHeader.split(',');
    let timestamp = '';
    let signatures: string[] = [];

    parts.forEach((part) => {
      const [key, value] = part.trim().split('=');
      if (key === 't') timestamp = value;
      if (key === 'v1') signatures.push(value);
    });

    const encoder = new TextEncoder();

    if (!timestamp || signatures.length === 0) {
      // Signature simple HMAC
      const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
      const sigBuf = encoder.encode(signatureHeader);
      const expBuf = encoder.encode(expected);
      if (sigBuf.length !== expBuf.length) return false;
      return crypto.timingSafeEqual(sigBuf, expBuf);
    }

    const payload = `${timestamp}.${rawBody}`;
    const expectedSignature = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const expBuf = encoder.encode(expectedSignature);

    return signatures.some((sig) => {
      try {
        const sigBuf = encoder.encode(sig);
        if (sigBuf.length !== expBuf.length) return false;
        return crypto.timingSafeEqual(sigBuf, expBuf);
      } catch {
        return false;
      }
    });
  } catch (e) {
    console.error('Erreur vérification signature Wave:', e);
    return false;
  }
}

export default createWaveCheckoutSession;
