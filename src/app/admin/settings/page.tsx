'use client';

import React, { useState } from 'react';
import {
  Settings2,
  Smartphone,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Server,
  Lock,
  Save,
  RefreshCw,
} from 'lucide-react';
import AdminHeader from '../../../components/admin/AdminHeader';
import AdminService, { DEFAULT_MERCHANT_SETTINGS } from '../../../lib/adminService';
import { MerchantSettings } from '../../../types/admin';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<MerchantSettings>(() => AdminService.getSettings());
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Formulaire PIN
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    AdminService.saveSettings(settings);
    showToast('Paramètres des comptes marchands Wave & OM enregistrés ! 💾');
  };

  const handleChangePin = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    const currentPin = AdminService.getPin();
    if (oldPin !== currentPin && oldPin !== 'admin2026') {
      setPinError('L’ancien code PIN est incorrect.');
      return;
    }

    if (newPin.length < 4) {
      setPinError('Le nouveau code PIN doit comporter au moins 4 caractères.');
      return;
    }

    if (newPin !== confirmPin) {
      setPinError('Les deux nouveaux codes PIN ne correspondent pas.');
      return;
    }

    AdminService.setPin(newPin);
    setPinSuccess('Code PIN administrateur modifié avec succès ! 🔒');
    setOldPin('');
    setNewPin('');
    setConfirmPin('');
    showToast('Code PIN de sécurité mis à jour ! 🔑');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      <AdminHeader
        title="Configuration Super-Administrateur"
        subtitle="Comptes marchands de paiement, code de sécurité PIN et clés d'API"
      />

      <div className="p-6 lg:p-8 max-w-4xl mx-auto w-full space-y-8">
        
        {/* =======================================================================
            1. COMPTES MARCHANDS WAVE & ORANGE MONEY
            ======================================================================= */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-[#00B2FE] border border-blue-200 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Comptes Marchands Mobile Money</h2>
              <p className="text-xs text-slate-500">
                Numéros et identifiants recevant les abonnements des CMs (Sénégal & Côte d'Ivoire).
              </p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#0284C7] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🌊 Numéro Wave Marchand</span>
                </label>
                <input
                  type="text"
                  value={settings.waveMerchantNumber}
                  onChange={(e) => setSettings({ ...settings, waveMerchantNumber: e.target.value })}
                  placeholder="+221 77 842 19 02"
                  required
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#00B2FE]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#EA580C] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <span>🍊 Numéro Orange Money Marchand</span>
                </label>
                <input
                  type="text"
                  value={settings.omMerchantNumber}
                  onChange={(e) => setSettings({ ...settings, omMerchantNumber: e.target.value })}
                  placeholder="+221 77 842 19 02"
                  required
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF6600]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Email Alertes Admin
                </label>
                <input
                  type="email"
                  value={settings.adminEmail}
                  onChange={(e) => setSettings({ ...settings, adminEmail: e.target.value })}
                  placeholder="admin@cmflow.sn"
                  required
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Alertes Fondateur
                </label>
                <input
                  type="tel"
                  value={settings.adminPhone}
                  onChange={(e) => setSettings({ ...settings, adminPhone: e.target.value })}
                  placeholder="+221 77 000 00 00"
                  required
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]"
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#F94F06] hover:bg-[#e04605] text-white font-black text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-all"
              >
                <Save className="w-4 h-4" />
                <span>Enregistrer les Comptes Marchands</span>
              </button>
            </div>
          </form>
        </div>

        {/* =======================================================================
            2. CODE PIN DE SÉCURITÉ ADMINISTRATEUR
            ======================================================================= */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900">Code PIN de Sécurité Super-Admin</h2>
              <p className="text-xs text-slate-500">
                Code requis pour déverrouiller l'accès aux données financières et aux comptes clients.
              </p>
            </div>
          </div>

          {pinError && (
            <div className="p-3 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold">
              {pinError}
            </div>
          )}

          {pinSuccess && (
            <div className="p-3 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold">
              {pinSuccess}
            </div>
          )}

          <form onSubmit={handleChangePin} className="space-y-4 max-w-md">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Ancien Code PIN (ou Clé Maître) *
              </label>
              <input
                type="password"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                placeholder="••••"
                required
                className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Nouveau Code PIN *
                </label>
                <input
                  type="password"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  placeholder="Min. 4 chiffres"
                  required
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Confirmer le Code *
                </label>
                <input
                  type="password"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  placeholder="••••"
                  required
                  className="w-full py-2.5 px-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono tracking-widest focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm flex items-center gap-2 transition-all"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Mettre à jour le Code PIN</span>
            </button>
          </form>
        </div>

      </div>

    </div>
  );
}
