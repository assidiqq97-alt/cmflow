'use client';

import { useState, useCallback } from 'react';
import { getUpgradePlan, PlanConfig } from '@/constants/plans';

export interface UpgradeModalState {
  isOpen: boolean;
  currentPlanId: string;
  targetPlan: PlanConfig | null;
  featureName: string | null; // ex: "TikTok & LinkedIn"
}

export function useUpgradeModal() {
  const [state, setState] = useState<UpgradeModalState>({
    isOpen: false,
    currentPlanId: 'solo',
    targetPlan: null,
    featureName: null,
  });

  const openUpgrade = useCallback(
    (currentPlanId: string, featureName?: string) => {
      const targetPlan = getUpgradePlan(currentPlanId);
      setState({
        isOpen: true,
        currentPlanId,
        targetPlan,
        featureName: featureName ?? null,
      });
    },
    []
  );

  const closeUpgrade = useCallback(() => {
    setState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    ...state,
    openUpgrade,
    closeUpgrade,
  };
}

export default useUpgradeModal;
