'use client';

import React, { useState } from 'react';
import { Loader2, ArrowRight } from 'lucide-react';

export interface OrangeMoneyButtonProps {
  planId: 'PRO_AGENCY' | 'SCALE';
  amount?: number;
  label?: string;
  className?: string;
  agencyId?: string;
  agencyName?: string;
  agencyEmail?: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function OrangeMoneyButton({
  planId,
  amount = 15000,
  label,
  className = '',
  agencyId = 'agency_awa_dakar',
  agencyName = 'Awa Diop Agency',
  agencyEmail = 'awa@cmflow.sn',
  onSuccess,
  onError,
}: OrangeMoneyButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const displayLabel = label || `Payer avec Orange Money (${amount.toLocaleString()} FCFA)`;

  const handleOMPayment = async () => {
    if (isLoading) return;
    setIsLoading(true);

    try {
      const response = await fetch('/api/billing/om/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          agencyName,
          agencyEmail,
          planId,
          amount,
          returnUrl: `${window.location.origin}/dashboard/billing?status=success&method=om&plan=${planId}`,
          cancelUrl: `${window.location.origin}/dashboard/billing?status=cancelled&method=om&plan=${planId}`,
        }),
      });

      const data = await response.json();

      if (data.success && data.payment_url) {
        if (onSuccess) onSuccess(data);
        setTimeout(() => {
          window.location.href = data.payment_url;
        }, 500);
      } else {
        throw new Error(data.message || 'Impossible d\'initialiser le paiement Orange Money.');
      }
    } catch (err: any) {
      console.error('Erreur OrangeMoneyButton:', err);
      if (onError) {
        onError(err);
      } else {
        alert(err?.message || 'Erreur lors de la connexion à Orange Money.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleOMPayment}
      disabled={isLoading}
      className={`bg-[#FF7900] hover:bg-[#e56c00] text-white px-5 py-2.5 rounded-2xl font-semibold shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 ${className}`}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-white" />
          <span>Connexion Orange Money...</span>
        </>
      ) : (
        <>
          <span className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center font-black text-[11px] text-white">
            🍊
          </span>
          <span>{displayLabel}</span>
          <ArrowRight className="w-3.5 h-3.5 opacity-80" />
        </>
      )}
    </button>
  );
}

export default OrangeMoneyButton;
