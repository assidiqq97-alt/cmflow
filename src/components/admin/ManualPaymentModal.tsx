'use client';

import React, { useState } from 'react';
import { X, Receipt, CheckCircle2, DollarSign, Smartphone } from 'lucide-react';
import AdminService from '../../lib/adminService';
import { AdminAgency, AdminTransaction } from '../../types/admin';

interface ManualPaymentModalProps {
  isOpen: boolean;
  agencies: AdminAgency[];
  selectedAgencyId?: string;
  onClose: () => void;
  onSuccess: (tx: AdminTransaction, msg: string) => void;
}

export default function ManualPaymentModal({
  isOpen,
  agencies,
  selectedAgencyId,
  onClose,
  onSuccess,
}: ManualPaymentModalProps) {
  const [agencyId, setAgencyId] = useState(selectedAgencyId || (agencies[0]?.id ?? ''));
  const [planId, setPlanId] = useState<'solo' | 'pro' | 'scale'>('pro');
  const [amount, setAmount] = useState<number>(15000);
  const [channel, setChannel] = useState<'wave' | 'om' | 'card' | 'manual'>('wave');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handlePlanChange = (p: 'solo' | 'pro' | 'scale') => {
    setPlanId(p);
    if (p === 'solo') setAmount(3500);
    if (p === 'pro') setAmount(15000);
    if (p === 'scale') setAmount(35000);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyId) return;

    setIsLoading(true);
    try {
      const res = AdminService.createManualTransaction({
        agencyId,
        channel,
        amount: Number(amount),
        planId,
        notes: notes.trim() || undefined,
      });

      if (res.success && res.transaction) {
        onSuccess(res.transaction, res.message);
        onClose();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#111827] border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Validation Manuelle / Nouveau Paiement</h3>
              <p className="text-xs text-slate-400">Débloque immédiatement le forfait de l'agence sélectionnée.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Sélection Agence */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Agence Bénéficiaire *
            </label>
            <select
              value={agencyId}
              onChange={(e) => setAgencyId(e.target.value)}
              required
              className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {agencies.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.agencyName} ({a.ownerName}) — {a.phone}
                </option>
              ))}
            </select>
          </div>

          {/* Sélection du Forfait */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Forfait à Débloquer
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              {[
                { id: 'solo', name: 'Solo / Freelance', price: 3500 },
                { id: 'pro', name: 'Pro Agency', price: 15000 },
                { id: 'scale', name: 'Scale Agence', price: 35000 },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => handlePlanChange(item.id as any)}
                  className={`p-3 rounded-2xl border cursor-pointer text-center transition-all ${
                    planId === item.id
                      ? 'bg-emerald-500/20 border-emerald-500 text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-black text-white">{item.name}</div>
                  <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
                    {item.price.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Canal de Paiement & Montant */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Canal d'Encaissement
              </label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as any)}
                className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="wave">🌊 Wave Mobile Money</option>
                <option value="om">🍊 Orange Money</option>
                <option value="card">💳 Carte Bancaire / Visa</option>
                <option value="manual">💵 Espèces / Virement Direct</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Montant Encaissé (FCFA) *
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min={0}
                step={500}
                required
                className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Notes internes */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Référence / Motif du déblocage
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Paiement direct Wave reçu au numéro marchand fondateur"
              className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isLoading ? 'Validation...' : 'Valider & Débloquer Immédiatement ⚡'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
