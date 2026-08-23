'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface SocialNetworkMetrics {
  connected: boolean;
  followers: string;
  followersChange: string;
  impressions: string;
  engagement: string;
  secondaryMetricName: string;
  secondaryMetricValue: string;
  breakdown: { label: string; percent: number; color: string }[];
}

export interface TopPostItem {
  id: string;
  rank: number;
  rankBadge: string;
  title: string;
  network: string;
  networkBadge: string;
  thumbnail: string;
  date: string;
  views: string;
  likes: number;
  comments: number;
  shares: number;
  engagementRate: string;
}

export interface ChartDataPoint {
  day: string;
  impressions: number;
  reach: number;
  engagement: number;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  country: string;
  flag: string;
  industry: string;
  category: string; // compatibility
  avatar: string;
  logo: string;
  plan: 'Starter' | 'Pro' | 'Enterprise' | 'Scale';
  whatsappNumber: string;
  whatsapp: string; // compatibility
  approvalRate: number; // compatibility
  monthlyGoal: number; // compatibility
  brandKit: {
    colors: {
      primary: string;
      secondary: string;
      accent: string;
    };
    typography: string;
    hashtags: string[];
  };
  globalMetrics: {
    totalAudience: string;
    audienceChange: string;
    totalImpressions: string;
    impressionsChange: string;
    engagementRate: string;
    engagementStatus: string;
    completedPosts: number;
    validationRate: string;
  };
  networks: {
    instagram: SocialNetworkMetrics;
    facebook: SocialNetworkMetrics;
    tiktok: SocialNetworkMetrics;
    linkedin: SocialNetworkMetrics;
  };
  color?: string;
  whatsappClient?: string;
  socialMetrics?: {
    instagram?: Partial<SocialNetworkMetrics>;
    facebook?: Partial<SocialNetworkMetrics>;
    tiktok?: Partial<SocialNetworkMetrics>;
    linkedin?: Partial<SocialNetworkMetrics>;
  };
  chartData: ChartDataPoint[];
  topPosts: TopPostItem[];
}

export type WorkspaceData = Workspace;
export type Client = Workspace;

export const WORKSPACES_DATA: Workspace[] = [
  {
    id: 'teranga-gourmet',
    name: 'Teranga Gourmet',
    slug: 'teranga_gourmet',
    country: 'Sénégal',
    flag: '🇸🇳',
    industry: 'Haute Gastronomie & Traiteur Événementiel',
    category: 'Haute Gastronomie & Traiteur',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    plan: 'Scale',
    whatsappNumber: '+221 77 842 19 02',
    whatsapp: '+221 77 842 19 02',
    approvalRate: 98,
    monthlyGoal: 24,
    brandKit: {
      colors: {
        primary: '#F94F06',
        secondary: '#0F172A',
        accent: '#10B981',
      },
      typography: 'Plus Jakarta Sans',
      hashtags: ['#TerangaGourmet', '#DakarFood', '#CuisineSenegalaise', '#ThiebRoyal', '#BrunchDakar'],
    },
    globalMetrics: {
      totalAudience: '53.7K',
      audienceChange: '+1.8K ce mois (+3.4%)',
      totalImpressions: '164.4K',
      impressionsChange: '+22.4% vs M-1',
      engagementRate: '5.8%',
      engagementStatus: 'Performant (Moy. 3.2%)',
      completedPosts: 24,
      validationRate: '100% validés WhatsApp',
    },
    networks: {
      instagram: {
        connected: true,
        followers: '14.2K',
        followersChange: '+420 ce mois',
        impressions: '82.4K',
        engagement: '5.6%',
        secondaryMetricName: 'Enregistrements',
        secondaryMetricValue: '840 saves',
        breakdown: [
          { label: 'Reels', percent: 50, color: 'bg-gradient-to-r from-pink-500 to-rose-500' },
          { label: 'Stories', percent: 30, color: 'bg-purple-400' },
          { label: 'Posts', percent: 20, color: 'bg-slate-300' },
        ],
      },
      facebook: {
        connected: true,
        followers: '28.5K',
        followersChange: '+180 mentions J\'aime',
        impressions: '45.1K',
        engagement: '4.2%',
        secondaryMetricName: 'Clics sur le lien',
        secondaryMetricValue: '312 clics',
        breakdown: [
          { label: 'Photos', percent: 45, color: 'bg-blue-600' },
          { label: 'Vidéos', percent: 35, color: 'bg-blue-400' },
          { label: 'Liens', percent: 20, color: 'bg-slate-300' },
        ],
      },
      tiktok: {
        connected: true,
        followers: '8.9K',
        followersChange: '+1.2K followers',
        impressions: '124.0K',
        engagement: '8.1%',
        secondaryMetricName: 'Taux de rétention',
        secondaryMetricValue: '42% moyen',
        breakdown: [
          { label: 'Recettes courtes', percent: 65, color: 'bg-[#0F172A]' },
          { label: 'Coulisses Cuisine', percent: 35, color: 'bg-emerald-500' },
        ],
      },
      linkedin: {
        connected: false,
        followers: '0',
        followersChange: 'Non configuré',
        impressions: '0',
        engagement: '0%',
        secondaryMetricName: 'CTR Global',
        secondaryMetricValue: '0%',
        breakdown: [],
      },
    },
    chartData: [
      { day: '01 Août', impressions: 3200, reach: 2400, engagement: 210 },
      { day: '03 Août', impressions: 4100, reach: 3100, engagement: 290 },
      { day: '06 Août', impressions: 3800, reach: 2900, engagement: 260 },
      { day: '09 Août', impressions: 5600, reach: 4200, engagement: 410 },
      { day: '12 Août', impressions: 4900, reach: 3800, engagement: 340 },
      { day: '14 Août', impressions: 8400, reach: 6800, engagement: 720 },
      { day: '17 Août', impressions: 6200, reach: 4900, engagement: 480 },
      { day: '19 Août', impressions: 7800, reach: 6100, engagement: 620 },
      { day: '21 Août', impressions: 9800, reach: 8100, engagement: 890 },
      { day: '24 Août', impressions: 6900, reach: 5400, engagement: 530 },
      { day: '27 Août', impressions: 7400, reach: 5900, engagement: 580 },
      { day: '30 Août', impressions: 8600, reach: 6900, engagement: 690 },
    ],
    topPosts: [
      {
        id: 'top-tg-1',
        rank: 1,
        rankBadge: '🏆 #1 Meilleur Reach',
        title: 'Reel : La véritable recette du Thiéboudienne Royal Penda Mbaye',
        network: 'Instagram Reel',
        networkBadge: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-600 border border-pink-500/20',
        thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        date: '14 Août 2026',
        views: '48.2k',
        likes: 2420,
        comments: 184,
        shares: 320,
        engagementRate: '8.4%',
      },
      {
        id: 'top-tg-2',
        rank: 2,
        rankBadge: '🥈 #2 Plus Partagé',
        title: 'Carrousel : Formule Brunch Dimanche & Cocktails Bissap Frais',
        network: 'Facebook & IG',
        networkBadge: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
        thumbnail: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=600&auto=format&fit=crop&q=80',
        date: '18 Août 2026',
        views: '24.1k',
        likes: 1280,
        comments: 96,
        shares: 180,
        engagementRate: '6.9%',
      },
      {
        id: 'top-tg-3',
        rank: 3,
        rankBadge: '🥉 #3 Plus Viral',
        title: 'Vidéo : Coulisses de la préparation des pastels au mérou frais',
        network: 'TikTok Video',
        networkBadge: 'bg-slate-900/5 text-slate-900 border border-slate-900/15',
        thumbnail: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=600&auto=format&fit=crop&q=80',
        date: '20 Août 2026',
        views: '62.4k',
        likes: 4850,
        comments: 312,
        shares: 410,
        engagementRate: '7.5%',
      },
    ],
  },
  {
    id: 'sira-cosmetiques',
    name: 'Sira Cosmétiques Bio',
    slug: 'sira_cosmetiques',
    country: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    industry: 'Skincare Naturel, Beauté & Soins Capillaires',
    category: 'Skincare & Beauté Naturelle',
    avatar: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&auto=format&fit=crop&q=80',
    plan: 'Pro',
    whatsappNumber: '+225 07 48 92 10 33',
    whatsapp: '+225 07 48 92 10 33',
    approvalRate: 95,
    monthlyGoal: 32,
    brandKit: {
      colors: {
        primary: '#EC4899',
        secondary: '#8B5CF6',
        accent: '#10B981',
      },
      typography: 'Outfit',
      hashtags: ['#SiraCosmetiques', '#BeauteAfricaine', '#SkincareBio', '#AbidjanBeauty', '#CheveuxNaturels'],
    },
    globalMetrics: {
      totalAudience: '89.4K',
      audienceChange: '+6.4K ce mois (+7.7%)',
      totalImpressions: '312.8K',
      impressionsChange: '+41.2% vs M-1',
      engagementRate: '7.4%',
      engagementStatus: 'Exceptionnel (Moy. 3.5%)',
      completedPosts: 32,
      validationRate: '98% validés WhatsApp',
    },
    networks: {
      instagram: {
        connected: true,
        followers: '36.8K',
        followersChange: '+1.9K ce mois',
        impressions: '142.0K',
        engagement: '6.8%',
        secondaryMetricName: 'Enregistrements',
        secondaryMetricValue: '2 150 saves',
        breakdown: [
          { label: 'Reels Tutos', percent: 60, color: 'bg-pink-500' },
          { label: 'Guides Skincare', percent: 25, color: 'bg-purple-400' },
          { label: 'Stories Q&A', percent: 15, color: 'bg-slate-300' },
        ],
      },
      facebook: {
        connected: true,
        followers: '18.2K',
        followersChange: '+450 fans',
        impressions: '38.6K',
        engagement: '3.8%',
        secondaryMetricName: 'Clics Boutique',
        secondaryMetricValue: '620 clics',
        breakdown: [
          { label: 'Packs Soins', percent: 50, color: 'bg-blue-600' },
          { label: 'Avis Clientes', percent: 30, color: 'bg-blue-400' },
          { label: 'Live Conseils', percent: 20, color: 'bg-slate-300' },
        ],
      },
      tiktok: {
        connected: true,
        followers: '34.4K',
        followersChange: '+4.1K followers',
        impressions: '280.0K',
        engagement: '11.2%',
        secondaryMetricName: 'Taux de rétention',
        secondaryMetricValue: '58% moyen',
        breakdown: [
          { label: 'Avant/Après', percent: 70, color: 'bg-rose-600' },
          { label: 'Tutos Coiffure', percent: 30, color: 'bg-emerald-500' },
        ],
      },
      linkedin: {
        connected: false,
        followers: '0',
        followersChange: 'Non configuré',
        impressions: '0',
        engagement: '0%',
        secondaryMetricName: 'CTR Global',
        secondaryMetricValue: '0%',
        breakdown: [],
      },
    },
    chartData: [
      { day: '01 Août', impressions: 6400, reach: 4900, engagement: 540 },
      { day: '03 Août', impressions: 7800, reach: 6100, engagement: 690 },
      { day: '06 Août', impressions: 8900, reach: 7200, engagement: 820 },
      { day: '09 Août', impressions: 12400, reach: 9800, engagement: 1150 },
      { day: '12 Août', impressions: 14200, reach: 11300, engagement: 1380 },
      { day: '14 Août', impressions: 18900, reach: 14600, engagement: 1820 },
      { day: '17 Août', impressions: 16500, reach: 12900, engagement: 1540 },
      { day: '19 Août', impressions: 21800, reach: 17400, engagement: 2180 },
      { day: '21 Août', impressions: 26400, reach: 21200, engagement: 2840 },
      { day: '24 Août', impressions: 19800, reach: 15900, engagement: 1920 },
      { day: '27 Août', impressions: 22100, reach: 17800, engagement: 2310 },
      { day: '30 Août', impressions: 28500, reach: 23100, engagement: 3100 },
    ],
    topPosts: [
      {
        id: 'top-sc-1',
        rank: 1,
        rankBadge: '🏆 #1 Plus Viral',
        title: 'TikTok : Routine 3 étapes Beurre de Karité brut d\'Ivoire & Huile de Baobab',
        network: 'TikTok Video',
        networkBadge: 'bg-slate-900/5 text-slate-900 border border-slate-900/15',
        thumbnail: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=80',
        date: '21 Août 2026',
        views: '118.5k',
        likes: 9420,
        comments: 640,
        shares: 1280,
        engagementRate: '12.4%',
      },
      {
        id: 'top-sc-2',
        rank: 2,
        rankBadge: '🥈 #2 Meilleur Reach',
        title: 'Reel : Transformation Peau Éclat en 14 jours sans filtres ni artifices',
        network: 'Instagram Reel',
        networkBadge: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-600 border border-pink-500/20',
        thumbnail: 'https://images.unsplash.com/photo-1512290900672-1f5be6dc0680?w=600&auto=format&fit=crop&q=80',
        date: '16 Août 2026',
        views: '72.0k',
        likes: 5180,
        comments: 390,
        shares: 840,
        engagementRate: '9.1%',
      },
      {
        id: 'top-sc-3',
        rank: 3,
        rankBadge: '🥉 #3 Plus Sauvegardé',
        title: 'Carrousel : Guide complet d\'hydratation pour cheveux crépus 4C',
        network: 'Instagram Guide',
        networkBadge: 'bg-gradient-to-r from-purple-500/10 to-pink-500/10 text-pink-600 border border-pink-500/20',
        thumbnail: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&auto=format&fit=crop&q=80',
        date: '10 Août 2026',
        views: '44.3k',
        likes: 3120,
        comments: 280,
        shares: 950,
        engagementRate: '8.6%',
      },
    ],
  },
  {
    id: 'dakar-tech-hub',
    name: 'Dakar Tech Hub',
    slug: 'dakar_tech_hub',
    country: 'Sénégal',
    flag: '🇸🇳',
    industry: 'Incubateur FinTech & Capital Risque B2B',
    category: 'Incubateur & SaaS FinTech',
    avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    logo: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=200&auto=format&fit=crop&q=80',
    plan: 'Enterprise',
    whatsappNumber: '+221 78 112 45 88',
    whatsapp: '+221 78 112 45 88',
    approvalRate: 100,
    monthlyGoal: 16,
    brandKit: {
      colors: {
        primary: '#0284C7',
        secondary: '#0F172A',
        accent: '#F59E0B',
      },
      typography: 'Inter',
      hashtags: ['#DakarTech', '#AfricanStartups', '#FintechDakar', '#VentureCapital', '#TechAfrica'],
    },
    globalMetrics: {
      totalAudience: '26.2K',
      audienceChange: '+1.1K ce mois (+4.4%)',
      totalImpressions: '94.5K',
      impressionsChange: '+18.7% vs M-1',
      engagementRate: '4.9%',
      engagementStatus: 'B2B Élite (Moy. 2.1%)',
      completedPosts: 16,
      validationRate: '100% validés WhatsApp',
    },
    networks: {
      instagram: {
        connected: true,
        followers: '5.8K',
        followersChange: '+220 abonnés',
        impressions: '18.4K',
        engagement: '3.4%',
        secondaryMetricName: 'Enregistrements',
        secondaryMetricValue: '320 saves',
        breakdown: [
          { label: 'Carrousels Écosystème', percent: 60, color: 'bg-sky-500' },
          { label: 'Événements & Meetups', percent: 40, color: 'bg-slate-400' },
        ],
      },
      facebook: {
        connected: false,
        followers: '0',
        followersChange: 'Non configuré',
        impressions: '0',
        engagement: '0%',
        secondaryMetricName: 'Clics',
        secondaryMetricValue: '0',
        breakdown: [],
      },
      tiktok: {
        connected: false,
        followers: '0',
        followersChange: 'Non configuré',
        impressions: '0',
        engagement: '0%',
        secondaryMetricName: 'Rétention',
        secondaryMetricValue: '0%',
        breakdown: [],
      },
      linkedin: {
        connected: true,
        followers: '18.4K',
        followersChange: '+840 décideurs B2B',
        impressions: '72.1K',
        engagement: '6.2%',
        secondaryMetricName: 'Clics sur Articles (CTR)',
        secondaryMetricValue: '1 840 clics (4.8%)',
        breakdown: [
          { label: 'Analyses Sectorielles', percent: 50, color: 'bg-[#0A66C2]' },
          { label: 'Annonces Levées', percent: 35, color: 'bg-emerald-500' },
          { label: 'Podcasts Tech', percent: 15, color: 'bg-amber-500' },
        ],
      },
    },
    chartData: [
      { day: '01 Août', impressions: 2100, reach: 1800, engagement: 110 },
      { day: '03 Août', impressions: 2600, reach: 2100, engagement: 140 },
      { day: '06 Août', impressions: 3100, reach: 2500, engagement: 190 },
      { day: '09 Août', impressions: 4200, reach: 3400, engagement: 280 },
      { day: '12 Août', impressions: 3800, reach: 3000, engagement: 230 },
      { day: '14 Août', impressions: 6200, reach: 4900, engagement: 420 },
      { day: '17 Août', impressions: 4900, reach: 3900, engagement: 310 },
      { day: '19 Août', impressions: 7100, reach: 5600, engagement: 510 },
      { day: '21 Août', impressions: 8400, reach: 6800, engagement: 640 },
      { day: '24 Août', impressions: 5600, reach: 4400, engagement: 380 },
      { day: '27 Août', impressions: 6300, reach: 5100, engagement: 450 },
      { day: '30 Août', impressions: 7200, reach: 5900, engagement: 530 },
    ],
    topPosts: [
      {
        id: 'top-dth-1',
        rank: 1,
        rankBadge: '🏆 #1 Top Post B2B',
        title: 'LinkedIn : Rapport Q2 2026 — Le financement des startups en zone UEMOA franchit un record',
        network: 'LinkedIn Article',
        networkBadge: 'bg-sky-500/10 text-sky-600 border border-sky-500/20',
        thumbnail: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&auto=format&fit=crop&q=80',
        date: '12 Août 2026',
        views: '38.2k',
        likes: 1840,
        comments: 240,
        shares: 490,
        engagementRate: '7.8%',
      },
      {
        id: 'top-dth-2',
        rank: 2,
        rankBadge: '🥈 #2 Plus Partagé',
        title: 'Carrousel : Les 5 FinTech sénégalaises à suivre absolument cette année',
        network: 'LinkedIn & IG',
        networkBadge: 'bg-sky-500/10 text-sky-600 border border-sky-500/20',
        thumbnail: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&auto=format&fit=crop&q=80',
        date: '19 Août 2026',
        views: '22.5k',
        likes: 1120,
        comments: 140,
        shares: 310,
        engagementRate: '6.4%',
      },
      {
        id: 'top-dth-3',
        rank: 3,
        rankBadge: '🥉 #3 Pitch Night',
        title: 'LinkedIn : Pitch Night Dakar — 8 pépites tech devant 20 investisseurs panafricains',
        network: 'LinkedIn Post',
        networkBadge: 'bg-sky-500/10 text-sky-600 border border-sky-500/20',
        thumbnail: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600&auto=format&fit=crop&q=80',
        date: '25 Août 2026',
        views: '18.9k',
        likes: 960,
        comments: 112,
        shares: 205,
        engagementRate: '5.9%',
      },
    ],
  },
];
export const initialWorkspaces = WORKSPACES_DATA;

export interface WorkspaceContextType {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspaceIdOrObject: string | Workspace) => void;
  // Compatibilité pour useClient
  clients: Workspace[];
  activeClient: Workspace;
  setActiveClient: (client: Workspace) => void;
  addWorkspace: (newWs: Partial<Workspace>) => void;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export const WorkspaceProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>(WORKSPACES_DATA);
  const [activeWorkspace, setActiveWorkspaceState] = useState<Workspace>(WORKSPACES_DATA[0]);

  const setActiveWorkspace = (workspaceIdOrObject: string | Workspace) => {
    if (typeof workspaceIdOrObject === 'string') {
      const found = workspaces.find((w) => w.id === workspaceIdOrObject);
      if (found) {
        setActiveWorkspaceState(found);
      }
    } else {
      setActiveWorkspaceState(workspaceIdOrObject);
    }
  };

  const addWorkspace = (newWs: Partial<Workspace>) => {
    const created: Workspace = {
      ...WORKSPACES_DATA[0],
      ...newWs,
      id: newWs.id || `ws-${Date.now()}`,
      name: newWs.name || 'Nouveau Client',
      slug: newWs.slug || `client_${Date.now()}`,
    };
    setWorkspaces((prev) => [...prev, created]);
    setActiveWorkspaceState(created);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        clients: workspaces,
        activeClient: activeWorkspace,
        setActiveClient: setActiveWorkspace,
        addWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};

export const useWorkspace = () => {
  const context = useContext(WorkspaceContext);
  if (!context) {
    return {
      workspaces: WORKSPACES_DATA,
      activeWorkspace: WORKSPACES_DATA[0],
      setActiveWorkspace: () => {},
      clients: WORKSPACES_DATA,
      activeClient: WORKSPACES_DATA[0],
      setActiveClient: () => {},
      addWorkspace: () => {},
    };
  }
  return context;
};

// Hook de compatibilité pour le code existant qui importe useClient
export const useClient = useWorkspace;
