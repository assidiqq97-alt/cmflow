// ============================================================
// CMFlow — Configuration Centralisée des Forfaits
// Utilisé par : PricingSection, Register, Dashboard, hooks
// ============================================================

export interface PlanFeatures {
  metaPublish: boolean;
  tiktokLinkedin: boolean;
  teamManagement: boolean;
  whiteLabelBranding: boolean;
  advancedReports: boolean;
  vipSupport: boolean;
  collaborators: number; // 0 = non inclus
}

export interface PlanConfig {
  id: 'solo' | 'pro' | 'scale';
  name: string;
  badge: string;
  badgeStyle: 'popular' | 'recommended' | 'enterprise';
  priceMonthly: number;
  priceYearly: number;
  workspacesMax: number; // 999 = illimité
  description: string;
  features: string[];
  permissions: PlanFeatures;
  ctaText: string;
  highlight: boolean;
  borderColor: string;
}

export const PLANS_CONFIG: PlanConfig[] = [
  {
    id: 'solo',
    name: 'Solo / Freelance',
    badge: 'Offre Populaire ⚡',
    badgeStyle: 'popular',
    priceMonthly: 3500,
    priceYearly: 35000,
    workspacesMax: 3,
    description: 'Tout le nécessaire pour gérer vos premiers clients et automatiser vos validations.',
    features: [
      '3 Workspaces clients inclus',
      'Publications illimitées (Carrousels, Reels, Posts)',
      'Portail de validation WhatsApp interactif',
      'Publication automatique Instagram & Facebook',
      'Rapports PDF mensuels automatiques',
      'Support réactif par WhatsApp',
    ],
    permissions: {
      metaPublish: true,
      tiktokLinkedin: false,
      teamManagement: false,
      whiteLabelBranding: false,
      advancedReports: false,
      vipSupport: false,
      collaborators: 0,
    },
    ctaText: "Démarrer avec l'offre Solo",
    highlight: false,
    borderColor: '#E2E8F0',
  },
  {
    id: 'pro',
    name: 'Pro Agency',
    badge: 'Recommandé 🔥',
    badgeStyle: 'recommended',
    priceMonthly: 15000,
    priceYearly: 150000,
    workspacesMax: 10,
    description: 'La formule clé en main pour les agences gérant un portefeuille actif de marques.',
    features: [
      '10 Workspaces clients inclus',
      'Tout ce qui est dans Solo',
      'Publication TikTok & LinkedIn',
      '3 Comptes collaborateurs / CM inclus',
      'Rapports PDF personnalisés avec stats avancées',
      'Support prioritaire 7j/7',
    ],
    permissions: {
      metaPublish: true,
      tiktokLinkedin: true,
      teamManagement: true,
      whiteLabelBranding: false,
      advancedReports: true,
      vipSupport: false,
      collaborators: 3,
    },
    ctaText: 'Choisir la Formule Pro',
    highlight: true,
    borderColor: '#F94F06',
  },
  {
    id: 'scale',
    name: 'Scale Agence',
    badge: 'Grands Comptes',
    badgeStyle: 'enterprise',
    priceMonthly: 35000,
    priceYearly: 350000,
    workspacesMax: 999,
    description: 'Pour les structures en pleine expansion avec besoins multi-équipes.',
    features: [
      'Workspaces clients illimités',
      'Tout ce qui est dans Pro',
      'Marque Blanche Totale (votre logo sur le portail client)',
      'Équipe & rôles CM illimités',
      'Intégration API & Webhooks sur mesure',
      'Onboarding VIP & Responsable de compte dédié',
    ],
    permissions: {
      metaPublish: true,
      tiktokLinkedin: true,
      teamManagement: true,
      whiteLabelBranding: true,
      advancedReports: true,
      vipSupport: true,
      collaborators: 999,
    },
    ctaText: 'Passer à Scale',
    highlight: false,
    borderColor: '#1E293B',
  },
];

// Map id → config (accès O(1))
export const PLANS_MAP = PLANS_CONFIG.reduce<Record<string, PlanConfig>>(
  (acc, plan) => ({ ...acc, [plan.id]: plan }),
  {}
);

// Alias rétrocompatibilité
(PLANS_MAP as Record<string, PlanConfig>)['starter'] = PLANS_MAP['solo'];

// Helpers
export function getPlanById(id: string): PlanConfig {
  return PLANS_MAP[id] ?? PLANS_MAP['solo'];
}

export function getUpgradePlan(currentId: string): PlanConfig | null {
  const order: PlanConfig['id'][] = ['solo', 'pro', 'scale'];
  const idx = order.indexOf(currentId as PlanConfig['id']);
  if (idx === -1 || idx >= order.length - 1) return null;
  return PLANS_MAP[order[idx + 1]];
}

export function formatPrice(amount: number): string {
  return amount.toLocaleString('fr-FR') + ' FCFA';
}

export default PLANS_CONFIG;
