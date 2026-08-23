'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight, ShieldCheck, Zap, Building2, Crown } from 'lucide-react';
import { PLANS_CONFIG, PlanConfig, formatPrice } from '@/constants/plans';
import { WaveLogo } from '@/components/icons/WaveLogo';
import { OrangeMoneyLogo } from '@/components/icons/OrangeMoneyLogo';

const BADGE_ICONS: Record<string, React.ReactNode> = {
  popular: <Zap className="w-3 h-3" />,
  recommended: <Sparkles className="w-3 h-3" />,
  enterprise: <Crown className="w-3 h-3" />,
};

export function PricingSection() {
  const [isYearly, setIsYearly] = useState(false);
  const cycle = isYearly ? 'yearly' : 'monthly';

  return (
    <section className="py-20 px-4 bg-[#F8FAFC] relative" id="pricing">
      <div className="max-w-6xl mx-auto space-y-12">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-[#F94F06] text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Tarification Accessible & Transparente
          </div>
          <h2 className="text-3xl md:text-5xl font-black tracking-tight text-[#0F172A]">
            Des forfaits taillés pour<br className="hidden md:block" /> vos ambitions
          </h2>
          <p className="text-sm md:text-base text-slate-500 font-semibold">
            Paiement direct <strong>Wave</strong> et <strong>Orange Money</strong> en FCFA.
            Sans engagement.
          </p>

          {/* ── Toggle Mensuel / Annuel ── */}
          <div className="pt-4 flex items-center justify-center gap-3">
            <span
              className={`text-xs md:text-sm font-bold transition-colors ${
                !isYearly ? 'text-[#0F172A]' : 'text-slate-400'
              }`}
            >
              Mensuel
            </span>

            <button
              type="button"
              onClick={() => setIsYearly(!isYearly)}
              aria-label="Basculer entre mensuel et annuel"
              className="relative w-14 h-7 rounded-full transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#F94F06]"
              style={{ background: isYearly ? '#F94F06' : '#CBD5E1' }}
            >
              <span
                className="absolute top-1 left-1 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                style={{ transform: isYearly ? 'translateX(28px)' : 'translateX(0)' }}
              />
            </button>

            <span
              className={`text-xs md:text-sm font-bold flex items-center gap-2 transition-colors ${
                isYearly ? 'text-[#0F172A]' : 'text-slate-400'
              }`}
            >
              Annuel
              <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-full">
                -2 mois offerts
              </span>
            </span>
          </div>
        </div>

        {/* ── Grille des 3 Forfaits ─────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-stretch">
          {PLANS_CONFIG.map((plan: PlanConfig) => {
            const price = isYearly ? plan.priceYearly : plan.priceMonthly;
            const isHighlighted = plan.highlight;
            const href = `/register?plan=${plan.id}&cycle=${cycle}`;

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl flex flex-col justify-between transition-all duration-300 ${
                  isHighlighted
                    ? 'bg-white shadow-2xl shadow-orange-500/15 md:-translate-y-3'
                    : 'bg-white shadow-sm hover:shadow-lg'
                }`}
                style={{
                  border: isHighlighted
                    ? `2px solid ${plan.borderColor}`
                    : '1px solid #E2E8F0',
                }}
              >
                {/* Badge flottant */}
                {plan.badge && (
                  <div
                    className={`absolute -top-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-4 py-1.5 rounded-full shadow-lg ${
                      isHighlighted
                        ? 'bg-[#F94F06] text-white'
                        : plan.badgeStyle === 'enterprise'
                        ? 'bg-[#0F172A] text-slate-200'
                        : 'bg-slate-800 text-slate-200'
                    }`}
                  >
                    {BADGE_ICONS[plan.badgeStyle]}
                    {plan.badge}
                  </div>
                )}

                <div className="p-8 space-y-6">
                  {/* Titre & description */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-black text-[#0F172A]">{plan.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">{plan.description}</p>
                  </div>

                  {/* Prix */}
                  <div className="flex items-baseline gap-1.5">
                    <span
                      className="text-3xl lg:text-4xl font-black tracking-tight"
                      style={{ color: isHighlighted ? '#F94F06' : '#0F172A' }}
                    >
                      {formatPrice(price)}
                    </span>
                    <span className="text-xs text-slate-400 font-semibold">
                      {isYearly ? '/ an' : '/ mois'}
                    </span>
                  </div>

                  {/* Features */}
                  <div className="border-t border-slate-100 pt-5 space-y-2.5">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-600">
                        <div className="w-4 h-4 rounded-full bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                        </div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA — Link Next.js → page d'inscription */}
                <div className="px-8 pb-8">
                  <Link
                    href={href}
                    className={`w-full py-3.5 px-5 rounded-2xl font-black text-xs tracking-wide transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] ${
                      isHighlighted
                        ? 'bg-[#F94F06] hover:bg-[#e04605] text-white shadow-lg shadow-orange-500/30'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
                    }`}
                  >
                    {plan.ctaText}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Badges de réassurance ─────────────────────────── */}
        <div className="text-center pt-2">
          <div className="inline-flex flex-wrap items-center justify-center gap-4 text-xs md:text-sm text-slate-500 bg-white border border-slate-200 px-6 py-3 rounded-2xl shadow-xs">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              14 jours d&apos;essai inclus
            </span>
            <span className="text-slate-300">•</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <WaveLogo size={20} />
              Wave
            </span>
            <span className="text-slate-300">&amp;</span>
            <span className="flex items-center gap-1.5 font-semibold">
              <OrangeMoneyLogo size={20} />
              Orange Money
            </span>
            <span className="text-slate-300">•</span>
            <span>Sans engagement</span>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PricingSection;
