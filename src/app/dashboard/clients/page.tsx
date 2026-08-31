'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Users,
  Plus,
  Send,
  Instagram,
  Facebook,
  Linkedin,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  MoreVertical,
  Building2,
  Share2,
  Calendar,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Trash2,
  Edit2,
  X,
  UploadCloud,
  Check,
  Filter
} from 'lucide-react';
import { useClient, Client } from '../../../context/ClientContext';

// Interface Client enrichie
export interface EnhancedClient {
  id: string;
  name: string;
  country: string;
  flag: string;
  category: string;
  avatar: string;
  color: string;
  whatsapp: string;
  currency: string;
  status: 'active' | 'pending_approval' | 'archived';
  statusText: string;
  scheduledPostsCount: number;
  lastContactDate: string;
  connectedAccounts: {
    instagram?: string;
    facebook?: string;
    tiktok?: string;
    linkedin?: string;
  };
  approvalRate: number;
  monthlyGoal: number;
}

// 4 Marques Réalistes Initiales
const INITIAL_CLIENTS_DATA: EnhancedClient[] = [
  {
    id: 'teranga-gourmet',
    name: 'Teranga Gourmet',
    country: 'Sénégal',
    flag: '🇸🇳',
    category: 'Haute Gastronomie & Traiteur',
    avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80',
    color: '#F94F06',
    whatsapp: '+221 77 842 19 02',
    currency: 'FCFA',
    status: 'active',
    statusText: 'Validations à jour',
    scheduledPostsCount: 8,
    lastContactDate: 'Hier à 16:45',
    connectedAccounts: {
      instagram: '@teranga_gourmet_dakar',
      facebook: 'Teranga Gourmet Dakar',
      tiktok: '@terangafood',
      linkedin: 'Teranga Gourmet Group',
    },
    approvalRate: 98,
    monthlyGoal: 24,
  },
  {
    id: 'sira-cosmetiques',
    name: 'Sira Cosmétiques Bio',
    country: 'Côte d\'Ivoire',
    flag: '🇨🇮',
    category: 'Skincare & Beauté Naturelle',
    avatar: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=400&auto=format&fit=crop&q=80',
    color: '#0066FF',
    whatsapp: '+225 07 48 92 10 33',
    currency: 'FCFA',
    status: 'pending_approval',
    statusText: '1 planning en attente',
    scheduledPostsCount: 6,
    lastContactDate: 'Aujourd\'hui à 11:20',
    connectedAccounts: {
      instagram: '@siracosmetiques_abj',
      facebook: 'Sira Cosmétiques',
      linkedin: 'Sira Group CI',
    },
    approvalRate: 94,
    monthlyGoal: 18,
  },
  {
    id: 'baobab-tech',
    name: 'Baobab Tech Hub',
    country: 'Sénégal',
    flag: '🇸🇳',
    category: 'Incubateur & SaaS FinTech',
    avatar: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400&auto=format&fit=crop&q=80',
    color: '#10B981',
    whatsapp: '+221 78 112 45 88',
    currency: 'FCFA',
    status: 'active',
    statusText: 'Validations à jour',
    scheduledPostsCount: 5,
    lastContactDate: 'Il y a 2 jours',
    connectedAccounts: {
      linkedin: 'Baobab Tech Dakar',
      facebook: 'Baobab Tech Hub',
      tiktok: '@baobabtech',
    },
    approvalRate: 100,
    monthlyGoal: 16,
  },
  {
    id: 'kinkeliba-couture',
    name: 'Kinkeliba Haute Couture',
    country: 'Sénégal',
    flag: '🇸🇳',
    category: 'Mode & Prêt-à-porter de Luxe',
    avatar: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&auto=format&fit=crop&q=80',
    color: '#8B5CF6',
    whatsapp: '+221 76 902 34 11',
    currency: 'FCFA',
    status: 'active',
    statusText: 'Validations à jour',
    scheduledPostsCount: 7,
    lastContactDate: 'Hier à 19:10',
    connectedAccounts: {
      instagram: '@kinkeliba_couture',
      facebook: 'Kinkeliba Couture',
      tiktok: '@kinkelibamode',
      linkedin: 'Kinkeliba Fashion House',
    },
    approvalRate: 96,
    monthlyGoal: 20,
  },
];

export default function ClientsPage() {
  const { setActiveClient } = useClient();

  // États
  const [clientsList, setClientsList] = useState<EnhancedClient[]>(INITIAL_CLIENTS_DATA);
  const [searchTerm, setSearchTerm] = useState('');
  const [countryFilter, setCountryFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formulaire Nouvel Onboarding
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formCountry, setFormCountry] = useState('Sénégal 🇸🇳');
  const [formCurrency, setFormCurrency] = useState('FCFA');
  const [formWhatsapp, setFormWhatsapp] = useState('');
  const [formAvatarUrl, setFormAvatarUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['instagram', 'facebook']);

  const maxClientsAllowed = 5;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtrage
  const filteredClients = useMemo(() => {
    return clientsList.filter((client) => {
      const matchSearch =
        client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        client.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCountry = countryFilter === 'all' || client.country.includes(countryFilter);
      return matchSearch && matchCountry;
    });
  }, [clientsList, searchTerm, countryFilter]);

  // Total Comptes Connectés
  const totalConnectedAccounts = useMemo(() => {
    return clientsList.reduce((acc, c) => acc + Object.keys(c.connectedAccounts || {}).length, 0);
  }, [clientsList]);

  // Basculer sur un workspace client
  const handleSelectClient = (client: EnhancedClient) => {
    setActiveClient(client as any);
    showToast(`🚀 Workspace basculé sur « ${client.name} » !`);
  };

  // Création Client
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    if (clientsList.length >= maxClientsAllowed) {
      showToast('⚠️ Limite du forfait Starter atteinte (5 marques max).');
      return;
    }

    const flag = formCountry.includes('Côte') ? '🇨🇮' : formCountry.includes('Bénin') ? '🇧🇯' : '🇸🇳';

    const newClient: EnhancedClient = {
      id: `client-${Date.now()}`,
      name: formName,
      country: formCountry,
      flag,
      category: formCategory || 'Commerce & Services',
      avatar: formAvatarUrl,
      color: '#F94F06',
      whatsapp: formWhatsapp || '+221 77 000 00 00',
      currency: formCurrency,
      status: 'active',
      statusText: 'Validations à jour',
      scheduledPostsCount: 0,
      lastContactDate: 'Créé à l\'instant',
      connectedAccounts: {
        instagram: selectedChannels.includes('instagram') ? `@${formName.toLowerCase().replace(/\s+/g, '')}` : undefined,
        facebook: selectedChannels.includes('facebook') ? formName : undefined,
        tiktok: selectedChannels.includes('tiktok') ? `@${formName.toLowerCase().replace(/\s+/g, '')}` : undefined,
        linkedin: selectedChannels.includes('linkedin') ? `${formName} Pro` : undefined,
      },
      approvalRate: 100,
      monthlyGoal: 20,
    };

    setClientsList([newClient, ...clientsList]);
    setActiveClient(newClient as any);

    setIsAddModalOpen(false);
    setFormName('');
    setFormWhatsapp('');
    setFormCategory('');
    showToast(`🎉 Workspace « ${newClient.name} » créé avec succès !`);
  };

  const toggleChannel = (channel: string) => {
    if (selectedChannels.includes(channel)) {
      setSelectedChannels(selectedChannels.filter((c) => c !== channel));
    } else {
      setSelectedChannels([...selectedChannels, channel]);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Flottant */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A]/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#F94F06]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          A. EN-TÊTE STANDARD AVEC TITRE + ACTIONS
          ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Espaces Clients & Marques Partenaires
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200/80">
              <Building2 className="w-3.5 h-3.5 text-[#0066FF]" />
              {clientsList.length} Workspaces
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Gérez vos différents workspaces de manière totalement étanche et sécurisée.
          </p>
        </div>

        {/* Droite : Jauge de Quota & Bouton Créer */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Jauge Quota Pilule */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-100/90 border border-slate-200/80 flex items-center gap-2.5 text-xs font-bold text-slate-700">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span>{clientsList.length} / {maxClientsAllowed} Marques actives</span>
            <span className="text-[10px] uppercase font-black px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500">
              Starter
            </span>
          </div>

          {/* Bouton Principal Orange */}
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-[#F94F06] hover:bg-[#e04605] text-white shadow-lg shadow-[#F94F06]/25 hover:shadow-[#F94F06]/40 active:scale-[0.98] transition-all duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>+ Onboarder une nouvelle marque</span>
          </button>

        </div>
      </div>

      {/* =======================================================================
          B. CARTES KPIS CONSOLIDÉES (3 CARTES SYNTHÉTIQUES)
          ======================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 1 : Total Workspaces */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Workspaces
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
              100% Opérationnel
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A] mt-2">
            {clientsList.length} clients actifs
          </div>
          <div className="text-xs text-slate-500 mt-1 flex items-center gap-1.5 font-medium">
            <span>Sénégal 🇸🇳</span>
            <span>·</span>
            <span>Côte d'Ivoire 🇨🇮</span>
          </div>
        </div>

        {/* KPI 2 : Profils Sociaux */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Comptes Connectés
            </span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200/60">
              Multi-Canal
            </span>
          </div>
          <div className="text-2xl font-black text-[#0F172A] mt-2">
            {totalConnectedAccounts} profils sociaux
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Instagram, Facebook, LinkedIn, TikTok
          </div>
        </div>

        {/* KPI 3 : Validation Globale */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/70 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Validation Globale
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-[#10B981]" />
              WhatsApp Direct
            </span>
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-2">
            92% des plannings à jour
          </div>
          <div className="text-xs text-slate-500 mt-1 font-medium">
            Tous les retours clients traités
          </div>
        </div>

      </div>

      {/* =======================================================================
          BARRE DE RECHERCHE & FILTRES PAYS
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        
        {/* Champ de recherche */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher une marque ou secteur..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
          />
        </div>

        {/* Filtre Pays */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-bold text-slate-500">Pays :</span>
          <select
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">Tous les pays</option>
            <option value="Sénégal">Sénégal 🇸🇳</option>
            <option value="Côte d'Ivoire">Côte d'Ivoire 🇨🇮</option>
          </select>
        </div>

      </div>

      {/* =======================================================================
          C. GRILLE DES MARQUES (BENTO GRID INTERACTIVE)
          ======================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
        
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white rounded-3xl border border-slate-200/80 shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between overflow-hidden group"
          >
            {/* Haut de Carte */}
            <div className="p-6 space-y-4">
              
              {/* En-tête Client : Avatar, Drapeau, Nom, Catégorie */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={client.avatar}
                      alt={client.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm group-hover:scale-105 transition-transform duration-300"
                    />
                    <span className="absolute -bottom-1 -right-1 text-sm bg-white shadow-xs rounded-full px-1 py-0.5 border border-slate-200">
                      {client.flag}
                    </span>
                  </div>

                  <div className="min-w-0">
                    <h3 className="text-base font-extrabold text-[#0F172A] truncate group-hover:text-[#0066FF] transition-colors">
                      {client.name}
                    </h3>
                    <div className="text-xs text-slate-500 font-medium truncate mt-0.5">
                      {client.category}
                    </div>
                  </div>
                </div>

                {/* Bouton Menu Options */}
                <button
                  type="button"
                  onClick={() => showToast(`Options pour ${client.name}`)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>

              {/* Statut WhatsApp en direct */}
              <div className="flex items-center justify-between pt-1">
                {client.status === 'active' ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                    <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                    {client.statusText}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-600 border border-amber-500/20">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                    {client.statusText}
                  </span>
                )}

                <span className="text-[11px] text-slate-400 font-medium">
                  {client.currency}
                </span>
              </div>

              {/* Comptes Sociaux Connectés */}
              <div className="bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60 space-y-2">
                <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                  Canaux connectés ({Object.keys(client.connectedAccounts || {}).length})
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  {client.connectedAccounts.instagram ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-pink-50 border border-pink-200/80 shadow-2xs hover:scale-105 transition-transform" title={client.connectedAccounts.instagram}>
                      <svg className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-2xs" viewBox="0 0 24 24" fill="none">
                        <defs>
                          <linearGradient id={`ig-cl-react-${client.id}`} x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#fdf497"/>
                            <stop offset="45%" stopColor="#fd5949"/>
                            <stop offset="60%" stopColor="#d6249f"/>
                            <stop offset="90%" stopColor="#285AEB"/>
                          </linearGradient>
                        </defs>
                        <rect width="24" height="24" rx="6" fill={`url(#ig-cl-react-${client.id})`}/>
                        <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#FFFFFF" strokeWidth="1.6" fill="none"/>
                        <circle cx="12" cy="12" r="3.2" stroke="#FFFFFF" strokeWidth="1.6" fill="none"/>
                        <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF"/>
                      </svg>
                      <span className="text-[10px] font-extrabold text-pink-900">Instagram</span>
                    </div>
                  ) : null}

                  {client.connectedAccounts.facebook ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200/80 shadow-2xs hover:scale-105 transition-transform" title={client.connectedAccounts.facebook}>
                      <svg className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-2xs" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="6" fill="#1877F2"/>
                        <path d="M16.5 12.5h-2.5V20h-3.2v-7.5H9v-2.8h1.8V7.9c0-1.8 1.1-3 2.9-3 1 0 1.9.1 1.9.1v2.1h-1.1c-1 0-1.3.6-1.3 1.2v1.5h2.5l-.4 2.8z" fill="#FFFFFF"/>
                      </svg>
                      <span className="text-[10px] font-extrabold text-blue-900">Facebook</span>
                    </div>
                  ) : null}

                  {client.connectedAccounts.tiktok ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 shadow-2xs hover:scale-105 transition-transform text-white" title={client.connectedAccounts.tiktok}>
                      <svg className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-2xs" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="6" fill="#000000"/>
                        <path d="M14.5 5.5v7.2a3.3 3.3 0 1 1-3.3-3.3c.3 0 .7.1 1 .2V7.1a5.6 5.6 0 1 0 4.5 5.5V8.8a5.5 5.5 0 0 0 3.3 1.1V7.6a3.5 3.5 0 0 1-3.3-2.1h-2.2z" fill="#FFFFFF"/>
                      </svg>
                      <span className="text-[10px] font-extrabold text-white">TikTok</span>
                    </div>
                  ) : null}

                  {client.connectedAccounts.linkedin ? (
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-50 border border-sky-200/80 shadow-2xs hover:scale-105 transition-transform" title={client.connectedAccounts.linkedin}>
                      <svg className="w-3.5 h-3.5 rounded-sm shrink-0 shadow-2xs" viewBox="0 0 24 24" fill="none">
                        <rect width="24" height="24" rx="6" fill="#0A66C2"/>
                        <path d="M7 9h2.2v8H7V9zm1.1-3.5c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3zM10.8 9H13v1.1h.1c.3-.6 1.1-1.3 2.3-1.3 2.5 0 3 1.6 3 3.8V17h-2.2v-3.7c0-.9 0-2-1.2-2s-1.4 1-1.4 2V17h-2.2V9z" fill="#FFFFFF"/>
                      </svg>
                      <span className="text-[10px] font-extrabold text-sky-900">LinkedIn</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* Métriques d'Activité Récentes */}
              <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Volume Prévu</span>
                  <span className="font-extrabold text-slate-800">{client.scheduledPostsCount} posts ce mois</span>
                </div>

                <div className="bg-slate-50/50 p-2.5 rounded-xl border border-slate-100">
                  <span className="text-[10px] text-slate-400 block font-semibold">Dernier Contact</span>
                  <span className="font-extrabold text-slate-800 truncate block">{client.lastContactDate}</span>
                </div>
              </div>

            </div>

            {/* Pied de Carte : Actions Rapides */}
            <div className="p-4 bg-slate-50/70 border-t border-slate-100 rounded-b-3xl flex items-center gap-2">
              
              {/* Bouton Principal : Ouvrir Cockpit */}
              <Link
                href="/dashboard"
                onClick={() => handleSelectClient(client)}
                className="flex-1 py-2.5 px-3.5 rounded-xl text-xs font-extrabold bg-[#0F172A] hover:bg-slate-800 text-white flex items-center justify-center gap-1.5 shadow-sm transition-all text-center"
              >
                <span>Ouvrir Cockpit</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>

              {/* Bouton Secondaire : WhatsApp Direct */}
              <a
                href={`https://wa.me/${client.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${client.name} ! Voici les dernières actualités de votre compte CMFlow.`)}`}
                target="_blank"
                rel="noreferrer"
                title={`Contacter sur WhatsApp (${client.whatsapp})`}
                className="p-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-[#059669] border border-emerald-500/25 transition-colors flex items-center justify-center"
              >
                <Send className="w-4 h-4 text-[#10B981]" />
              </a>

            </div>
          </div>
        ))}

        {/* =====================================================================
            D. CARTE "AJOUTER UNE MARQUE" (EMPTY STATE INVITATIF)
            ===================================================================== */}
        <div
          onClick={() => setIsAddModalOpen(true)}
          className="rounded-3xl border-2 border-dashed border-slate-300 hover:border-[#F94F06]/50 bg-white/50 hover:bg-orange-50/20 p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 min-h-[360px] group shadow-2xs hover:shadow-md"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-100 text-[#F94F06] group-hover:scale-110 flex items-center justify-center transition-transform duration-300 shadow-sm mb-4">
            <Plus className="w-7 h-7" />
          </div>

          <h3 className="text-base font-extrabold text-[#0F172A] group-hover:text-[#F94F06] transition-colors">
            Ajouter un nouveau client
          </h3>
          <p className="text-xs text-slate-500 max-w-xs mt-1.5 leading-relaxed font-medium">
            Configurez son espace de validation WhatsApp direct en moins de 2 minutes.
          </p>

          <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-extrabold text-[#F94F06] group-hover:underline">
            <span>+ Lancer l'onboarding</span>
          </span>
        </div>

      </div>

      {/* =======================================================================
          E. MODALE D'ONBOARDING CLIENT (FORMULAIRE INTERACTIF)
          ======================================================================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 animate-fadeIn max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-100 text-[#F94F06] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Onboarder une Marque
                  </h3>
                  <p className="text-xs text-slate-500">Nouveau Workspace sécurisé</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateClient} className="space-y-4">
              
              {/* Étape 1 : Identité de la marque */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nom de l'entreprise / Marque *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="ex: Dakar Digital Studio"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Secteur d'activité
                </label>
                <input
                  type="text"
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  placeholder="ex: Restauration, Cosmétiques, FinTech..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Pays
                  </label>
                  <select
                    value={formCountry}
                    onChange={(e) => setFormCountry(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value="Sénégal 🇸🇳">Sénégal 🇸🇳</option>
                    <option value="Côte d'Ivoire 🇨🇮">Côte d'Ivoire 🇨🇮</option>
                    <option value="Bénin 🇧🇯">Bénin 🇧🇯</option>
                    <option value="Cameroun 🇨🇲">Cameroun 🇨🇲</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Devise Facturation
                  </label>
                  <select
                    value={formCurrency}
                    onChange={(e) => setFormCurrency(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value="FCFA">FCFA (XOF/XAF)</option>
                    <option value="EUR">EUR (€)</option>
                    <option value="USD">USD ($)</option>
                  </select>
                </div>
              </div>

              {/* Étape 2 : Coordonnées WhatsApp du décideur */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Numéro WhatsApp du Décideur *
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={formWhatsapp}
                    onChange={(e) => setFormWhatsapp(e.target.value)}
                    placeholder="+221 77 800 00 00"
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#10B981]"
                  />
                  <Send className="w-4 h-4 text-[#10B981] absolute right-3 top-1/2 -translate-y-1/2" />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Utilisé pour envoyer les liens de validation magiques sans mot de passe.
                </p>
              </div>

              {/* Étape 3 : Canaux Sociaux Initiaux */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Canaux Sociaux à Associer
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    {
                      id: 'instagram',
                      label: 'Instagram',
                      renderIcon: () => (
                        <svg className="w-3.5 h-3.5 rounded-sm shrink-0" viewBox="0 0 24 24" fill="none">
                          <defs>
                            <linearGradient id="ig-modal-grad" x1="0%" y1="100%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#fdf497"/>
                              <stop offset="45%" stopColor="#fd5949"/>
                              <stop offset="60%" stopColor="#d6249f"/>
                              <stop offset="90%" stopColor="#285AEB"/>
                            </linearGradient>
                          </defs>
                          <rect width="24" height="24" rx="6" fill="url(#ig-modal-grad)"/>
                          <rect x="5.5" y="5.5" width="13" height="13" rx="3.5" stroke="#FFFFFF" strokeWidth="1.6" fill="none"/>
                          <circle cx="12" cy="12" r="3.2" stroke="#FFFFFF" strokeWidth="1.6" fill="none"/>
                          <circle cx="15.8" cy="8.2" r="0.9" fill="#FFFFFF"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'facebook',
                      label: 'Facebook',
                      renderIcon: () => (
                        <svg className="w-3.5 h-3.5 rounded-sm shrink-0" viewBox="0 0 24 24" fill="none">
                          <rect width="24" height="24" rx="6" fill="#1877F2"/>
                          <path d="M16.5 12.5h-2.5V20h-3.2v-7.5H9v-2.8h1.8V7.9c0-1.8 1.1-3 2.9-3 1 0 1.9.1 1.9.1v2.1h-1.1c-1 0-1.3.6-1.3 1.2v1.5h2.5l-.4 2.8z" fill="#FFFFFF"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'tiktok',
                      label: 'TikTok',
                      renderIcon: () => (
                        <svg className="w-3.5 h-3.5 rounded-sm shrink-0" viewBox="0 0 24 24" fill="none">
                          <rect width="24" height="24" rx="6" fill="#000000"/>
                          <path d="M14.5 5.5v7.2a3.3 3.3 0 1 1-3.3-3.3c.3 0 .7.1 1 .2V7.1a5.6 5.6 0 1 0 4.5 5.5V8.8a5.5 5.5 0 0 0 3.3 1.1V7.6a3.5 3.5 0 0 1-3.3-2.1h-2.2z" fill="#FFFFFF"/>
                        </svg>
                      ),
                    },
                    {
                      id: 'linkedin',
                      label: 'LinkedIn',
                      renderIcon: () => (
                        <svg className="w-3.5 h-3.5 rounded-sm shrink-0" viewBox="0 0 24 24" fill="none">
                          <rect width="24" height="24" rx="6" fill="#0A66C2"/>
                          <path d="M7 9h2.2v8H7V9zm1.1-3.5c.7 0 1.3.6 1.3 1.3 0 .7-.6 1.3-1.3 1.3-.7 0-1.3-.6-1.3-1.3 0-.7.6-1.3 1.3-1.3zM10.8 9H13v1.1h.1c.3-.6 1.1-1.3 2.3-1.3 2.5 0 3 1.6 3 3.8V17h-2.2v-3.7c0-.9 0-2-1.2-2s-1.4 1-1.4 2V17h-2.2V9z" fill="#FFFFFF"/>
                        </svg>
                      ),
                    },
                  ].map((chan) => (
                    <button
                      key={chan.id}
                      type="button"
                      onClick={() => toggleChannel(chan.id)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        selectedChannels.includes(chan.id)
                          ? 'border-[#0066FF] bg-blue-50/70 text-[#0066FF] shadow-xs ring-1 ring-[#0066FF]/30'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {chan.renderIcon()}
                      <span>{chan.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Boutons */}
              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold bg-[#F94F06] hover:bg-[#e04605] text-white rounded-xl shadow-lg shadow-[#F94F06]/25 transition-all"
                >
                  Créer le Workspace & Onboarder
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
