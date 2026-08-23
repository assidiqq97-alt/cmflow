'use client';

import React, { useState } from 'react';
import { X, Building2, User, Mail, Phone, Sparkles } from 'lucide-react';
import AdminService from '../../lib/adminService';
import { AdminAgency } from '../../types/admin';

interface AddAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (agency: AdminAgency, msg: string) => void;
}

export default function AddAgencyModal({ isOpen, onClose, onSuccess }: AddAgencyModalProps) {
  const [agencyName, setAgencyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+221 ');
  const [plan, setPlan] = useState<'trial' | 'solo' | 'pro' | 'scale'>('trial');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agencyName.trim() || !email.trim() || !phone.trim()) return;

    setIsLoading(true);
    try {
      const res = AdminService.addAgency({
        agencyName: agencyName.trim(),
        ownerName: ownerName.trim() || agencyName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        plan,
      });

      if (res.success && res.agency) {
        onSuccess(res.agency, res.message);
        onClose();
        // Reset
        setAgencyName('');
        setOwnerName('');
        setEmail('');
        setPhone('+221 ');
        setPlan('trial');
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
            <div className="w-10 h-10 rounded-2xl bg-[#F94F06]/20 text-[#F94F06] border border-[#F94F06]/30 flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Ajouter un Community Manager</h3>
              <p className="text-xs text-slate-400">Création manuelle d'un compte agence dans la base CMFlow.</p>
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nom de l'Agence *
              </label>
              <input
                type="text"
                value={agencyName}
                onChange={(e) => setAgencyName(e.target.value)}
                placeholder="Ex: Ndao Digital Agency"
                required
                className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F94F06]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Nom & Prénom du CM *
              </label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                placeholder="Ex: Ibrahima Ndao"
                required
                className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F94F06]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Email Professionnel *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ibrahima@ndaodigital.sn"
                required
                className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F94F06]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Numéro WhatsApp *
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 999 88 77"
                required
                className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F94F06]"
              />
            </div>
          </div>

          {/* Choix du Forfait Initial */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
              Forfait Initial Attribué
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'trial', name: 'Essai 14j', price: '0 FCFA', badge: 'Gratuit' },
                { id: 'solo', name: 'Solo', price: '3 500 FCFA', badge: '1-3 marques' },
                { id: 'pro', name: 'Pro Agency', price: '15 000 FCFA', badge: 'Top Agences' },
                { id: 'scale', name: 'Scale', price: '35 000 FCFA', badge: 'Grands Comptes' },
              ].map((item) => (
                <div
                  key={item.id}
                  onClick={() => setPlan(item.id as any)}
                  className={`p-3 rounded-2xl border cursor-pointer transition-all ${
                    plan === item.id
                      ? 'bg-gradient-to-b from-[#F94F06]/20 to-[#F94F06]/5 border-[#F94F06] text-white shadow-md'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <div className="text-xs font-black text-white">{item.name}</div>
                  <div className="text-[11px] font-mono text-amber-400 mt-0.5">{item.price}</div>
                  <div className="text-[9px] text-slate-400 uppercase mt-1">{item.badge}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Boutons d'Action */}
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
              className="px-5 py-2.5 bg-[#F94F06] hover:bg-[#e04605] text-white font-extrabold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isLoading ? 'Enregistrement...' : 'Enregistrer le Compte'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
