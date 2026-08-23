export const PLANS_CONFIG = [
  {
    id: 'solo',
    name: 'Solo / Freelance',
    badge: 'Offre Populaire ⚡',
    priceMonthly: 3500,
    priceYearly: 35000,
    workspaces: 3,
    description: 'Tout le nécessaire pour gérer vos premiers clients et automatiser vos validations.',
    features: [
      '3 Workspaces clients inclus',
      'Publications illimitées (Carrousels, Reels, Posts)',
      'Portail de validation WhatsApp interactif',
      'Publication automatique Instagram & Facebook',
      'Rapports d’analyse PDF mensuels automatiques',
      'Support réactif par WhatsApp'
    ],
    ctaText: 'Démarrer avec l’offre Solo',
    highlight: false
  },
  {
    id: 'pro',
    name: 'Pro Agency',
    badge: 'Recommandé 🔥',
    priceMonthly: 15000,
    priceYearly: 150000,
    workspaces: 10,
    description: 'La formule clé en main pour les agences et CM gérant un portefeuille actif de marques.',
    features: [
      '10 Workspaces clients inclus',
      'Tout ce qui est dans Solo',
      'Publication TikTok & LinkedIn',
      '3 Comptes collaborateurs / CM inclus',
      'Rapports PDF personnalisés avec stats avancées',
      'Support prioritaire 7j/7'
    ],
    ctaText: 'Choisir la Formule Pro',
    highlight: true
  },
  {
    id: 'scale',
    name: 'Scale Agence',
    badge: 'Grands Comptes',
    priceMonthly: 35000,
    priceYearly: 350000,
    workspaces: 999,
    description: 'Pour les structures et agences en pleine expansion avec besoins multi-équipes.',
    features: [
      'Workspaces clients illimités',
      'Tout ce qui est dans Pro',
      'Marque Blanche Totale (votre logo sur le portail client)',
      'Équipe & rôles CM illimités',
      'Intégration API & Webhooks sur mesure',
      'Onboarding VIP & Responsable de compte dédié'
    ],
    ctaText: 'Passer à Scale',
    highlight: false
  }
];

export const PLANS_MAP = PLANS_CONFIG.reduce((acc, plan) => {
  acc[plan.id] = plan;
  return acc;
}, {});

PLANS_MAP.starter = PLANS_MAP.solo;

export default PLANS_CONFIG;
