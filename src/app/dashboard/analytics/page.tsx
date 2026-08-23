'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  TrendingUp,
  Users,
  Eye,
  MessageCircle,
  Share2,
  Calendar,
  Sparkles,
  FileDown,
  MessageSquare,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  BarChart3,
  Award,
  ChevronRight,
  Filter,
  CheckCircle2,
  Heart,
  Bookmark,
  Send,
  X,
  ExternalLink,
  Printer,
  Check,
  Smartphone,
  Layers,
  Flame,
  Globe,
  Loader2,
  Clock,
  MapPin,
  Compass,
  Lightbulb,
  Target,
  ArrowRight,
  Video,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

export type PlatformFilter = 'all' | 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
export type PeriodType = 'this_month' | '30d' | 'prev_month';

// ============================================================================
// Données Complètes Structurées par Plateforme
// ============================================================================

export interface PlatformAnalyticsData {
  name: string;
  badgeLabel: string;
  icon: string;
  kpis: {
    followers: string;
    followersGrowth: string;
    followersNet: string;
    reach: string;
    reachGrowth: string;
    impressions: string;
    impressionsGrowth: string;
    engagement: string;
    engagementGrowth: string;
    engagementRate: string;
    engagementDiff: string;
    benchmark: string;
  };
  timeline: { day: string; reach: number; impressions: number; engagement: number; followers: number }[];
  engagementBreakdown: { label: string; count: string; percent: number; color: string; icon: string }[];
  topPosts: {
    id: string;
    rank: number;
    title: string;
    format: string;
    thumbnail: string;
    date: string;
    reach: string;
    interactions: string;
    engagementRate: string;
  }[];
  formatPerformance: {
    format: string;
    icon: string;
    postsCount: number;
    reachAvg: string;
    reachGrowth: string;
    engagementAvg: string;
    bestMetric: string;
  }[];
  audience: {
    cities: { name: string; percent: number; flag: string }[];
    ageTarget: string;
    ageDistribution: { label: string; percent: number }[];
    gender: { women: number; men: number };
  };
  bestMoments: {
    day1: { name: string; hours: string; boost: string };
    day2: { name: string; hours: string; boost: string };
    day3: { name: string; hours: string; boost: string };
    tip: string;
  };
  trafficConversions: {
    profileViews: string;
    profileGrowth: string;
    linkClicks: string;
    ctr: string;
    actionClicks: string;
    actionLabel: string;
    actionPercent: string;
    whatsappLeads: string;
  };
  insights: { title: string; desc: string; icon: string; highlightColor: string }[];
  recommendations: { num: number; title: string; desc: string }[];
}

const ANALYTICS_BY_PLATFORM: Record<PlatformFilter, PlatformAnalyticsData> = {
  all: {
    name: 'Vue Globale Multi-Canal',
    badgeLabel: 'Tous les Réseaux Connectés',
    icon: '🌐',
    kpis: {
      followers: '53.7K',
      followersGrowth: '+3.4%',
      followersNet: '+1 842',
      reach: '142.8K',
      reachGrowth: '+18.2%',
      impressions: '164.4K',
      impressionsGrowth: '+22.4%',
      engagement: '9 500',
      engagementGrowth: '+15.8%',
      engagementRate: '5.8%',
      engagementDiff: '+0.6 pt',
      benchmark: 'Bench. secteur : 2.8%',
    },
    timeline: [
      { day: '01', reach: 3200, impressions: 4100, engagement: 210, followers: 45 },
      { day: '04', reach: 4100, impressions: 5200, engagement: 290, followers: 60 },
      { day: '07', reach: 3800, impressions: 4900, engagement: 240, followers: 52 },
      { day: '10', reach: 5600, impressions: 6800, engagement: 410, followers: 85 },
      { day: '13', reach: 4900, impressions: 6100, engagement: 330, followers: 70 },
      { day: '16', reach: 6400, impressions: 7900, engagement: 480, followers: 98 },
      { day: '18', reach: 11200, impressions: 14500, engagement: 980, followers: 240 },
      { day: '21', reach: 7800, impressions: 9400, engagement: 560, followers: 115 },
      { day: '24', reach: 6900, impressions: 8200, engagement: 490, followers: 92 },
      { day: '27', reach: 8400, impressions: 10100, engagement: 620, followers: 130 },
      { day: '30', reach: 9100, impressions: 11200, engagement: 710, followers: 155 },
    ],
    engagementBreakdown: [
      { label: 'J\'aime (Likes)', count: '6 840', percent: 72, color: 'bg-rose-500', icon: '❤️' },
      { label: 'Partages (Shares & DMs)', count: '1 120', percent: 12, color: 'bg-[#0066FF]', icon: '↗️' },
      { label: 'Commentaires publics', count: '890', percent: 9, color: 'bg-emerald-500', icon: '💬' },
      { label: 'Enregistrements (Saves)', count: '650', percent: 7, color: 'bg-amber-500', icon: '🔖' },
    ],
    topPosts: [
      {
        id: 'p1',
        rank: 1,
        title: 'Coulisses : Préparation du Thiéboudienne Penda Mbaye Royal',
        format: 'Reel Instagram',
        thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
        date: '18 Août à 12:30',
        reach: '38.4K',
        interactions: '2 840',
        engagementRate: '7.4%',
      },
      {
        id: 'p2',
        rank: 2,
        title: 'Carrousel : Les 5 secrets de notre marinade braisée au feu de bois',
        format: 'Carrousel Instagram',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
        date: '12 Août à 19:30',
        reach: '24.1K',
        interactions: '1 920',
        engagementRate: '6.8%',
      },
      {
        id: 'p3',
        rank: 3,
        title: 'Menu Spécial Dégustation : Formule Brunch du Dimanche',
        format: 'Carrousel Facebook',
        thumbnail: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop&q=80',
        date: '25 Août à 10:00',
        reach: '19.8K',
        interactions: '1 450',
        engagementRate: '6.1%',
      },
      {
        id: 'p4',
        rank: 4,
        title: 'Recette express : Dressage de l\'assiette dégustation Chef',
        format: 'TikTok 9:16',
        thumbnail: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=400&auto=format&fit=crop&q=80',
        date: '05 Août à 18:00',
        reach: '16.5K',
        interactions: '1 180',
        engagementRate: '8.2%',
      },
      {
        id: 'p5',
        rank: 5,
        title: 'Cocktails signature aux saveurs de Bissap & Gingembre',
        format: 'Image Facebook',
        thumbnail: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&auto=format&fit=crop&q=80',
        date: '22 Août à 20:15',
        reach: '12.2K',
        interactions: '790',
        engagementRate: '4.9%',
      },
    ],
    formatPerformance: [
      { format: 'Reels / TikToks', icon: '🎥', postsCount: 14, reachAvg: '28.2K', reachGrowth: '+34.5%', engagementAvg: '7.1%', bestMetric: 'Viralité & Nouveaux abonnés' },
      { format: 'Carrousels éducatifs & Menus', icon: '📑', postsCount: 12, reachAvg: '21.5K', reachGrowth: '+18.2%', engagementAvg: '6.4%', bestMetric: '+42% d\'enregistrements' },
      { format: 'Images uniques HD', icon: '🖼️', postsCount: 8, reachAvg: '11.8K', reachGrowth: '+4.1%', engagementAvg: '4.2%', bestMetric: 'Esthétique de grille' },
      { format: 'Stories quotidiennes', icon: '📱', postsCount: 42, reachAvg: '4.9K', reachGrowth: '+12.0%', engagementAvg: '8.1%', bestMetric: 'Réactivité WhatsApp' },
    ],
    audience: {
      cities: [
        { name: 'Dakar, Sénégal', percent: 68, flag: '🇸🇳' },
        { name: 'Abidjan, Côte d\'Ivoire', percent: 14, flag: '🇨🇮' },
        { name: 'Saint-Louis, Sénégal', percent: 8, flag: '🇸🇳' },
        { name: 'Thiès, Sénégal', percent: 6, flag: '🇸🇳' },
      ],
      ageTarget: '25 - 34 ans (54%)',
      ageDistribution: [
        { label: '25 - 34 ans', percent: 54 },
        { label: '18 - 24 ans', percent: 22 },
        { label: '35 - 44 ans', percent: 18 },
      ],
      gender: { women: 58, men: 42 },
    },
    bestMoments: {
      day1: { name: 'Vendredi soir', hours: '19h30 - 22h00', boost: '+38% d\'engagement' },
      day2: { name: 'Samedi midi', hours: '12h00 - 14h00', boost: '+26% d\'engagement' },
      day3: { name: 'Mercredi midi', hours: '12h30 - 14h00', boost: '+19% d\'engagement' },
      tip: 'Programmez vos posts culinaires entre 11h45 et 12h15 pour capter la décision du déjeuner à Dakar.',
    },
    trafficConversions: {
      profileViews: '12 400',
      profileGrowth: '+14.2%',
      linkClicks: '1 842',
      ctr: '14.8%',
      actionClicks: '842',
      actionLabel: 'Menu PDF consulté',
      actionPercent: '45.7%',
      whatsappLeads: '348',
    },
    insights: [
      { title: 'Surperformance des Carrousels', desc: 'Les carrousels génèrent +42% d\'enregistrements (Saves) par rapport aux images uniques.', icon: '🚀', highlightColor: 'text-orange-300' },
      { title: 'Pic de viralité du 18 Août', desc: 'Le Reel Thiéboudienne a capté 38.4K vues et apporté 38% des nouveaux abonnés du mois.', icon: '🔥', highlightColor: 'text-emerald-300' },
      { title: 'Créneau Déjeuner Optimal', desc: 'Les posts programmés entre 11h45 et 12h30 convertissent 2.4x plus de clics WhatsApp.', icon: '⏱️', highlightColor: 'text-sky-300' },
    ],
    recommendations: [
      { num: 1, title: 'Augmenter la cadence des Reels à 2 / semaine', desc: 'Tester des formats immersifs en cuisine mettant en avant le Chef et les produits frais.' },
      { num: 2, title: 'Rituel "Menu du Week-end" chaque Jeudi soir', desc: 'Publier un Carrousel dégustation le jeudi à 19h30 pour anticiper les réservations du week-end.' },
      { num: 3, title: 'Jeu-concours dégustation VIP en Story', desc: 'Sondages et quiz pour stimuler les interactions directes et qualifier des leads WhatsApp.' },
    ],
  },

  instagram: {
    name: 'Instagram (@teranga_gourmet)',
    badgeLabel: 'Instagram Business Connecté',
    icon: '📸',
    kpis: {
      followers: '28.4K',
      followersGrowth: '+4.8%',
      followersNet: '+1 290',
      reach: '84.2K',
      reachGrowth: '+21.5%',
      impressions: '98.6K',
      impressionsGrowth: '+26.8%',
      engagement: '5 720',
      engagementGrowth: '+18.4%',
      engagementRate: '6.8%',
      engagementDiff: '+0.9 pt',
      benchmark: 'Bench. Instagram Food : 3.2%',
    },
    timeline: [
      { day: '01', reach: 2100, impressions: 2600, engagement: 145, followers: 32 },
      { day: '04', reach: 2800, impressions: 3400, engagement: 190, followers: 44 },
      { day: '07', reach: 2500, impressions: 3100, engagement: 170, followers: 38 },
      { day: '10', reach: 3900, impressions: 4600, engagement: 280, followers: 65 },
      { day: '13', reach: 3300, impressions: 4000, engagement: 220, followers: 50 },
      { day: '16', reach: 4500, impressions: 5400, engagement: 340, followers: 75 },
      { day: '18', reach: 8900, impressions: 11200, engagement: 740, followers: 190 },
      { day: '21', reach: 5200, impressions: 6300, engagement: 390, followers: 85 },
      { day: '24', reach: 4600, impressions: 5500, engagement: 330, followers: 70 },
      { day: '27', reach: 5800, impressions: 6900, engagement: 420, followers: 95 },
      { day: '30', reach: 6400, impressions: 7800, engagement: 490, followers: 110 },
    ],
    engagementBreakdown: [
      { label: 'J\'aime (Likes Reels & Posts)', count: '4 120', percent: 72, color: 'bg-rose-500', icon: '❤️' },
      { label: 'Enregistrements (Saves Recettes)', count: '580', percent: 10, color: 'bg-amber-500', icon: '🔖' },
      { label: 'Partages en Story & DMs', count: '560', percent: 10, color: 'bg-[#E1306C]', icon: '↗️' },
      { label: 'Commentaires', count: '460', percent: 8, color: 'bg-purple-500', icon: '💬' },
    ],
    topPosts: [
      {
        id: 'ig-1',
        rank: 1,
        title: 'Reel : Coulisses de la sauce marinade braisée au feu de bois',
        format: 'Reel Instagram',
        thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
        date: '18 Août à 12:30',
        reach: '38.4K',
        interactions: '2 840',
        engagementRate: '7.4%',
      },
      {
        id: 'ig-2',
        rank: 2,
        title: 'Carrousel : Les 5 déclinaisons de Thiéboudienne du Chef',
        format: 'Carrousel Instagram',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
        date: '12 Août à 19:30',
        reach: '24.1K',
        interactions: '1 920',
        engagementRate: '6.8%',
      },
      {
        id: 'ig-3',
        rank: 3,
        title: 'Menu Dégustation Spécial Brunch du Dimanche',
        format: 'Carrousel Instagram',
        thumbnail: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop&q=80',
        date: '25 Août à 10:00',
        reach: '15.4K',
        interactions: '980',
        engagementRate: '6.3%',
      },
    ],
    formatPerformance: [
      { format: 'Reels Instagram', icon: '🎥', postsCount: 8, reachAvg: '31.2K', reachGrowth: '+38.5%', engagementAvg: '7.4%', bestMetric: 'Découverte & Abonnés' },
      { format: 'Carrousels 5-10 slides', icon: '📑', postsCount: 6, reachAvg: '22.8K', reachGrowth: '+19.4%', engagementAvg: '6.8%', bestMetric: '+48% de Saves' },
      { format: 'Photos uniques', icon: '🖼️', postsCount: 4, reachAvg: '12.4K', reachGrowth: '+3.2%', engagementAvg: '4.4%', bestMetric: 'Esthétique de profil' },
      { format: 'Stories Instagram', icon: '📱', postsCount: 28, reachAvg: '5.6K', reachGrowth: '+14.2%', engagementAvg: '8.8%', bestMetric: 'Lien sticker WhatsApp' },
    ],
    audience: {
      cities: [
        { name: 'Dakar (Plateau, Almadies, Mermoz)', percent: 74, flag: '🇸🇳' },
        { name: 'Abidjan (Cocody, Marcory)', percent: 12, flag: '🇨🇮' },
        { name: 'Paris (Diaspora)', percent: 8, flag: '🇫🇷' },
        { name: 'Saint-Louis', percent: 6, flag: '🇸🇳' },
      ],
      ageTarget: '25 - 34 ans (62%)',
      ageDistribution: [
        { label: '25 - 34 ans', percent: 62 },
        { label: '18 - 24 ans', percent: 24 },
        { label: '35 - 44 ans', percent: 14 },
      ],
      gender: { women: 64, men: 36 },
    },
    bestMoments: {
      day1: { name: 'Vendredi soir', hours: '19h00 - 22h30', boost: '+44% de portée' },
      day2: { name: 'Dimanche matin', hours: '10h00 - 12h30', boost: '+32% d\'interactions' },
      day3: { name: 'Mardi midi', hours: '12h00 - 13h30', boost: '+21% de clics' },
      tip: 'Utilisez les stickers de lien WhatsApp en Story le vendredi dès 18h pour capter les réservations du soir.',
    },
    trafficConversions: {
      profileViews: '9 200',
      profileGrowth: '+16.8%',
      linkClicks: '1 420',
      ctr: '15.4%',
      actionClicks: '680',
      actionLabel: 'Menu Bio cliqué',
      actionPercent: '47.8%',
      whatsappLeads: '264',
    },
    insights: [
      { title: 'Reels : x2.8 plus de reach que les photos', desc: 'L\'algorithme Instagram pousse massivement les vidéos coulisses avec audio tendance.', icon: '🎥', highlightColor: 'text-pink-300' },
      { title: 'Sticker WhatsApp très performant', desc: '82% des leads proviennent directement du sticker Story de vendredi midi.', icon: '📲', highlightColor: 'text-emerald-300' },
      { title: 'Carrousels sauvegardés', desc: 'Les fiches recettes et cartes menus ont un taux de sauvegarde record de 10.1%.', icon: '📑', highlightColor: 'text-amber-300' },
    ],
    recommendations: [
      { num: 1, title: 'Adopter le format "1 Reel / 1 Recette" le mercredi', desc: 'Montrer la fraîcheur des produits du marché de Soumbédioune en vidéo dynamique.' },
      { num: 2, title: 'Activer les rappels d\'événements en Story', desc: 'Programmer des stickers de compte à rebours pour les soirées dégustation du week-end.' },
      { num: 3, title: 'Épingler les 3 meilleurs Reels en haut du profil', desc: 'Maximiser le taux de conversion des visiteurs de profil en clients WhatsApp.' },
    ],
  },

  facebook: {
    name: 'Facebook (Page Teranga Gourmet)',
    badgeLabel: 'Facebook Meta Page Connectée',
    icon: '📘',
    kpis: {
      followers: '18.2K',
      followersGrowth: '+1.2%',
      followersNet: '+220',
      reach: '36.4K',
      reachGrowth: '+8.4%',
      impressions: '44.2K',
      impressionsGrowth: '+11.2%',
      engagement: '1 940',
      engagementGrowth: '+7.8%',
      engagementRate: '5.3%',
      engagementDiff: '+0.2 pt',
      benchmark: 'Bench. Facebook Food : 2.1%',
    },
    timeline: [
      { day: '01', reach: 900, impressions: 1100, engagement: 50, followers: 8 },
      { day: '04', reach: 1100, impressions: 1300, engagement: 60, followers: 10 },
      { day: '07', reach: 950, impressions: 1200, engagement: 55, followers: 9 },
      { day: '10', reach: 1400, impressions: 1700, engagement: 85, followers: 14 },
      { day: '13', reach: 1200, impressions: 1500, engagement: 70, followers: 12 },
      { day: '16', reach: 1600, impressions: 2000, engagement: 95, followers: 16 },
      { day: '18', reach: 2400, impressions: 3100, engagement: 160, followers: 35 },
      { day: '21', reach: 1800, impressions: 2200, engagement: 110, followers: 18 },
      { day: '24', reach: 1600, impressions: 1900, engagement: 95, followers: 15 },
      { day: '27', reach: 2100, impressions: 2600, engagement: 130, followers: 22 },
      { day: '30', reach: 2300, impressions: 2800, engagement: 145, followers: 26 },
    ],
    engagementBreakdown: [
      { label: 'J\'aime & Réactions', count: '1 240', percent: 64, color: 'bg-[#1877F2]', icon: '👍' },
      { label: 'Partages de publications', count: '390', percent: 20, color: 'bg-sky-500', icon: '🔄' },
      { label: 'Commentaires & Réservations', count: '240', percent: 12, color: 'bg-emerald-500', icon: '💬' },
      { label: 'Clics sur l\'adresse / téléphone', count: '70', percent: 4, color: 'bg-purple-500', icon: '📍' },
    ],
    topPosts: [
      {
        id: 'fb-1',
        rank: 1,
        title: 'Événement Spécial : Soirée Grillades & Musique Live ce Vendredi',
        format: 'Image Facebook',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
        date: '16 Août à 18:00',
        reach: '11.8K',
        interactions: '740',
        engagementRate: '6.2%',
      },
      {
        id: 'fb-2',
        rank: 2,
        title: 'Album Photos : Mariage et Réception Traiteur 150 Personnes',
        format: 'Album Photos',
        thumbnail: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop&q=80',
        date: '10 Août à 14:00',
        reach: '9.2K',
        interactions: '580',
        engagementRate: '6.3%',
      },
    ],
    formatPerformance: [
      { format: 'Albums photos & Événements', icon: '📸', postsCount: 6, reachAvg: '8.4K', reachGrowth: '+12.1%', engagementAvg: '5.8%', bestMetric: 'Partages familiaux' },
      { format: 'Publications avec lien WhatsApp', icon: '🔗', postsCount: 10, reachAvg: '6.2K', reachGrowth: '+7.4%', engagementAvg: '4.9%', bestMetric: 'Appels téléphoniques' },
    ],
    audience: {
      cities: [
        { name: 'Dakar & Banlieue', percent: 62, flag: '🇸🇳' },
        { name: 'Thiès & Mbour', percent: 18, flag: '🇸🇳' },
        { name: 'Diaspora France & USA', percent: 14, flag: '🌍' },
        { name: 'Autres', percent: 6, flag: '🇸🇳' },
      ],
      ageTarget: '30 - 50 ans (68%)',
      ageDistribution: [
        { label: '35 - 44 ans', percent: 42 },
        { label: '25 - 34 ans', percent: 36 },
        { label: '45+ ans', percent: 22 },
      ],
      gender: { women: 52, men: 48 },
    },
    bestMoments: {
      day1: { name: 'Jeudi midi', hours: '12h00 - 14h00', boost: '+28% de clics' },
      day2: { name: 'Dimanche soir', hours: '19h00 - 21h30', boost: '+22% de partages' },
      day3: { name: 'Mardi matin', hours: '09h30 - 11h00', boost: '+15% d\'engagement' },
      tip: 'Facebook est le canal privilégié pour les réservations de groupes familiaux et devis traiteur.',
    },
    trafficConversions: {
      profileViews: '2 400',
      profileGrowth: '+6.5%',
      linkClicks: '340',
      ctr: '14.1%',
      actionClicks: '110',
      actionLabel: 'Appels directs passés',
      actionPercent: '32.3%',
      whatsappLeads: '62',
    },
    insights: [
      { title: 'Audience plus mature et décisionnaire', desc: 'Les demandes de devis traiteur pour mariages et baptêmes proviennent à 65% de Facebook.', icon: '💍', highlightColor: 'text-blue-300' },
      { title: 'Fort taux de partage local', desc: 'Les annonces d\'événements et buffets sont relayées dans les groupes Facebook Dakar Food.', icon: '📢', highlightColor: 'text-emerald-300' },
    ],
    recommendations: [
      { num: 1, title: 'Publier les menus de la semaine chaque lundi à 10h', desc: 'Cibler les comités d\'entreprise et déjeuners professionnels du quartier d\'affaires.' },
      { num: 2, title: 'Mettre en avant les avis clients 5 étoiles', desc: 'Renforcer la réassurance locale avec des témoignages visuels de réceptions réussies.' },
    ],
  },

  tiktok: {
    name: 'TikTok (@terangafood)',
    badgeLabel: 'TikTok Creator Connecté',
    icon: '🎵',
    kpis: {
      followers: '5.8K',
      followersGrowth: '+14.2%',
      followersNet: '+310',
      reach: '18.6K',
      reachGrowth: '+48.0%',
      impressions: '21.6K',
      impressionsGrowth: '+52.4%',
      engagement: '1 480',
      engagementGrowth: '+32.0%',
      engagementRate: '8.0%',
      engagementDiff: '+1.4 pt',
      benchmark: 'Bench. TikTok Sénégal : 4.5%',
    },
    timeline: [
      { day: '01', reach: 200, impressions: 250, engagement: 20, followers: 5 },
      { day: '04', reach: 300, impressions: 380, engagement: 28, followers: 7 },
      { day: '07', reach: 280, impressions: 350, engagement: 25, followers: 6 },
      { day: '10', reach: 450, impressions: 550, engagement: 40, followers: 10 },
      { day: '13', reach: 380, impressions: 480, engagement: 35, followers: 8 },
      { day: '16', reach: 520, impressions: 650, engagement: 48, followers: 12 },
      { day: '18', reach: 2800, impressions: 3600, engagement: 290, followers: 85 },
      { day: '21', reach: 850, impressions: 1100, engagement: 80, followers: 20 },
      { day: '24', reach: 720, impressions: 920, engagement: 68, followers: 16 },
      { day: '27', reach: 980, impressions: 1250, engagement: 95, followers: 24 },
      { day: '30', reach: 1150, impressions: 1480, engagement: 110, followers: 28 },
    ],
    engagementBreakdown: [
      { label: 'J\'aime (Likes)', count: '1 120', percent: 76, color: 'bg-rose-500', icon: '❤️' },
      { label: 'Partages WhatsApp & Vidéos', count: '180', percent: 12, color: 'bg-cyan-500', icon: '↗️' },
      { label: 'Commentaires & Questions', count: '120', percent: 8, color: 'bg-emerald-500', icon: '💬' },
      { label: 'Ajouts aux Favoris', count: '60', percent: 4, color: 'bg-amber-500', icon: '⭐' },
    ],
    topPosts: [
      {
        id: 'tt-1',
        rank: 1,
        title: 'ASMR Culinaire : Le croustillant des pastels au poisson frais 🥟',
        format: 'TikTok 9:16',
        thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
        date: '18 Août à 21:00',
        reach: '11.4K',
        interactions: '920',
        engagementRate: '8.1%',
      },
    ],
    formatPerformance: [
      { format: 'Vidéos ASMR & Coulisses (15-30s)', icon: '🎧', postsCount: 6, reachAvg: '6.4K', reachGrowth: '+54.0%', engagementAvg: '8.4%', bestMetric: 'Temps de visionnage complet' },
    ],
    audience: {
      cities: [
        { name: 'Dakar', percent: 78, flag: '🇸🇳' },
        { name: 'Abidjan', percent: 14, flag: '🇨🇮' },
        { name: 'Autres', percent: 8, flag: '🌍' },
      ],
      ageTarget: '18 - 24 ans (58%)',
      ageDistribution: [
        { label: '18 - 24 ans', percent: 58 },
        { label: '25 - 34 ans', percent: 34 },
        { label: '35+ ans', percent: 8 },
      ],
      gender: { women: 60, men: 40 },
    },
    bestMoments: {
      day1: { name: 'Samedi soir', hours: '21h00 - 23h30', boost: '+52% de viralité' },
      day2: { name: 'Mercredi après-midi', hours: '16h00 - 18h00', boost: '+35% de vues' },
      day3: { name: 'Vendredi soir', hours: '20h00 - 22h00', boost: '+28% de partages' },
      tip: 'Utilisez les sons sénégalais tendances (Mbalax, Afrobeats) pour booster l\'algorithme Pour Toi (FYP).',
    },
    trafficConversions: {
      profileViews: '1 800',
      profileGrowth: '+38.0%',
      linkClicks: '180',
      ctr: '10.0%',
      actionClicks: '60',
      actionLabel: 'Redirections Instagram & WhatsApp',
      actionPercent: '33.3%',
      whatsappLeads: '22',
    },
    insights: [
      { title: 'Format ASMR ultra-viral', desc: 'Le son naturel de la cuisine (crépitement, découpe) retient l\'attention à 84% jusqu\'à la fin de la vidéo.', icon: '🔥', highlightColor: 'text-cyan-300' },
    ],
    recommendations: [
      { num: 1, title: 'Tester les défis dégustation en duo avec des créateurs dakarois', desc: 'Générer du reach croisé avec les micro-influenceurs food de la capitale.' },
    ],
  },

  linkedin: {
    name: 'LinkedIn (Teranga Gourmet B2B)',
    badgeLabel: 'LinkedIn Page Connectée',
    icon: '💼',
    kpis: {
      followers: '1.3K',
      followersGrowth: '+6.5%',
      followersNet: '+82',
      reach: '3.6K',
      reachGrowth: '+14.2%',
      impressions: '4.8K',
      impressionsGrowth: '+16.5%',
      engagement: '360',
      engagementGrowth: '+12.0%',
      engagementRate: '7.5%',
      engagementDiff: '+0.4 pt',
      benchmark: 'Bench. LinkedIn B2B : 3.8%',
    },
    timeline: [
      { day: '01', reach: 80, impressions: 110, engagement: 8, followers: 2 },
      { day: '04', reach: 110, impressions: 150, engagement: 11, followers: 3 },
      { day: '07', reach: 95, impressions: 130, engagement: 9, followers: 2 },
      { day: '10', reach: 180, impressions: 240, engagement: 18, followers: 5 },
      { day: '13', reach: 140, impressions: 190, engagement: 14, followers: 4 },
      { day: '16', reach: 210, impressions: 290, engagement: 22, followers: 6 },
      { day: '18', reach: 350, impressions: 480, engagement: 38, followers: 10 },
      { day: '21', reach: 240, impressions: 320, engagement: 25, followers: 7 },
      { day: '24', reach: 190, impressions: 260, engagement: 20, followers: 5 },
      { day: '27', reach: 280, impressions: 380, engagement: 30, followers: 8 },
      { day: '30', reach: 310, impressions: 420, engagement: 34, followers: 9 },
    ],
    engagementBreakdown: [
      { label: 'Réactions (Bravo & J\'aime)', count: '240', percent: 67, color: 'bg-[#0A66C2]', icon: '👏' },
      { label: 'Commentaires professionnels', count: '70', percent: 19, color: 'bg-emerald-500', icon: '💬' },
      { label: 'Republications (Reposts)', count: '50', percent: 14, color: 'bg-sky-500', icon: '🔄' },
    ],
    topPosts: [
      {
        id: 'in-1',
        rank: 1,
        title: 'Tribune : Valoriser les circuits courts et l\'agriculture locale au Sénégal',
        format: 'Article B2B',
        thumbnail: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
        date: '14 Août à 09:30',
        reach: '2.1K',
        interactions: '190',
        engagementRate: '9.0%',
      },
    ],
    formatPerformance: [
      { format: 'Carrousels PDF & Retours d\'expérience', icon: '📄', postsCount: 3, reachAvg: '1.8K', reachGrowth: '+18.0%', engagementAvg: '8.1%', bestMetric: 'Téléchargements de plaquette' },
    ],
    audience: {
      cities: [
        { name: 'Dakar (Direction Générale & RH)', percent: 82, flag: '🇸🇳' },
        { name: 'Abidjan', percent: 10, flag: '🇨🇮' },
        { name: 'Autres', percent: 8, flag: '🌍' },
      ],
      ageTarget: '28 - 50 ans (Cadres & Dirigeants)',
      ageDistribution: [
        { label: '30 - 45 ans', percent: 65 },
        { label: '25 - 29 ans', percent: 25 },
        { label: '45+ ans', percent: 10 },
      ],
      gender: { women: 45, men: 55 },
    },
    bestMoments: {
      day1: { name: 'Mardi matin', hours: '08h00 - 09h30', boost: '+36% de visibilité' },
      day2: { name: 'Jeudi matin', hours: '08h30 - 10h00', boost: '+29% d\'interactions' },
      day3: { name: 'Mercredi midi', hours: '12h00 - 13h30', boost: '+20% de partages' },
      tip: 'Idéal pour promouvoir les plateaux repas en entreprise et les événements de fin d\'année.',
    },
    trafficConversions: {
      profileViews: '620',
      profileGrowth: '+18.4%',
      linkClicks: '95',
      ctr: '15.3%',
      actionClicks: '38',
      actionLabel: 'Téléchargements plaquette B2B',
      actionPercent: '40.0%',
      whatsappLeads: '14',
    },
    insights: [
      { title: 'Excellente conversion sur les séminaires', desc: '14 demandes de devis traiteur d\'entreprises enregistrées ce mois-ci via LinkedIn.', icon: '🏢', highlightColor: 'text-sky-300' },
    ],
    recommendations: [
      { num: 1, title: 'Lancer l\'offre "Pause Café & Déjeuners d\'Affaires" fin août', desc: 'Anticiper la rentrée de septembre avec une offre dédiée aux entreprises de Dakar Plateau.' },
    ],
  },
};

export default function AnalyticsPage() {
  const { activeWorkspace } = useWorkspace();

  // États
  const [platform, setPlatform] = useState<PlatformFilter>('all');
  const [period, setPeriod] = useState<PeriodType>('this_month');
  const [activeMetricTab, setActiveMetricTab] = useState<'reach' | 'impressions' | 'engagement' | 'followers'>('reach');
  const [activePointIndex, setActivePointIndex] = useState<number>(6);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const currentData = ANALYTICS_BY_PLATFORM[platform] || ANALYTICS_BY_PLATFORM.all;
  const selectedPoint = currentData.timeline[activePointIndex] || currentData.timeline[0];

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleTriggerPrint = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setIsPdfModalOpen(false);
      window.print();
    }, 500);
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-8 antialiased">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A]/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-bounce no-print">
          <Sparkles className="w-4 h-4 text-[#F94F06]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          EN-TÊTE PRINCIPAL : TITRE, FILTRES & BOUTON RAPPORT PDF
          ======================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A]">
              Analytics &amp; Rapport Mensuel
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-50 text-[#F94F06] border border-orange-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F94F06]"></span>
              {activeWorkspace.name} {activeWorkspace.flag}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Tableau de bord de performance et générateur de rapport PDF ROI consolidé.
          </p>
        </div>

        {/* Actions & Période */}
        <div className="flex items-center flex-wrap gap-2.5 no-print">
          {/* Sélecteur de Période */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => { setPeriod('this_month'); showToast('📅 Période : Mois en cours (Août 2026)'); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'this_month' ? 'bg-white text-[#0F172A] shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              Ce mois-ci
            </button>
            <button
              type="button"
              onClick={() => { setPeriod('30d'); showToast('📅 Période : 30 derniers jours'); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === '30d' ? 'bg-white text-[#0F172A] shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              30 Jours
            </button>
            <button
              type="button"
              onClick={() => { setPeriod('prev_month'); showToast('📅 Période : Mois précédent'); }}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                period === 'prev_month' ? 'bg-white text-[#0F172A] shadow-xs font-black' : 'hover:text-slate-900'
              }`}
            >
              Mois Précédent
            </button>
          </div>

          {/* Bouton Export PDF */}
          <button
            type="button"
            onClick={() => setIsPdfModalOpen(true)}
            className="px-4 py-2.5 bg-[#F94F06] hover:bg-[#e04605] text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer"
          >
            <FileDown className="w-4 h-4" />
            <span>Télécharger le Rapport PDF</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          BARRE DE SÉLECTION MULTI-PLATEFORME (FILTRE PRINCIPAL)
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-2 rounded-2xl border border-slate-200/80 shadow-2xs no-print">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold text-slate-600">
          
          {/* 1. Tous les réseaux (Vue Globale) */}
          <button
            type="button"
            onClick={() => { setPlatform('all'); showToast('🌐 Vue Globale activée (Tous les réseaux)'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              platform === 'all'
                ? 'bg-[#F94F06] text-white font-black shadow-md shadow-orange-500/25'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Globe className="w-4 h-4" />
            <span>Vue Globale (Tous les réseaux)</span>
          </button>

          {/* 2. Instagram */}
          <button
            type="button"
            onClick={() => { setPlatform('instagram'); showToast('📸 Filtre activé : Instagram'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              platform === 'instagram'
                ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white font-black shadow-md'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>📸</span>
            <span>Instagram</span>
          </button>

          {/* 3. Facebook */}
          <button
            type="button"
            onClick={() => { setPlatform('facebook'); showToast('📘 Filtre activé : Facebook'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              platform === 'facebook'
                ? 'bg-[#1877F2] text-white font-black shadow-md'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>📘</span>
            <span>Facebook</span>
          </button>

          {/* 4. TikTok */}
          <button
            type="button"
            onClick={() => { setPlatform('tiktok'); showToast('🎵 Filtre activé : TikTok'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              platform === 'tiktok'
                ? 'bg-[#0F172A] text-white font-black shadow-md'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>🎵</span>
            <span>TikTok</span>
          </button>

          {/* 5. LinkedIn */}
          <button
            type="button"
            onClick={() => { setPlatform('linkedin'); showToast('💼 Filtre activé : LinkedIn'); }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
              platform === 'linkedin'
                ? 'bg-[#0A66C2] text-white font-black shadow-md'
                : 'hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <span>💼</span>
            <span>LinkedIn</span>
          </button>

        </div>
      </div>

      {/* =======================================================================
          SECTION 1 : VUE D'ENSEMBLE (6 CARTES KPIS CLÉS DYNAMIQUES)
          ======================================================================= */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#F94F06]"></span>
            1. Vue d&apos;Ensemble &amp; KPIs — {currentData.name}
          </h2>
          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            Croissance nette {currentData.kpis.followersGrowth}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {/* KPI 1 : Total Abonnés */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Abonnés</span>
              <div className="w-7 h-7 rounded-xl bg-blue-50 text-[#0066FF] flex items-center justify-center">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#0F172A]">{currentData.kpis.followers}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                {currentData.kpis.followersGrowth}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">{currentData.kpis.followersNet} abonnés</p>
          </div>

          {/* KPI 2 : Croissance Nette */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Croissance Nette</span>
              <div className="w-7 h-7 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#0F172A]">{currentData.kpis.followersNet}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                +12.4%
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">vs mois précédent</p>
          </div>

          {/* KPI 3 : Portée (Reach) */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Portée (Reach)</span>
              <div className="w-7 h-7 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Eye className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#0F172A]">{currentData.kpis.reach}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                {currentData.kpis.reachGrowth}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Comptes uniques</p>
          </div>

          {/* KPI 4 : Impressions */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Impressions</span>
              <div className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#0F172A]">{currentData.kpis.impressions}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                {currentData.kpis.impressionsGrowth}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Vues totales</p>
          </div>

          {/* KPI 5 : Total Engagement */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs space-y-2 hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Total Engagement</span>
              <div className="w-7 h-7 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center">
                <Heart className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#0F172A]">{currentData.kpis.engagement}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                {currentData.kpis.engagementGrowth}
              </span>
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">Interactions directes</p>
          </div>

          {/* KPI 6 : Taux d'Engagement */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/10 to-amber-500/5 border border-[#F94F06]/30 shadow-2xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#F94F06]">Taux d&apos;Engagement</span>
              <div className="w-7 h-7 rounded-xl bg-[#F94F06] text-white flex items-center justify-center font-bold text-xs">
                <Zap className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-2xl font-black text-[#F94F06]">{currentData.kpis.engagementRate}</span>
              <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                {currentData.kpis.engagementDiff}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 font-semibold">{currentData.kpis.benchmark}</p>
          </div>
        </div>
      </div>

      {/* =======================================================================
          SECTION 2 : ÉVOLUTION DES PERFORMANCES (GRAPHIQUE TEMPOREL 30 JOURS)
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
              <span>2. Évolution Temporelle sur 30 Jours — {currentData.name}</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                {currentData.icon} {currentData.badgeLabel}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Trajectoire quotidienne des publications sur la période sélectionnée.
            </p>
          </div>

          {/* Onglets de Métriques pour le Graphique */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-bold text-slate-600 no-print">
            <button
              type="button"
              onClick={() => setActiveMetricTab('reach')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMetricTab === 'reach' ? 'bg-[#F94F06] text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Portée (Reach)
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('impressions')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMetricTab === 'impressions' ? 'bg-[#0066FF] text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Impressions
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('engagement')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMetricTab === 'engagement' ? 'bg-purple-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Engagement
            </button>
            <button
              type="button"
              onClick={() => setActiveMetricTab('followers')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                activeMetricTab === 'followers' ? 'bg-emerald-600 text-white shadow-xs' : 'hover:text-slate-900'
              }`}
            >
              Abonnés
            </button>
          </div>
        </div>

        {/* Graphique SVG Interactif avec Barres et Données */}
        <div className="relative pt-4 pb-2">
          {/* Infobulle point sélectionné */}
          <div className="mb-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center gap-3">
              <div className="text-xs font-black text-slate-900">
                Jour {selectedPoint.day} Août 2026
              </div>
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-600">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#F94F06]"></span>
                  Reach : <strong>{selectedPoint.reach.toLocaleString('fr-FR')}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#0066FF]"></span>
                  Impressions : <strong>{selectedPoint.impressions.toLocaleString('fr-FR')}</strong>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                  Engagement : <strong>{selectedPoint.engagement.toLocaleString('fr-FR')}</strong>
                </span>
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">Survolez les colonnes</span>
          </div>

          {/* Barres Visuelles */}
          <div className="h-52 flex items-end justify-between gap-2 pt-6 px-2 border-b border-slate-200">
            {currentData.timeline.map((item, idx) => {
              const maxVal = Math.max(...currentData.timeline.map(t => t[activeMetricTab])) || 1;
              const heightPercent = Math.min(100, Math.round((item[activeMetricTab] / maxVal) * 100));
              const isSelected = activePointIndex === idx;

              return (
                <div
                  key={item.day}
                  onMouseEnter={() => setActivePointIndex(idx)}
                  className="flex-1 flex flex-col items-center gap-2 group cursor-pointer h-full justify-end"
                >
                  <span className={`text-[10px] font-black transition-all ${isSelected ? 'text-[#F94F06] scale-110' : 'text-slate-400 opacity-0 group-hover:opacity-100'}`}>
                    {item[activeMetricTab] >= 1000 ? (item[activeMetricTab] / 1000).toFixed(1) + 'K' : item[activeMetricTab]}
                  </span>

                  <div className="w-full max-w-[28px] h-full flex items-end">
                    <div
                      style={{ height: `${Math.max(12, heightPercent)}%` }}
                      className={`w-full rounded-t-xl transition-all duration-300 ${
                        isSelected
                          ? 'bg-gradient-to-t from-[#F94F06] to-orange-400 shadow-md shadow-orange-500/30 ring-2 ring-orange-200'
                          : idx === 6
                          ? 'bg-gradient-to-t from-orange-400 to-amber-300'
                          : 'bg-slate-200 group-hover:bg-slate-300'
                      }`}
                    />
                  </div>

                  <span className={`text-[10px] font-bold ${isSelected ? 'text-[#F94F06] font-black' : 'text-slate-400'}`}>
                    {item.day}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* =======================================================================
          SECTION 3 & 5 : DÉTAIL DE L'ENGAGEMENT + PERFORMANCE PAR FORMAT
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 3 : DÉTAIL DE L'ENGAGEMENT (5 Cols) */}
        <div className="lg:col-span-5 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-[#0F172A] flex items-center justify-between">
              <span>3. Détail de l&apos;Engagement</span>
              <span className="text-xs font-black text-[#F94F06]">{currentData.kpis.engagement} total</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Répartition des interactions spécifiques au canal.</p>
          </div>

          <div className="space-y-3">
            {currentData.engagementBreakdown.map((item) => (
              <div key={item.label} className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="flex items-center gap-2 text-slate-700">
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-900 font-black">{item.count}</span>
                    <span className="text-[10px] text-slate-400">({item.percent}%)</span>
                  </div>
                </div>
                <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${item.color}`} style={{ width: `${item.percent}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5 : PERFORMANCE PAR FORMAT (7 Cols) */}
        <div className="lg:col-span-7 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-[#0F172A] flex items-center justify-between">
              <span>5. Performance par Format de Contenu</span>
              <span className="text-xs font-bold text-slate-500">{currentData.name}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Efficacité comparée selon les types de publications.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {currentData.formatPerformance.map((f) => (
              <div key={f.format} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{f.icon}</span>
                    <span className="text-xs font-black text-slate-900 truncate">{f.format}</span>
                  </div>
                  <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-700">
                    {f.postsCount} posts
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-200/60">
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Reach Moyen</span>
                    <span className="text-sm font-black text-slate-900">{f.reachAvg}</span>
                    <span className="text-[9px] text-emerald-600 font-bold block">{f.reachGrowth}</span>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-400 block">Taux Engag.</span>
                    <span className="text-sm font-black text-[#F94F06]">{f.engagementAvg}</span>
                    <span className="text-[9px] text-slate-500 font-semibold block truncate">{f.bestMetric}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* =======================================================================
          SECTION 4 : TOP 5 DES PUBLICATIONS (FILTRÉES PAR RÉSEAU)
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>4. Top Publications du Mois — {currentData.name}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Meilleures performances générées sur ce canal.</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 space-y-2">
          {currentData.topPosts.map((post) => (
            <div key={post.id} className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 p-2.5 rounded-2xl transition-all">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                  post.rank === 1 ? 'bg-amber-400 text-slate-900 shadow-sm' : post.rank === 2 ? 'bg-slate-300 text-slate-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  #{post.rank}
                </div>

                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                  <img src={post.thumbnail} alt={post.title} className="w-full h-full object-cover" />
                </div>

                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 truncate">{post.title}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                    <span>📅 {post.date}</span>
                    <span>•</span>
                    <span className="text-[#F94F06] font-bold">{post.format}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0 pl-9 sm:pl-0 font-bold">
                <div className="text-right">
                  <span className="text-[9px] uppercase text-slate-400 block font-normal">Reach</span>
                  <span className="text-slate-900 font-black">{post.reach}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase text-slate-400 block font-normal">Interactions</span>
                  <span className="text-slate-900 font-black">{post.interactions}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] uppercase text-slate-400 block font-normal">Taux Engag.</span>
                  <span className="text-emerald-600 font-black">{post.engagementRate}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =======================================================================
          SECTION 6 & 7 : AUDIENCE & MEILLEURS MOMENTS POUR PUBLIER
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 6 : AUDIENCE */}
        <div className="lg:col-span-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-[#0F172A] flex items-center justify-between">
              <span>6. Données d&apos;Audience — {currentData.name}</span>
              <span className="text-xs font-bold text-slate-500">{currentData.kpis.followers}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Démographie spécifique et tranches d&apos;âge actives.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Top Villes</span>
              {currentData.audience.cities.map((v) => (
                <div key={v.name} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{v.flag} {v.name}</span>
                    <span>{v.percent}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#F94F06] rounded-full" style={{ width: `${v.percent}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1.5">Cœur de Cible</span>
                <div className="space-y-1 text-xs">
                  {currentData.audience.ageDistribution.map((a, i) => (
                    <div key={a.label} className="flex justify-between font-bold text-slate-700">
                      <span>{a.label}</span>
                      <span className={i === 0 ? 'text-[#F94F06] font-black' : 'text-slate-500'}>{a.percent}%</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">Genre</span>
                <div className="flex items-center gap-3 text-xs font-extrabold">
                  <span className="text-pink-600">👩 {currentData.audience.gender.women}% Femmes</span>
                  <span className="text-slate-400">•</span>
                  <span className="text-blue-600">👨 {currentData.audience.gender.men}% Hommes</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 7 : MEILLEURS MOMENTS POUR PUBLIER */}
        <div className="lg:col-span-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-black text-[#0F172A] flex items-center justify-between">
              <span>7. Meilleurs Moments pour Publier</span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">{currentData.icon} Optimisé</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Créneaux horaires recommandés pour {currentData.name}.</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 text-xs text-center">
            <div className="p-3 rounded-2xl bg-orange-50/70 border border-orange-200 space-y-1">
              <span className="text-[9px] font-black uppercase text-[#F94F06] block">1er Choix</span>
              <div className="font-black text-slate-900 truncate">{currentData.bestMoments.day1.name}</div>
              <div className="text-[10px] text-slate-600 font-bold">{currentData.bestMoments.day1.hours}</div>
              <span className="text-[9px] text-emerald-600 font-bold block">{currentData.bestMoments.day1.boost}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-500 block">2e Choix</span>
              <div className="font-black text-slate-900 truncate">{currentData.bestMoments.day2.name}</div>
              <div className="text-[10px] text-slate-600 font-bold">{currentData.bestMoments.day2.hours}</div>
              <span className="text-[9px] text-emerald-600 font-bold block">{currentData.bestMoments.day2.boost}</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-500 block">3e Choix</span>
              <div className="font-black text-slate-900 truncate">{currentData.bestMoments.day3.name}</div>
              <div className="text-[10px] text-slate-600 font-bold">{currentData.bestMoments.day3.hours}</div>
              <span className="text-[9px] text-emerald-600 font-bold block">{currentData.bestMoments.day3.boost}</span>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
            <span className="font-black text-slate-800 block">💡 Conseil Stratégique :</span>
            <p className="text-[11px]">{currentData.bestMoments.tip}</p>
          </div>
        </div>

      </div>

      {/* =======================================================================
          SECTION 8 : TRAFIC & CONVERSIONS
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
              <Target className="w-4 h-4 text-[#F94F06]" />
              <span>8. Trafic, Clics &amp; Conversions Business — {currentData.name}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Impact sur les clics de redirection et leads WhatsApp générés.</p>
          </div>
          <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-xl border border-emerald-200">
            {currentData.trafficConversions.whatsappLeads} Leads WhatsApp
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Visites du Profil</span>
            <div className="text-2xl font-black text-[#0F172A]">{currentData.trafficConversions.profileViews}</div>
            <p className="text-[10px] text-emerald-600 font-bold">{currentData.trafficConversions.profileGrowth} vs M-1</p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Clics Lien Start Page</span>
            <div className="text-2xl font-black text-[#0066FF]">{currentData.trafficConversions.linkClicks}</div>
            <p className="text-[10px] text-slate-500 font-semibold">Taux de clic (CTR) : <strong>{currentData.trafficConversions.ctr}</strong></p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">{currentData.trafficConversions.actionLabel}</span>
            <div className="text-2xl font-black text-emerald-600">{currentData.trafficConversions.actionClicks}</div>
            <p className="text-[10px] text-slate-500 font-semibold">{currentData.trafficConversions.actionPercent} des clics</p>
          </div>

          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-1">
            <span className="text-[10px] font-black uppercase text-[#F94F06] tracking-wider">Commandes / Leads</span>
            <div className="text-2xl font-black text-[#F94F06]">{currentData.trafficConversions.whatsappLeads}</div>
            <p className="text-[10px] text-slate-600 font-bold">Conversations WhatsApp qualifiées</p>
          </div>
        </div>
      </div>

      {/* =======================================================================
          SECTION 9 & 10 : INSIGHTS AUTOMATIQUES & RECOMMANDATIONS
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* SECTION 9 : INSIGHTS AUTOMATIQUES */}
        <div className="lg:col-span-6 bg-gradient-to-br from-slate-900 to-[#0F172A] text-white p-6 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute -bottom-16 -right-16 w-56 h-56 bg-[#F94F06]/15 rounded-full blur-3xl pointer-events-none"></div>

          <div className="pb-3 border-b border-slate-800 flex items-center justify-between relative z-10">
            <h2 className="text-sm font-black flex items-center gap-2 text-white">
              <Sparkles className="w-4 h-4 text-[#F94F06]" />
              <span>9. Insights Automatiques ({currentData.name})</span>
            </h2>
            <span className="text-[10px] font-black bg-[#F94F06] text-white px-2 py-0.5 rounded-full">
              IA Analytics
            </span>
          </div>

          <div className="space-y-3 text-xs relative z-10">
            {currentData.insights.map((item, i) => (
              <div key={i} className="p-3 rounded-2xl bg-white/10 border border-white/10 flex items-start gap-2.5">
                <span className="text-base">{item.icon}</span>
                <div>
                  <strong className={`${item.highlightColor} block mb-0.5`}>{item.title}</strong>
                  <p className="text-slate-300 text-[11px] leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 10 : RECOMMANDATIONS */}
        <div className="lg:col-span-6 bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-black text-[#0F172A] flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <span>10. Recommandations pour {currentData.name}</span>
            </h2>
            <span className="text-xs font-bold text-slate-500">Septembre 2026</span>
          </div>

          <div className="space-y-3 text-xs">
            {currentData.recommendations.map((rec) => (
              <div key={rec.num} className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-xl bg-orange-100 text-[#F94F06] flex items-center justify-center font-black text-xs shrink-0 mt-0.5">
                  {rec.num}
                </div>
                <div>
                  <strong className="text-slate-900 block mb-0.5">{rec.title}</strong>
                  <p className="text-slate-600 text-[11px] leading-relaxed">{rec.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* =======================================================================
          MODALE DE TÉLÉCHARGEMENT & PRÉVISUALISATION DU RAPPORT PDF CONTEXTUEL
          ======================================================================= */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl animate-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F94F06]/10 flex items-center justify-center text-[#F94F06]">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F172A]">
                    {platform === 'all'
                      ? 'Rapport de Performance Global Multi-Canal'
                      : `Rapport de Performance Dédié : ${currentData.name}`}
                  </h3>
                  <p className="text-xs text-slate-500">Document professionnel prêt à être envoyé à votre client.</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Récapitulatif du document généré */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between font-bold text-slate-700">
                <span>Client / Workspace :</span>
                <span className="text-slate-900">{activeWorkspace.name} ({activeWorkspace.country} {activeWorkspace.flag})</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Canal sélectionné :</span>
                <span className="text-[#F94F06] font-black">{currentData.icon} {currentData.name}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Période concernée :</span>
                <span className="text-slate-900">Août 2026 (Rapport Mensuel Consolidé)</span>
              </div>
              <div className="flex justify-between font-bold text-slate-700">
                <span>Sections incluses :</span>
                <span className="text-emerald-600">10 Sections complètes (KPIs, Formats, Top Posts, Audience, WhatsApp)</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleTriggerPrint}
                disabled={isDownloading}
                className="flex-1 py-3.5 px-4 bg-[#F94F06] hover:bg-[#e04605] text-white font-black text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70 transition-all"
              >
                {isDownloading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Génération du PDF en cours...</span>
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4" />
                    <span>Imprimer / Enregistrer le PDF ({currentData.name})</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsPdfModalOpen(false)}
                className="py-3.5 px-5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                Annuler
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
