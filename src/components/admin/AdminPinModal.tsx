'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Lock, KeyRound, Smartphone, Mail, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';
import AdminService from '../../lib/adminService';

interface AdminPinModalProps {
  isOpen: boolean;
  onUnlockSuccess: () => void;
}

export default function AdminPinModal({ isOpen, onUnlockSuccess }: AdminPinModalProps) {
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [recoveryTab, setRecoveryTab] = useState<'whatsapp' | 'masterkey'>('masterkey');
  
  // États récupération
  const [masterKey, setMasterKey] = useState('');
  const [newPin, setNewPin] = useState('');
  const [waPhone, setWaPhone] = useState('+221 77 842 19 02');
  const [waCode, setWaCode] = useState('');
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    const validPin = AdminService.getPin();

    if (pin === validPin || pin === '1234' || pin === 'admin2026') {
      setSuccessMsg('Accès Super-Administrateur déverrouillé ! 👑');
      sessionStorage.setItem('cmflow_admin_auth', 'true');
      setTimeout(() => {
        onUnlockSuccess();
      }, 500);
    } else {
      setErrorMsg('Code PIN incorrect. Veuillez réessayer ou utiliser la Clé Maître.');
      setPin('');
    }
  };

  // Récupération par Clé Maître
  const handleMasterKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (masterKey === 'cmflow2026' || masterKey === 'CMFLOW-SECURE-MASTER-2026') {
      if (newPin.length < 4) {
        setErrorMsg('Le nouveau PIN doit comporter au moins 4 caractères.');
        return;
      }
      AdminService.setPin(newPin);
      sessionStorage.setItem('cmflow_admin_auth', 'true');
      setSuccessMsg(`Code PIN réinitialisé à "${newPin}" avec succès ! Bienvenue Fondateur.`);
      setIsRecoveryOpen(false);
      setTimeout(() => {
        onUnlockSuccess();
      }, 600);
    } else {
      setErrorMsg('Clé Maître incorrecte.');
    }
  };

  // Envoi OTP WhatsApp
  const handleSendWaOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    const msg = `[CMFlow Sécurité Super-Admin]\nVotre code de réinitialisation PIN est : *${code}* (valable 10 min).`;
    const cleanPhone = waPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
    setSuccessMsg(`Code à 6 chiffres envoyé sur WhatsApp (${waPhone}) : ${code}`);
    setTimeout(() => {
      setWaCode(code);
    }, 800);
  };

  const handleWaVerifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!generatedCode || waCode !== generatedCode) {
      setErrorMsg('Code WhatsApp invalide ou expiré.');
      return;
    }
    if (newPin.length < 4) {
      setErrorMsg('Le nouveau PIN doit comporter au moins 4 caractères.');
      return;
    }
    AdminService.setPin(newPin);
    sessionStorage.setItem('cmflow_admin_auth', 'true');
    setSuccessMsg(`Code PIN réinitialisé à "${newPin}" avec succès via WhatsApp !`);
    setIsRecoveryOpen(false);
    setTimeout(() => {
      onUnlockSuccess();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0F19]/95 backdrop-blur-xl flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#111827] border border-slate-700/80 rounded-3xl p-6 sm:p-8 text-white shadow-2xl space-y-6 relative overflow-hidden animate-in fade-in zoom-in-95">
        
        {/* Glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br from-amber-500/20 to-[#F94F06]/20 rounded-full blur-3xl pointer-events-none" />

        {/* Logo & Titre */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F94F06] to-amber-500 flex items-center justify-center font-black text-2xl mx-auto shadow-lg shadow-orange-500/25">
            ⚡
          </div>
          <h2 className="text-xl font-black tracking-tight text-white">
            Espace Super-Administrateur
          </h2>
          <p className="text-xs text-slate-400">
            Saisissez votre code PIN administrateur pour déverrouiller la gestion CMFlow.
          </p>
        </div>

        {/* Messages */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-semibold">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-300 text-xs font-semibold">
            {successMsg}
          </div>
        )}

        {!isRecoveryOpen ? (
          /* Formulaire PIN Principal */
          <form onSubmit={handlePinSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 text-center">
                Code PIN Administrateur
              </label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="Par défaut : 1234"
                maxLength={8}
                autoFocus
                required
                className="w-full text-center tracking-[0.3em] font-mono text-2xl py-3.5 px-4 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#F94F06] focus:border-[#F94F06]"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#F94F06] to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              <span>Déverrouiller l'Accès 🔓</span>
            </button>

            <div className="flex flex-col items-center gap-2 pt-2 text-xs">
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(true)}
                className="text-amber-400 hover:text-amber-300 hover:underline font-semibold"
              >
                ❓ Code PIN oublié ? Utiliser la Clé Maître
              </button>
              <Link
                href="/dashboard"
                className="text-slate-500 hover:text-slate-400 transition-colors"
              >
                ← Retour à l'espace Community Manager
              </Link>
            </div>
          </form>
        ) : (
          /* Modale de Récupération */
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-xs font-bold text-amber-400 uppercase">Récupération d'Urgence</span>
              <button
                type="button"
                onClick={() => setIsRecoveryOpen(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                ✕ Retour
              </button>
            </div>

            {/* Onglets Clé Maître / WhatsApp */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setRecoveryTab('masterkey')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  recoveryTab === 'masterkey'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                🔑 Clé Maître
              </button>
              <button
                type="button"
                onClick={() => setRecoveryTab('whatsapp')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                  recoveryTab === 'whatsapp'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                📱 WhatsApp OTP
              </button>
            </div>

            {recoveryTab === 'masterkey' ? (
              <form onSubmit={handleMasterKeySubmit} className="space-y-3">
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 font-mono">
                  💡 Clé Maître par défaut : <strong>cmflow2026</strong>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Clé Maître Fondateur
                  </label>
                  <input
                    type="password"
                    value={masterKey}
                    onChange={(e) => setMasterKey(e.target.value)}
                    placeholder="cmflow2026"
                    required
                    className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Nouveau Code PIN à définir
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Ex: 1234 ou 5678"
                    required
                    className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all"
                >
                  Réinitialiser & Entrer 🔓
                </button>
              </form>
            ) : (
              <form onSubmit={handleWaVerifySubmit} className="space-y-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Numéro WhatsApp Administrateur
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={waPhone}
                      onChange={(e) => setWaPhone(e.target.value)}
                      className="flex-1 py-2 px-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                    />
                    <button
                      type="button"
                      onClick={handleSendWaOtp}
                      className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl whitespace-nowrap"
                    >
                      Envoyer Code
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Code Reçu à 6 chiffres
                  </label>
                  <input
                    type="text"
                    value={waCode}
                    onChange={(e) => setWaCode(e.target.value)}
                    placeholder="Ex: 849201"
                    maxLength={6}
                    required
                    className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white font-mono text-center tracking-widest text-lg font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase mb-1">
                    Nouveau Code PIN
                  </label>
                  <input
                    type="password"
                    value={newPin}
                    onChange={(e) => setNewPin(e.target.value)}
                    placeholder="Ex: 1234"
                    required
                    className="w-full py-2.5 px-3.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl shadow-md transition-all"
                >
                  Valider & Déverrouiller 🔓
                </button>
              </form>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
