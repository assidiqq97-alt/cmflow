'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Calendar, Users, CreditCard, Plus, Layers, ShieldCheck, Sparkles } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import WorkspaceSelector from '../../components/WorkspaceSelector';
import { RealtimeListener } from '../../components/RealtimeListener';
import { WorkspaceProvider } from '../../context/WorkspaceContext';
import { PlanProvider, usePlan } from '../../context/PlanContext';
import { UpgradeModal } from '../../components/UpgradeModal';
import { WorkspaceCounter } from '../../components/WorkspaceCounter';

// ──────────────────────────────────────────────────────────────
// Connecteur interne : consomme PlanContext pour afficher
// la modale d'upgrade et le compteur de workspaces
// ──────────────────────────────────────────────────────────────
function DashboardInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const {
    planId,
    plan,
    workspacesUsed,
    workspacesMax,
    upgradeModalOpen,
    upgradeTargetPlan,
    upgradeFeatureName,
    closeUpgrade,
    openUpgrade,
    agencyId,
  } = usePlan();

  return (
    <div className="flex min-h-screen bg-[#F8FAFC] font-sans antialiased text-[#0F172A]">
      {/* Notifications & webhooks en temps réel */}
      <RealtimeListener />

      {/* ── Sidebar (Desktop fixe / Mobile tiroir glissant) ── */}
      <Sidebar
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* ── Conteneur Principal ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/40 to-slate-50 overflow-y-auto relative">
        {/* Halos d'ambiance */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/30 via-purple-50/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-gradient-to-tr from-orange-100/20 via-amber-50/20 to-transparent rounded-full blur-3xl" />
        </div>

        {/* ── Top Bar Responsive ── */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/80 border-b border-slate-200/70 px-4 sm:px-6 md:px-8 py-3 flex items-center justify-between gap-3">
          
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Bouton Hamburger sur Mobile */}
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-2xl text-slate-700 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/80 border border-slate-200/60 transition-colors shrink-0"
              aria-label="Ouvrir le menu"
            >
              <Menu className="w-5 h-5 text-[#0F172A]" />
            </button>

            {/* Logo Mobile / Titre Desktop */}
            <div className="flex items-center gap-2 min-w-0">
              <span className="lg:hidden w-7 h-7 rounded-xl bg-gradient-to-tr from-[#F94F06] to-amber-500 flex items-center justify-center font-black text-white text-xs shadow-xs shrink-0">
                ⚡
              </span>
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-500 hidden sm:inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#F94F06]" />
                CMFlow Cockpit
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Compteur de workspaces compact dans la topbar */}
            {!plan.permissions.whiteLabelBranding && (
              <div
                className="hidden md:flex items-center gap-2 bg-slate-100 border border-slate-200 rounded-xl px-3 py-1.5 text-xs cursor-pointer hover:bg-slate-200 transition-colors"
                onClick={() => {
                  if (workspacesUsed >= workspacesMax) {
                    openUpgrade(planId, 'un workspace supplémentaire');
                  }
                }}
              >
                <span className="font-semibold text-slate-600">Workspaces</span>
                <span
                  className={`font-black ${
                    workspacesUsed >= workspacesMax
                      ? 'text-rose-500'
                      : workspacesUsed / workspacesMax >= 0.8
                      ? 'text-amber-500'
                      : 'text-emerald-600'
                  }`}
                >
                  {workspacesUsed} / {workspacesMax >= 999 ? '∞' : workspacesMax}
                </span>
                {/* Mini barre */}
                {workspacesMax < 999 && (
                  <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        workspacesUsed >= workspacesMax
                          ? 'bg-rose-500'
                          : workspacesUsed / workspacesMax >= 0.8
                          ? 'bg-amber-400'
                          : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, Math.round((workspacesUsed / workspacesMax) * 100))}%`,
                      }}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Badge forfait actif */}
            <div
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-orange-50 border border-orange-200 text-[10px] font-black text-[#F94F06] cursor-pointer"
              onClick={() => openUpgrade(planId)}
              title="Changer de forfait"
            >
              {plan.name}
              {planId !== 'scale' && (
                <span className="text-slate-400">↑</span>
              )}
            </div>

            <WorkspaceSelector variant="topbar" />
          </div>
        </header>

        {/* ── Contenu des pages (Espace réservé en bas sur mobile pour la Bottom Bar) ── */}
        <main className="flex-1 relative z-10 pb-20 lg:pb-0">
          {children}
        </main>

        {/* ── BARRE DE NAVIGATION INFÉRIEURE SUR MOBILE (Bottom Tab Bar iOS/Android) ── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-t border-slate-200/90 px-3 py-2 flex items-center justify-around shadow-[0_-8px_25px_-5px_rgba(15,23,42,0.08)]">
          <Link
            href="/dashboard/calendar"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all ${
              pathname === '/dashboard' || pathname === '/dashboard/calendar'
                ? 'text-[#F94F06] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-bold">Planning</span>
          </Link>

          <Link
            href="/dashboard/clients"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all ${
              pathname === '/dashboard/clients'
                ? 'text-[#F94F06] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Users className="w-5 h-5" />
            <span className="text-[10px] font-bold">Clients</span>
          </Link>

          {/* Bouton Central Action Rapide Nouveau Poste */}
          <Link
            href="/dashboard/calendar"
            className="flex flex-col items-center justify-center -mt-5"
          >
            <div className="w-12 h-12 rounded-full bg-[#F94F06] text-white shadow-lg shadow-orange-500/35 flex items-center justify-center font-black active:scale-95 transition-transform">
              <Plus className="w-6 h-6 stroke-[3]" />
            </div>
            <span className="text-[10px] font-extrabold text-[#F94F06] mt-0.5">Nouveau</span>
          </Link>

          <Link
            href="/dashboard/billing"
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-2xl transition-all ${
              pathname === '/dashboard/billing'
                ? 'text-[#F94F06] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <CreditCard className="w-5 h-5" />
            <span className="text-[10px] font-bold">Forfaits</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen(true)}
            className="flex flex-col items-center gap-1 px-3 py-1 rounded-2xl text-slate-500 hover:text-slate-900 transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
            <span className="text-[10px] font-bold">Menu</span>
          </button>
        </nav>
      </div>

      {/* ── Modale d'upgrade globale ── */}
      <UpgradeModal
        isOpen={upgradeModalOpen}
        onClose={closeUpgrade}
        currentPlanId={planId}
        targetPlan={upgradeTargetPlan}
        featureName={upgradeFeatureName}
        agencyId={agencyId}
      />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────
// Layout export : enroule WorkspaceProvider + PlanProvider
// ──────────────────────────────────────────────────────────────
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <PlanProvider>
        <DashboardInner>{children}</DashboardInner>
      </PlanProvider>
    </WorkspaceProvider>
  );
}
