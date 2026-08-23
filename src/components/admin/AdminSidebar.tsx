'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Receipt,
  Settings2,
  ArrowLeft,
  Lock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Zap,
} from 'lucide-react';

interface AdminSidebarProps {
  onLockSession: () => void;
  mrrText?: string;
  activeCount?: number;
}

export const ADMIN_NAV_ITEMS = [
  {
    name: "Vue d'ensemble",
    href: '/admin',
    icon: LayoutDashboard,
    badge: 'Live',
    badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
  },
  {
    name: 'Agences & CM',
    href: '/admin/agencies',
    icon: Building2,
    badge: null,
    badgeColor: '',
  },
  {
    name: 'Transactions Mobile Money',
    href: '/admin/transactions',
    icon: Receipt,
    badge: 'Wave / OM',
    badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  {
    name: 'Paramètres Système',
    href: '/admin/settings',
    icon: Settings2,
    badge: null,
    badgeColor: '',
  },
];

export default function AdminSidebar({
  onLockSession,
  mrrText = '3 345 000 FCFA',
  activeCount = 188,
}: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-72 flex-shrink-0 bg-[#0F172A] text-slate-300 flex flex-col justify-between border-r border-slate-800 min-h-screen sticky top-0 h-screen select-none z-40">
      
      {/* Haut : Header & Navigation */}
      <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
        
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/80">
          <div className="flex items-center justify-between">
            <Link href="/admin" className="inline-flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#F94F06] via-orange-500 to-amber-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-orange-500/25 group-hover:scale-105 transition-transform">
                ⚡
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-lg tracking-tight text-white">CMFlow</span>
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-xs tracking-wider">
                    SUPER ADMIN
                  </span>
                </div>
                <span className="text-[11px] font-medium text-slate-400">Cockpit Fondateur 👑</span>
              </div>
            </Link>
          </div>

          {/* Mini Widget MRR Flottant */}
          <div className="mt-4 p-3 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">MRR Collecté</div>
              <div className="text-sm font-black text-amber-400 font-mono">{mrrText}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Agences Payantes</div>
              <div className="text-xs font-bold text-emerald-400 font-mono">{activeCount} actives</div>
            </div>
          </div>
        </div>

        {/* Menu Navigation */}
        <nav className="p-3.5 space-y-1 flex-1">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Supervision & Gestion
          </div>

          {ADMIN_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname?.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-[#F94F06] text-white shadow-md shadow-orange-500/25 font-bold'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>

                {item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : item.badgeColor || 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bas : Profil Super-Admin & Liens Rapides */}
      <div className="p-3.5 border-t border-slate-800/80 bg-slate-900/60 space-y-2">
        
        {/* Retour rapide à l'espace Dashboard CM */}
        <Link
          href="/dashboard"
          className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all border border-slate-700/60"
        >
          <ArrowLeft className="w-3.5 h-3.5 text-orange-400" />
          <span>Retour Espace CM</span>
        </Link>

        {/* Profil Administrateur & Verrouillage */}
        <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-white text-xs font-black shrink-0">
              S
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate">Super Admin</div>
              <div className="text-[10px] text-slate-400 truncate">admin@cmflow.sn</div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLockSession}
            title="Verrouiller la session admin"
            className="p-1.5 rounded-lg hover:bg-rose-500/20 text-slate-400 hover:text-rose-300 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

    </aside>
  );
}
