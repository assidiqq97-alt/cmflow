'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePlanLimits, PlanLimits } from '@/hooks/usePlanLimits';
import { useUpgradeModal } from '@/hooks/useUpgradeModal';
import { PlanConfig } from '@/constants/plans';

// ============================================================
// Types du contexte
// ============================================================

interface PlanContextValue extends PlanLimits {
  // Modale d'upgrade
  upgradeModalOpen: boolean;
  upgradeTargetPlan: PlanConfig | null;
  upgradeFeatureName: string | null;
  openUpgrade: (currentPlanId: string, featureName?: string) => void;
  closeUpgrade: () => void;

  // Vérification rapide d'une feature (retourne false + ouvre modale si bloqué)
  requireFeature: (
    featureKey: keyof PlanLimits['features'],
    featureName?: string
  ) => boolean;

  // Vérification quota workspace
  requireWorkspace: () => boolean;
}

const PlanContext = createContext<PlanContextValue | null>(null);

// ============================================================
// Provider
// ============================================================

export function PlanProvider({ children }: { children: ReactNode }) {
  const limits = usePlanLimits();
  const {
    isOpen: upgradeModalOpen,
    targetPlan: upgradeTargetPlan,
    featureName: upgradeFeatureName,
    openUpgrade,
    closeUpgrade,
  } = useUpgradeModal();

  // Helper : vérifie si la feature est disponible, sinon ouvre la modale
  const requireFeature = (
    featureKey: keyof PlanLimits['features'],
    featureName?: string
  ): boolean => {
    if (limits.features[featureKey]) return true;
    openUpgrade(limits.planId, featureName);
    return false;
  };

  // Helper : vérifie si on peut ajouter un workspace, sinon ouvre la modale
  const requireWorkspace = (): boolean => {
    if (limits.canAddWorkspace) return true;
    openUpgrade(limits.planId, 'un workspace supplémentaire');
    return false;
  };

  return (
    <PlanContext.Provider
      value={{
        ...limits,
        upgradeModalOpen,
        upgradeTargetPlan,
        upgradeFeatureName,
        openUpgrade,
        closeUpgrade,
        requireFeature,
        requireWorkspace,
      }}
    >
      {children}
    </PlanContext.Provider>
  );
}

// ============================================================
// Hook consommateur
// ============================================================

export function usePlan(): PlanContextValue {
  const ctx = useContext(PlanContext);
  if (!ctx) {
    throw new Error('usePlan must be used within a <PlanProvider>');
  }
  return ctx;
}

export default PlanProvider;
