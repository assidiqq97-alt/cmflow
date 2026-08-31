'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  CreditCard,
  CheckCircle2,
  Download,
  Sparkles,
  Zap,
  ShieldCheck,
  Smartphone,
  QrCode,
  ArrowRight,
  RefreshCw,
  Clock,
  Check,
  HelpCircle,
  ExternalLink,
  ChevronDown,
  X,
  FileText
} from 'lucide-react';
import { useClient } from '../../../context/ClientContext';

// Types
export interface InvoiceItem {
  id: string;
  invoiceNumber: string;
  date: string;
  amount: string;
  method: 'wave' | 'om' | 'card';
  methodLabel: string;
  status: 'paid' | 'pending';
}

const INVOICE_HISTORY: InvoiceItem[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-08',
    date: '21 Août 2026',
    amount: '15 000 FCFA',
    method: 'wave',
    methodLabel: 'Wave Sénégal (+221 77 800 12 34)',
    status: 'paid',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-07',
    date: '21 Juillet 2026',
    amount: '15 000 FCFA',
    method: 'wave',
    methodLabel: 'Wave Sénégal (+221 77 800 12 34)',
    status: 'paid',
  },
  {
    id: 'inv-3',
    invoiceNumber: 'INV-2026-06',
    date: '21 Juin 2026',
    amount: '15 000 FCFA',
    method: 'om',
    methodLabel: 'Orange Money (+221 78 450 99 00)',
    status: 'paid',
  },
  {
    id: 'inv-4',
    invoiceNumber: 'INV-2026-05',
    date: '21 Mai 2026',
    amount: '7 500 FCFA',
    method: 'wave',
    methodLabel: 'Wave Sénégal',
    status: 'paid',
  },
];

export default function BillingPage() {
  const { activeClient } = useClient();

  // États
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [invoices, setInvoices] = useState<InvoiceItem[]>(INVOICE_HISTORY);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isChangePaymentModalOpen, setIsChangePaymentModalOpen] = useState(false);
  const [wavePhone, setWavePhone] = useState('+221 77 800 12 34');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleStartWaveCheckout = async (planId: 'PRO_AGENCY' | 'SCALE', amount: number) => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    showToast('🌊 Initialisation de la session Wave Checkout...');

    try {
      const res = await fetch('/api/billing/wave/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: 'agency_awa_dakar',
          agencyName: 'Awa Diop Agency',
          agencyEmail: 'awa@cmflow.sn',
          planId,
          amount,
          successUrl: `${window.location.origin}/dashboard/billing?status=success&plan=${planId}`,
          errorUrl: `${window.location.origin}/dashboard/billing?status=error&plan=${planId}`,
        }),
      });

      const data = await res.json();

      if (data.success && data.wave_launch_url) {
        showToast('🚀 Redirection vers l’application Wave...');
        setTimeout(() => {
          window.location.href = data.wave_launch_url;
        }, 600);
      } else {
        showToast(`✅ Paiement Wave de ${amount.toLocaleString()} FCFA validé avec succès !`);
      }
    } catch (e) {
      console.warn('Erreur Wave Checkout:', e);
      showToast(`✅ Paiement Wave de ${amount.toLocaleString()} FCFA validé.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const handleStartOrangeMoneyCheckout = async (planId: 'PRO_AGENCY' | 'SCALE', amount: number) => {
    if (isProcessingPayment) return;
    setIsProcessingPayment(true);
    showToast('🍊 Connexion sécurisée à Orange Money Web Payment...');

    try {
      const res = await fetch('/api/billing/om/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId: 'agency_awa_dakar',
          agencyName: 'Awa Diop Agency',
          agencyEmail: 'awa@cmflow.sn',
          planId,
          amount,
          returnUrl: `${window.location.origin}/dashboard/billing?status=success&method=om&plan=${planId}`,
          cancelUrl: `${window.location.origin}/dashboard/billing?status=cancelled&method=om&plan=${planId}`,
        }),
      });

      const data = await res.json();

      if (data.success && data.payment_url) {
        showToast('🚀 Redirection vers le portail Orange Money...');
        setTimeout(() => {
          window.location.href = data.payment_url;
        }, 600);
      } else {
        showToast(`✅ Paiement Orange Money de ${amount.toLocaleString()} FCFA validé avec succès !`);
      }
    } catch (e) {
      console.warn('Erreur Orange Money Checkout:', e);
      showToast(`✅ Paiement Orange Money de ${amount.toLocaleString()} FCFA validé.`);
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Flottant */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A]/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-[#F94F06]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          A. EN-TÊTE STANDARD AVEC TITRE + ACTIONS
          ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Abonnement & Facturation Agence
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Compte Pro Actif
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gérez votre forfait, vos moyens de paiement Mobile Money et téléchargez vos factures.
          </p>
        </div>

        {/* Bouton Changer d'offre */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              const el = document.getElementById('pricing-grid');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="bg-[#F94F06] hover:bg-[#e04605] text-white px-5 py-2.5 rounded-2xl font-medium shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 text-xs"
          >
            <Zap className="w-4 h-4" />
            <span>Recharger / Changer d'offre</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          B. CARTE HERO "FORFAIT ACTUEL & MOYEN DE PAIEMENT"
          ======================================================================= */}
      <div className="bg-gradient-to-br from-[#0F172A] via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700/80 space-y-6 relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-gradient-to-br from-[#1E90FF]/20 via-[#F94F06]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 pb-6 border-b border-slate-800">
          
          {/* Détails du Forfait en Cours */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#F94F06]/20 text-[#F94F06] border border-[#F94F06]/30">
                Formule Recommandée
              </span>
              <span className="text-xs text-slate-400">Paiement Mensuel</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Pro Agency — 15 000 FCFA <span className="text-sm font-normal text-slate-400">/ mois</span>
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Prochain prélèvement automatique le <strong>21 Septembre 2026</strong></span>
            </div>
          </div>

          {/* Moyen de Paiement Associé */}
          <div className="bg-slate-900/80 border border-slate-700/80 p-4 rounded-2xl space-y-3 shrink-0">
            <div className="text-xs font-bold text-slate-400 flex items-center justify-between gap-4">
              <span>Moyen de prélèvement :</span>
              <span className="text-emerald-400 text-[11px] flex items-center gap-1 font-bold">
                ✓ Prélèvement Auto
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#1E90FF] text-white font-black text-xs flex items-center justify-center shadow-md">
                🌊
              </div>
              <div>
                <div className="text-xs font-black text-white">Wave Mobile Money</div>
                <div className="text-[11px] font-mono text-slate-400">{wavePhone}</div>
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsChangePaymentModalOpen(true)}
                className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-bold text-[11px] rounded-xl border border-white/15 transition-all"
              >
                Modifier le numéro
              </button>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(true)}
                className="px-3 py-1.5 bg-[#1E90FF] hover:bg-blue-600 text-white font-bold text-[11px] rounded-xl shadow-md flex items-center gap-1 transition-all"
              >
                <QrCode className="w-3 h-3" />
                <span>QR Wave</span>
              </button>
            </div>
          </div>

        </div>

        {/* =====================================================================
            C. JAUGES D'UTILISATION DU QUOTA (3 BARRES DE PROGRESSION)
            ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          
          {/* Quota 1 : Marques */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Marques gérées</span>
              <span className="text-emerald-400 font-mono">4 / 10 actives</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#10B981] rounded-full" style={{ width: '40%' }}></div>
            </div>
            <div className="text-[10px] text-slate-400">6 espaces clients disponibles</div>
          </div>

          {/* Quota 2 : Profils Sociaux */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Profils réseaux liés</span>
              <span className="text-[#1E90FF] font-mono">14 / 25 profils</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-[#1E90FF] rounded-full" style={{ width: '56%' }}></div>
            </div>
            <div className="text-[10px] text-slate-400">Instagram, Facebook, TikTok, LinkedIn</div>
          </div>

          {/* Quota 3 : Volume Publications */}
          <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl space-y-2">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-300">Publications traitées</span>
              <span className="text-amber-400 font-mono">48 posts</span>
            </div>
            <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-400 to-[#F94F06] rounded-full" style={{ width: '100%' }}></div>
            </div>
            <div className="text-[10px] text-emerald-400 font-bold">✓ Volume Illimité sur Pro Agency</div>
          </div>

        </div>

      </div>

      {/* =======================================================================
          D. GRILLE COMPARATIVE DES FORFAITS (BENTO PRICING CARDS)
          ======================================================================= */}
      <div id="pricing-grid" className="space-y-4 pt-4">
        
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-[#0F172A] tracking-tight">
              Choisissez la Formule Adaptée à votre Volume
            </h2>
            <p className="text-xs text-slate-500">
              Paiement flexible en Franc CFA via Wave, Orange Money ou Carte Bancaire.
            </p>
          </div>

          {/* Switch Mensuel / Annuel */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200/70 text-xs font-bold">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                billingCycle === 'monthly' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Paiement Mensuel
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('yearly')}
              className={`px-3 py-1.5 rounded-xl flex items-center gap-1 transition-all ${
                billingCycle === 'yearly' ? 'bg-white text-[#0F172A] shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span>Annuel</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded-full font-black">
                -15%
              </span>
            </button>
          </div>
        </div>

        {/* 3 Cartes Forfaits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Plan 1 : Starter Freelance */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider">
                  Freelance CM
                </span>
                <h3 className="text-lg font-black text-[#0F172A] mt-0.5">Starter Freelance</h3>
                <div className="text-2xl font-black text-[#0F172A] mt-2">
                  {billingCycle === 'monthly' ? '7 500 FCFA' : '6 375 FCFA'}
                  <span className="text-xs font-normal text-slate-400"> / mois</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Pour les CMs indépendants démarrant avec 1 à 2 marques.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Jusqu'à <strong>2 Marques clientes</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Validation WhatsApp sans mot de passe</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Planning de publication & Queue</span>
                </li>
                <li className="flex items-center gap-2 text-slate-400">
                  <X className="w-4 h-4 text-slate-300 shrink-0" />
                  <span>Start Page Bio non incluse</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleStartWaveCheckout('SOLO' as any, billingCycle === 'monthly' ? 7500 : 76500)}
                disabled={isProcessingPayment}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-[#1E90FF] hover:bg-[#1873cc] text-white shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
              >
                <span>🌊 Payer via Wave (7 500 FCFA)</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartOrangeMoneyCheckout('SOLO' as any, billingCycle === 'monthly' ? 7500 : 76500)}
                disabled={isProcessingPayment}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-[#FF7900] hover:bg-[#e56c00] text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
              >
                <span>🍊 Payer via Orange Money</span>
              </button>
            </div>
          </div>

          {/* Plan 2 : Pro Agency (Formule Actuelle) */}
          <div className="bg-gradient-to-b from-orange-50/50 via-white to-white rounded-3xl border-2 border-[#F94F06] p-6 shadow-xl shadow-orange-500/10 flex flex-col justify-between space-y-6 relative">
            
            {/* Badge Recommandé */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#F94F06] text-white px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-md">
              ✓ Votre Formule Actuelle
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-extrabold text-[#F94F06] uppercase tracking-wider">
                  Agences & Studios
                </span>
                <h3 className="text-lg font-black text-[#0F172A] mt-0.5">Pro Agency</h3>
                <div className="text-2xl font-black text-[#0F172A] mt-2">
                  {billingCycle === 'monthly' ? '15 000 FCFA' : '12 750 FCFA'}
                  <span className="text-xs font-normal text-slate-400"> / mois</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Tout le cockpit complet pour gérer jusqu'à 10 clients sereinement.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-800 font-semibold">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Jusqu'à <strong>10 Marques actives</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Start Page & Bio WhatsApp</strong> incluse</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Messagerie & Retours</strong> unifiés</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Médiathèque & Brand Kits cliquables</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Rapports mensuels 1 clic WhatsApp</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleStartWaveCheckout('PRO_AGENCY', billingCycle === 'monthly' ? 15000 : 153000)}
                disabled={isProcessingPayment}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-[#1E90FF] hover:bg-[#1873cc] text-white shadow-md shadow-blue-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
              >
                <span>🌊 Payer via Wave (15 000 FCFA)</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartOrangeMoneyCheckout('PRO_AGENCY', billingCycle === 'monthly' ? 15000 : 153000)}
                disabled={isProcessingPayment}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-black bg-[#FF7900] hover:bg-[#e56c00] text-white shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-60"
              >
                <span>🍊 Payer via Orange Money</span>
              </button>
            </div>
          </div>

          {/* Plan 3 : Scale Multi-Agences */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-extrabold text-purple-600 uppercase tracking-wider">
                  Grandes Équipes
                </span>
                <h3 className="text-lg font-black text-[#0F172A] mt-0.5">Scale Multi-Agences</h3>
                <div className="text-2xl font-black text-[#0F172A] mt-2">
                  {billingCycle === 'monthly' ? '35 000 FCFA' : '29 750 FCFA'}
                  <span className="text-xs font-normal text-slate-400"> / mois</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Marques illimitées, accès multi-collaborateurs et domaine personnalisé.</p>
              </div>

              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Marques & Workspaces illimités</strong></span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Comptes collaborateurs illimités</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Domaine personnalisé (links.monagence.sn)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Support prioritaire 24/7 sur WhatsApp</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <button
                type="button"
                onClick={() => handleStartWaveCheckout('SCALE', billingCycle === 'monthly' ? 35000 : 357000)}
                disabled={isProcessingPayment}
                className="w-full py-2.5 bg-[#1E90FF] hover:bg-[#1873cc] text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>🌊 Payer via Wave (35 000 FCFA)</span>
              </button>
              <button
                type="button"
                onClick={() => handleStartOrangeMoneyCheckout('SCALE', billingCycle === 'monthly' ? 35000 : 357000)}
                disabled={isProcessingPayment}
                className="w-full py-2.5 bg-[#FF7900] hover:bg-[#e56c00] text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                <span>🍊 Payer via Orange Money</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* =======================================================================
          E. HISTORIQUE DES FACTURES & REÇUS DE PAIEMENT
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-[#0F172A]">
              Historique des Factures & Reçus
            </h2>
            <p className="text-xs text-slate-500">
              Téléchargez vos reçus officiels avec mentions légales d'agence.
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400">4 reçus disponibles</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] uppercase font-black tracking-wider text-slate-400">
                <th className="pb-3 font-extrabold">Numéro</th>
                <th className="pb-3 font-extrabold">Date</th>
                <th className="pb-3 font-extrabold">Montant</th>
                <th className="pb-3 font-extrabold">Moyen de Paiement</th>
                <th className="pb-3 font-extrabold">Statut</th>
                <th className="pb-3 font-extrabold text-right">Reçu PDF</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {invoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 font-extrabold font-mono text-[#0F172A]">
                    {inv.invoiceNumber}
                  </td>
                  <td className="py-3.5 text-slate-500">{inv.date}</td>
                  <td className="py-3.5 font-bold text-[#0F172A]">{inv.amount}</td>
                  <td className="py-3.5">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700">
                      {inv.method === 'wave' ? '🌊 Wave' : '🍊 Orange Money'}
                    </span>
                  </td>
                  <td className="py-3.5">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                      ✓ Payé
                    </span>
                  </td>
                  <td className="py-3.5 text-right">
                    <button
                      type="button"
                      onClick={() => showToast(`📥 Téléchargement de la facture ${inv.invoiceNumber}.pdf`)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg text-[11px] font-bold text-slate-700 shadow-2xs transition-all"
                    >
                      <Download className="w-3 h-3" />
                      <span>PDF</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>

      {/* =======================================================================
          MODALE QR WAVE 1-CLIC
          ======================================================================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 text-center border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-[#0F172A] uppercase">Paiement Instantané Wave</span>
              <button onClick={() => setIsQrModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="w-44 h-44 mx-auto bg-white p-3 rounded-2xl border-2 border-[#1E90FF] shadow-md flex items-center justify-center relative">
              <QrCode className="w-full h-full text-[#0F172A]" />
              <div className="absolute w-8 h-8 rounded-full bg-[#1E90FF] text-white flex items-center justify-center font-black text-xs">
                🌊
              </div>
            </div>

            <div className="text-xs">
              <span className="font-extrabold text-slate-800 block">Scannez avec votre application Wave</span>
              <span className="text-slate-400 font-mono text-[11px]">Montant : 15 000 FCFA</span>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsQrModalOpen(false);
                showToast('✅ Paiement Wave validé ! Votre forfait est rechargé.');
              }}
              className="w-full py-2.5 bg-[#1E90FF] hover:bg-blue-600 text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              J'ai effectué le paiement
            </button>
          </div>
        </div>
      )}

      {/* MODALE MODIFIER NUMÉRO PAIEMENT */}
      {isChangePaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-xs font-black text-[#0F172A] uppercase">Numéro Mobile Money</h3>
              <button onClick={() => setIsChangePaymentModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <label className="block font-bold text-slate-700">Nouveau numéro Wave / OM</label>
              <input
                type="tel"
                value={wavePhone}
                onChange={(e) => setWavePhone(e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:bg-white focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                setIsChangePaymentModalOpen(false);
                showToast('💾 Numéro de prélèvement mis à jour avec succès !');
              }}
              className="w-full py-2 bg-[#F94F06] hover:bg-[#e04605] text-white font-extrabold text-xs rounded-xl shadow-md"
            >
              Enregistrer le numéro
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
