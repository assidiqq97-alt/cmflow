'use client';

import React from 'react';
import Link from 'next/link';
import {
  ShieldCheck,
  Lock,
  ArrowLeft,
  RefreshCw,
  Sparkles,
  Search,
  CheckCircle2,
} from 'lucide-react';

interface AdminHeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  onLockSession?: () => void;
  isRefreshing?: boolean;
}

export default function AdminHeader({
  title = 'Cockpit Financier & Métriques Clés',
  subtitle = 'Supervision du MRR en FCFA, des flux Wave/OM et des nouveaux forfaits',
  onRefresh,
  onLockSession,
  isRefreshing = false,
}: AdminHeaderProps) {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4 shadow-[0_1px_3px_0_rgba(0,0,0,0.02)]">
      
      {/* Titre & Sous-titre */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black tracking-tight text-slate-900 truncate">
              {title}
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-orange-50 text-[#F94F06] border border-orange-200 tracking-wider">
              FONDATEUR
            </span>
          </div>
          <p className="text-xs text-slate-500 hidden md:block truncate mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Barre de Recherche Globale & Actions */}
      <div className="flex items-center gap-3 shrink-0">
        
        {/* Barre de Recherche */}
        <div className="relative hidden md:block w-64 lg:w-72">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher une agence, email..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
          />
        </div>

        {/* Statut Système & Webhooks */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/60 text-emerald-700 text-xs font-bold">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Système Opérationnel · Wave & OM</span>
        </div>

        {/* Bouton Actualiser */}
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isRefreshing}
            className="px-3 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs transition-all flex items-center gap-1.5 text-xs font-semibold disabled:opacity-50"
            title="Actualiser les données"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#F94F06]' : 'text-slate-500'}`} />
            <span className="hidden sm:inline">Actualiser</span>
          </button>
        )}

        {/* Bouton Verrouiller */}
        {onLockSession && (
          <button
            type="button"
            onClick={onLockSession}
            className="p-2 rounded-xl bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200 hover:border-rose-200 shadow-xs transition-all text-xs font-bold"
            title="Verrouiller la session"
          >
            <Lock className="w-4 h-4" />
          </button>
        )}

        {/* Avatar Administrateur */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F94F06] to-amber-500 flex items-center justify-center text-white text-xs font-black shadow-sm">
            👑
          </div>
        </div>

      </div>

    </header>
  );
}
