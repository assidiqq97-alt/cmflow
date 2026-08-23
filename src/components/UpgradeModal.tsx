'use client';

import React, { useState } from 'react';
import { X, ArrowRight, Zap, Lock, CheckCircle2, Loader2 } from 'lucide-react';
import { WaveLogo } from '@/components/icons/WaveLogo';
import { OrangeMoneyLogo } from '@/components/icons/OrangeMoneyLogo';
import { PlanConfig, formatPrice } from '@/constants/plans';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlanId: string;
  targetPlan: PlanConfig | null;
  featureName?: string | null;
  agencyId?: string | null;
  agencyEmail?: string | null;
  agencyPhone?: string | null;
}

export function UpgradeModal({
  isOpen,
  onClose,
  currentPlanId,
  targetPlan,
  featureName,
  agencyId,
  agencyEmail,
  agencyPhone,
}: UpgradeModalProps) {
  const [payMethod, setPayMethod] = useState<'WAVE' | 'ORANGE_MONEY'>('WAVE');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [isRedirecting, setIsRedirecting] = useState(false);

  if (!isOpen || !targetPlan) return null;

  const price = billingCycle === 'yearly' ? targetPlan.priceYearly : targetPlan.priceMonthly;

  const handlePay = async () => {
    setIsRedirecting(true);

    const sessionData = {
      agencyId: agencyId ?? 'agency_' + Date.now(),
      plan: targetPlan.id,
      amount: price,
      method: payMethod,
      cycle: billingCycle,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem('cmflow_pending_payment', JSON.stringify(sessionData));
    localStorage.setItem('cmflow_active_plan', targetPlan.id);

    const returnBase = typeof window !== 'undefined' ? window.location.origin : '';
    const returnUrl = `${returnBase}/billing.html?status=success&plan=${targetPlan.id}&method=${payMethod === 'WAVE' ? 'wave' : 'om'}`;
    const cancelUrl = `${returnBase}${window.location.pathname}`;

    // Tentative API
    try {
      const endpoint =
        payMethod === 'WAVE' ? '/api/billing/wave/checkout' : '/api/billing/om/checkout';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: sessionData.agencyId,
          agencyEmail: agencyEmail ?? '',
          phone: agencyPhone ?? '',
          planId: targetPlan.id.toUpperCase(),
          amount: price,
          returnUrl,
          cancelUrl,
        }),
      });
      const data = await res.json();
      if (data?.success) {
        const url = data.wave_launch_url || data.payment_url;
        if (url) { window.location.href = url; return; }
      }
    } catch { /* fallback */ }

    // Fallback billing instructions
    const params = new URLSearchParams({
      status: 'pending',
      plan: targetPlan.id,
      method: payMethod === 'WAVE' ? 'wave' : 'om',
      amount: String(price),
      email: agencyEmail ?? '',
    });
    window.location.href = `/billing.html?${params.toString()}`;
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[#0F172A] to-slate-800 p-7 pb-6">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 rounded-xl hover:bg-white/10"
            aria-label="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#F94F06]/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#F94F06]" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#F94F06]">
              Mise à niveau requise
            </span>
          </div>

          {featureName && (
            <p className="text-sm text-slate-300 mb-3 flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span>
                <strong className="text-white">{featureName}</strong> est réservé au forfait{' '}
                <strong className="text-[#F94F06]">{targetPlan.name}</strong>.
              </span>
            </p>
          )}

          <h2 className="text-xl font-black text-white">
            Passer au forfait{' '}
            <span className="text-[#F94F06]">{targetPlan.name}</span>
          </h2>

          {/* Prix dynamique */}
          <div className="flex items-baseline gap-1.5 mt-2">
            <span className="text-3xl font-black text-white">{formatPrice(price)}</span>
            <span className="text-xs text-slate-400 font-semibold">
              {billingCycle === 'yearly' ? '/ an' : '/ mois'}
            </span>
          </div>

          {/* Toggle cycle */}
          <div className="flex items-center gap-2 mt-3">
            {(['monthly', 'yearly'] as const).map((c) => (
              <button
                key={c}
                onClick={() => setBillingCycle(c)}
                className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all ${
                  billingCycle === c
                    ? 'bg-[#F94F06] text-white'
                    : 'bg-white/10 text-slate-400 hover:bg-white/15'
                }`}
              >
                {c === 'monthly' ? 'Mensuel' : 'Annuel'}
                {c === 'yearly' && (
                  <span className="ml-1 bg-emerald-400/20 text-emerald-300 text-[9px] px-1 py-0.5 rounded-full">
                    -2 mois
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Features incluses */}
        <div className="px-7 py-5 border-b border-slate-100">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
            Inclus dans {targetPlan.name} :
          </p>
          <ul className="space-y-2">
            {targetPlan.features.slice(0, 4).map((f, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Sélecteur de paiement */}
        <div className="px-7 py-5">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
            Méthode de paiement :
          </p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {/* Wave */}
            <button
              onClick={() => setPayMethod('WAVE')}
              className={`p-3.5 rounded-2xl border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                payMethod === 'WAVE'
                  ? 'border-[#1DC2EC] bg-cyan-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <WaveLogo size={28} />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Wave</div>
                <div className="text-[10px] text-slate-500">1% frais • 1-clic</div>
              </div>
              {payMethod === 'WAVE' && (
                <CheckCircle2 className="w-4 h-4 text-[#1DC2EC] ml-auto shrink-0" />
              )}
            </button>

            {/* Orange Money */}
            <button
              onClick={() => setPayMethod('ORANGE_MONEY')}
              className={`p-3.5 rounded-2xl border-2 flex items-center gap-2.5 transition-all cursor-pointer ${
                payMethod === 'ORANGE_MONEY'
                  ? 'border-[#FF7900] bg-orange-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <OrangeMoneyLogo size={28} />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-800">Orange Money</div>
                <div className="text-[10px] text-slate-500">UEMOA • OTP</div>
              </div>
              {payMethod === 'ORANGE_MONEY' && (
                <CheckCircle2 className="w-4 h-4 text-[#FF7900] ml-auto shrink-0" />
              )}
            </button>
          </div>

          {/* CTA principal */}
          <button
            onClick={handlePay}
            disabled={isRedirecting}
            className="w-full py-4 rounded-2xl font-black text-sm bg-[#F94F06] hover:bg-[#e04605] text-white shadow-xl shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {isRedirecting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Redirection en cours...
              </>
            ) : (
              <>
                Payer {formatPrice(price)} via{' '}
                {payMethod === 'WAVE' ? 'Wave 🌊' : 'Orange Money 🍊'}
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <p className="text-center text-[10px] text-slate-400 mt-3">
            🔒 Paiement sécurisé • Activation immédiate • Annulation 1 clic
          </p>
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
