'use client';

import React, { useState } from 'react';
import { X, Sparkles, Clock, Check, Shield, Zap, Layers } from 'lucide-react';
import AdminService from '../../lib/adminService';
import { AdminAgency, AdminPlanType } from '../../types/admin';

interface ChangePlanModalProps {
  isOpen: boolean;
  agency: AdminAgency | null;
  onClose: () => void;
  onSuccess: (msg: string) => void;
}

export default function ChangePlanModal({
  isOpen,
  agency,
  onClose,
  onSuccess,
}: ChangePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<'solo' | 'pro' | 'scale' | 'trial'>(
    agency ? (agency.plan as any) : 'pro'
  );
  const [trialDays, setTrialDays] = useState<number>(7);
  const [activeTab, setActiveTab] = useState<'plan' | 'trial'>('plan');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen || !agency) return null;

  const handleChangePlan = () => {
    setIsLoading(true);
    try {
      const res = AdminService.changePlan(agency.id, selectedPlan as any);
      if (res.success) {
        onSuccess(res.message);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleExtendTrial = () => {
    setIsLoading(true);
    try {
      const res = AdminService.extendTrial(agency.id, trialDays);
      if (res.success) {
        onSuccess(res.message);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-[#F94F06] tracking-wider">
              Gestion de l'abonnement
            </span>
            <h3 className="text-lg font-black text-slate-900">{agency.agencyName}</h3>
            <p className="text-xs text-slate-500">{agency.ownerName} · {agency.phone}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Onglets : Changer Forfait OU Prolonger Trial */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl">
          <button
            type="button"
            onClick={() => setActiveTab('plan')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'plan'
                ? 'bg-[#F94F06] text-white shadow-md shadow-orange-500/25'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Changer de Formule</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('trial')}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'trial'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Prolonger Essai (+j)</span>
          </button>
        </div>

        {activeTab === 'plan' ? (
          <div className="space-y-4">
            <div className="text-xs font-medium text-slate-500">
              Choisissez la nouvelle formule tarifaire attribuée à cette agence :
            </div>

            <div className="space-y-2.5">
              {[
                {
                  id: 'solo',
                  name: 'Solo Starter / Freelance',
                  price: '3 500 FCFA / mois',
                  quota: 'Jusqu’à 3 marques / workspaces clients',
                  badge: 'Populaire ⚡',
                  badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
                  color: '#0284C7',
                },
                {
                  id: 'pro',
                  name: 'Pro Agency',
                  price: '15 000 FCFA / mois',
                  quota: '10 Workspaces clients + Publication Auto Meta',
                  badge: 'Recommandé 🔥',
                  badgeClass: 'bg-orange-50 text-[#F94F06] border-orange-200',
                  color: '#F94F06',
                },
                {
                  id: 'scale',
                  name: 'Scale Agence & Franchise',
                  price: '35 000 FCFA / mois',
                  quota: 'Workspaces Illimités (∞) + Marque Blanche Totale',
                  badge: 'Grands Comptes 🚀',
                  badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
                  color: '#7C3AED',
                },
                {
                  id: 'trial',
                  name: 'Essai Gratuit 14 Jours',
                  price: '0 FCFA (Gratuit)',
                  quota: '3 marques de test pour évaluation',
                  badge: 'Essai ⏳',
                  badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
                  color: '#D97706',
                },
              ].map((item) => {
                const isSelected = selectedPlan === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPlan(item.id as any)}
                    className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-orange-50/50 border-[#F94F06] ring-2 ring-[#F94F06]/30 shadow-xs'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">{item.name}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${item.badgeClass}`}>
                          {item.badge}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500">{item.quota}</div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-slate-900">{item.price}</div>
                      {isSelected && (
                        <span className="text-[11px] text-[#F94F06] font-bold">✓ Actif</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleChangePlan}
                disabled={isLoading}
                className="px-5 py-2.5 bg-[#F94F06] hover:bg-[#e04605] text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Mise à jour...' : 'Appliquer la Formule 💎'}
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-xs font-medium text-slate-500">
              Offrez du temps supplémentaire à l'agence pour tester toutes les fonctionnalités CMFlow :
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { days: 7, label: '+7 Jours Gratuits', desc: 'Prolongation d’une semaine' },
                { days: 14, label: '+14 Jours Gratuits', desc: 'Prolongation de deux semaines' },
              ].map((item) => (
                <div
                  key={item.days}
                  onClick={() => setTrialDays(item.days)}
                  className={`p-4 rounded-2xl border cursor-pointer text-center transition-all ${
                    trialDays === item.days
                      ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <div className="text-sm font-black">{item.label}</div>
                  <div className="text-[11px] opacity-75 mt-1">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleExtendTrial}
                disabled={isLoading}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all active:scale-[0.98] disabled:opacity-50"
              >
                {isLoading ? 'Prolongation...' : `Prolonger de +${trialDays} Jours ⏳`}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
