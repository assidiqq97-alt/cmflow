'use client';

import { useState, useEffect } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { getPlanById, PlanConfig, PlanFeatures } from '@/constants/plans';

export interface PlanLimits {
  // Identité du plan
  planId: string;
  plan: PlanConfig;

  // Quotas workspaces
  workspacesMax: number;
  workspacesUsed: number;
  workspacesRemaining: number;
  canAddWorkspace: boolean;
  workspacesPercent: number; // 0–100

  // Permissions features
  features: PlanFeatures;

  // États de chargement
  isLoading: boolean;
  isReady: boolean;

  // Données brutes agence
  agencyId: string | null;
  agencyName: string | null;
}

const DEFAULT_LIMITS: PlanLimits = {
  planId: 'solo',
  plan: getPlanById('solo'),
  workspacesMax: 3,
  workspacesUsed: 0,
  workspacesRemaining: 3,
  canAddWorkspace: true,
  workspacesPercent: 0,
  features: {
    metaPublish: true,
    tiktokLinkedin: false,
    teamManagement: false,
    whiteLabelBranding: false,
    advancedReports: false,
    vipSupport: false,
    collaborators: 0,
  },
  isLoading: true,
  isReady: false,
  agencyId: null,
  agencyName: null,
};

export function usePlanLimits(): PlanLimits {
  const [limits, setLimits] = useState<PlanLimits>(DEFAULT_LIMITS);

  useEffect(() => {
    // Essai depuis localStorage (fallback sans Firebase Auth)
    const localProfile = (() => {
      try {
        const raw = localStorage.getItem('cmflow_user_profile');
        return raw ? JSON.parse(raw) : null;
      } catch {
        return null;
      }
    })();

    if (localProfile?.plan) {
      const plan = getPlanById(localProfile.plan);
      const workspacesUsed = parseInt(localProfile.workspacesUsed ?? '0');
      const workspacesMax = plan.workspacesMax;
      setLimits({
        planId: plan.id,
        plan,
        workspacesMax,
        workspacesUsed,
        workspacesRemaining: Math.max(0, workspacesMax - workspacesUsed),
        canAddWorkspace: workspacesMax >= 999 || workspacesUsed < workspacesMax,
        workspacesPercent: workspacesMax >= 999 ? 0 : Math.round((workspacesUsed / workspacesMax) * 100),
        features: plan.permissions,
        isLoading: false,
        isReady: true,
        agencyId: localProfile.agencyId ?? null,
        agencyName: localProfile.agencyName ?? null,
      });
    }

    if (!auth || !db) return;

    // Écoute Firebase Auth → Firestore agency en temps réel
    const unsubAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        setLimits((prev) => ({ ...prev, isLoading: false, isReady: true }));
        return;
      }

      // Lit l'utilisateur pour obtenir son agencyId
      const userRef = doc(db!, 'users', user.uid);
      const unsubUser = onSnapshot(userRef, (userSnap) => {
        const userData = userSnap.data();
        const agencyId = userData?.agencyId;
        if (!agencyId) return;

        // Écoute le document d'agence en temps réel
        const agencyRef = doc(db!, 'agencies', agencyId);
        const unsubAgency = onSnapshot(agencyRef, (agencySnap) => {
          const agencyData = agencySnap.data();
          if (!agencyData) return;

          const plan = getPlanById(agencyData.planId ?? 'solo');
          const workspacesUsed = agencyData.workspacesUsed ?? 0;
          const workspacesMax = plan.workspacesMax;

          const newLimits: PlanLimits = {
            planId: plan.id,
            plan,
            workspacesMax,
            workspacesUsed,
            workspacesRemaining: Math.max(0, workspacesMax - workspacesUsed),
            canAddWorkspace: workspacesMax >= 999 || workspacesUsed < workspacesMax,
            workspacesPercent: workspacesMax >= 999 ? 0 : Math.round((workspacesUsed / workspacesMax) * 100),
            features: plan.permissions,
            isLoading: false,
            isReady: true,
            agencyId,
            agencyName: agencyData.name ?? null,
          };

          setLimits(newLimits);

          // Sync localStorage
          try {
            const existing = JSON.parse(localStorage.getItem('cmflow_user_profile') ?? '{}');
            localStorage.setItem('cmflow_user_profile', JSON.stringify({
              ...existing,
              plan: plan.id,
              agencyId,
              agencyName: agencyData.name,
              workspacesUsed,
            }));
          } catch { /* silent */ }
        });

        return () => unsubAgency();
      });

      return () => unsubUser();
    });

    return () => unsubAuth();
  }, []);

  return limits;
}

export default usePlanLimits;
