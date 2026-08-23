'use client';

import React from 'react';
import { Clock, MessageCircle, AlertCircle, ArrowLeft, ShieldAlert, Sparkles, RefreshCw } from 'lucide-react';
import Link from 'next/link';

export default function ApprovalExpiredPage() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-between text-[#0F172A] font-sans antialiased relative overflow-hidden selection:bg-[#F94F06] selection:text-white">
      
      {/* Background Soft Glows */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Minimaliste */}
      <header className="w-full border-b border-slate-200/70 bg-white/80 backdrop-blur-xl sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F94F06] to-amber-500 flex items-center justify-center text-white font-black text-xs shadow-md shadow-orange-500/20">
              CM
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-900">
              CMFlow <span className="text-[#F94F06] font-normal text-xs ml-1">Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-500/10 px-3 py-1.5 rounded-full border border-amber-500/20">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Lien expiré</span>
          </div>
        </div>
      </header>

      {/* Contenu Principal Centré */}
      <main className="flex-1 flex items-center justify-center p-6 my-8">
        <div className="w-full max-w-lg bg-white border border-slate-200/80 rounded-3xl p-8 sm:p-10 shadow-[0_12px_40px_-8px_rgba(15,23,42,0.08)] text-center relative overflow-hidden">
          
          {/* Badge Icon */}
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-amber-500/10 border border-amber-500/25 text-amber-500 mb-6 shadow-lg shadow-amber-500/10 relative">
            <Clock className="w-10 h-10" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-4 w-4 bg-amber-500 items-center justify-center text-[9px] text-white font-black">!</span>
            </span>
          </div>

          {/* Titre & Message */}
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-3">
            Lien de validation expiré
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed max-w-md mx-auto mb-8">
            Pour garantir la sécurité et la fraîcheur de vos contenus, ce lien magique WhatsApp n'est valide que pendant <strong className="text-slate-900 font-semibold">48 heures</strong>. Ce délai est désormais dépassé.
          </p>

          {/* Encadré d'information */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left text-xs text-slate-600 mb-8 space-y-2">
            <div className="flex items-start gap-2.5 text-slate-700 font-semibold">
              <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>Vos publications sont en sécurité dans votre espace agence.</span>
            </div>
            <p className="text-slate-500 pl-6.5 text-[11px]">
              Aucune publication n'a été modifiée ou publiée sans votre consentement explicite.
            </p>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <a
              href="https://wa.me/221778421902?text=Bonjour%20!%20Mon%20lien%20de%20validation%20CMFlow%20a%20expir%C3%A9.%20Pourriez-vous%20m%27en%20g%C3%A9n%C3%A9rer%20un%20nouveau%20s%27il%20vous%20pla%C3%AEt%20%3F%20%F0%9F%9A%80"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4 fill-white" />
              <span>Demander un nouveau lien sur WhatsApp</span>
            </a>

            <Link
              href="/login"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-xs font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Accéder à l'espace Community Manager</span>
            </Link>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-200/70 bg-white py-4 text-center text-xs text-slate-400">
        <p>© 2026 CMFlow • La plateforme tout-en-un des Community Managers d'Afrique</p>
      </footer>
    </div>
  );
}
