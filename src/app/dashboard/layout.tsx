'use client';

import React from 'react';
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

      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Conteneur Principal ── */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen bg-gradient-to-br from-slate-50 via-slate-100/40 to-slate-50 overflow-y-auto relative">
        {/* Halos d'ambiance */}
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-br from-blue-100/30 via-purple-50/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute -bottom-32 left-1/3 w-[450px] h-[450px] bg-gradient-to-tr from-orange-100/20 via-amber-50/20 to-transparent rounded-full blur-3xl" />
        </div>

        {/* ── Top Bar ── */}
        <header className="sticky top-0 z-30 backdrop-blur-xl bg-white/75 border-b border-slate-200/70 px-6 md:px-8 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400 hidden sm:inline-flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F94F06]" />
              CMFlow SaaS Platform
            </div>
          </div>

          <div className="flex items-center gap-3">
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

        {/* ── Contenu des pages ── */}
        <main className="flex-1 relative z-10">
          {children}
        </main>
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
