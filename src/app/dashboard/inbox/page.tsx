'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import {
  MessageSquare,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Send,
  Sparkles,
  Paperclip,
  Smile,
  ExternalLink,
  ChevronRight,
  Filter,
  Star,
  CornerDownRight,
  Calendar,
  Share2,
  ArrowLeft,
  Check,
  Zap,
  Info,
  ChevronDown
} from 'lucide-react';
import { useClient } from '../../../context/ClientContext';

// Types
export type ChannelType = 'whatsapp' | 'instagram' | 'facebook' | 'linkedin';
export type IntentTag = 'revision' | 'validation' | 'inquiry' | 'general';

export interface ChatMessage {
  id: string;
  sender: 'client' | 'agent';
  senderName: string;
  text: string;
  timestamp: string;
  status?: 'sent' | 'delivered' | 'read';
}

export interface PostContextData {
  title: string;
  scheduledDate: string;
  thumbnail: string;
  status: 'pending' | 'approved' | 'revision';
  network: string;
}

export interface InboxThread {
  id: string;
  contactName: string;
  contactHandle?: string;
  contactAvatar: string;
  channel: ChannelType;
  unread: boolean;
  starred: boolean;
  intent: IntentTag;
  intentLabel: string;
  lastMessageTime: string;
  lastMessageSnippet: string;
  postContext?: PostContextData;
  messages: ChatMessage[];
}

// 4 Conversations Mockées
const INITIAL_THREADS: InboxThread[] = [
  {
    id: 'thread-1',
    contactName: 'Mamadou Dieng (Dir. Marketing)',
    contactHandle: '+221 77 800 12 34',
    contactAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    channel: 'whatsapp',
    unread: true,
    starred: true,
    intent: 'revision',
    intentLabel: 'Modification demandée',
    lastMessageTime: 'il y a 8 min',
    lastMessageSnippet: 'Super visuel, mais pouvez-vous corriger le prix à 4 500 FCFA au lieu de 5 000 ?',
    postContext: {
      title: 'Thiéboudienne Penda Mbaye Royal',
      scheduledDate: '24 Août 2026 à 12:30',
      thumbnail: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&auto=format&fit=crop&q=80',
      status: 'revision',
      network: 'Instagram & Facebook',
    },
    messages: [
      {
        id: 'm1',
        sender: 'agent',
        senderName: 'Awa Diop (CMFlow)',
        text: 'Bonjour M. Dieng ! Voici la maquette du post de lundi prochain pour la formule déjeuner.',
        timestamp: '14:15',
      },
      {
        id: 'm2',
        sender: 'client',
        senderName: 'Mamadou Dieng',
        text: 'Superbe visuel et très beau texte ! Mais pouvez-vous corriger le prix à 4 500 FCFA au lieu de 5 000 FCFA sur l\'affiche ? Merci beaucoup !',
        timestamp: '14:22',
      },
    ],
  },
  {
    id: 'thread-2',
    contactName: 'Aïcha Traoré (Gérante)',
    contactHandle: '+221 78 450 99 00',
    contactAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    channel: 'whatsapp',
    unread: false,
    starred: true,
    intent: 'validation',
    intentLabel: 'Validation confirmée',
    lastMessageTime: 'il y a 42 min',
    lastMessageSnippet: 'Tout est validé pour le carrousel Brunch de dimanche ! 🎉',
    postContext: {
      title: 'Carrousel Brunch Teranga Dimanche',
      scheduledDate: '25 Août 2026 à 10:00',
      thumbnail: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&auto=format&fit=crop&q=80',
      status: 'approved',
      network: 'Instagram Carousel',
    },
    messages: [
      {
        id: 'm3',
        sender: 'agent',
        senderName: 'Awa Diop',
        text: 'Bonjour Aïcha, le lien de validation du Brunch est disponible ici : cmflow.me/v/trk89',
        timestamp: '11:00',
      },
      {
        id: 'm4',
        sender: 'client',
        senderName: 'Aïcha Traoré',
        text: 'Parfait, j\'ai regardé sur mon téléphone. Tout est validé pour le carrousel Brunch de dimanche ! 🎉 Bon travail.',
        timestamp: '13:48',
      },
    ],
  },
  {
    id: 'thread-3',
    contactName: 'Amadou Sow',
    contactHandle: '@amadou_sow_dk',
    contactAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    channel: 'instagram',
    unread: true,
    starred: false,
    intent: 'inquiry',
    intentLabel: 'Question livraison / DM',
    lastMessageTime: 'il y a 1h',
    lastMessageSnippet: 'Bonjour, vos plats sont-ils disponibles en livraison sur Dakar Plateau ?',
    messages: [
      {
        id: 'm5',
        sender: 'client',
        senderName: 'Amadou Sow',
        text: 'Bonjour, vos plats du midi sont-ils disponibles en livraison express sur Dakar Plateau ? Et quel est le délai moyen ?',
        timestamp: '13:12',
      },
    ],
  },
  {
    id: 'thread-4',
    contactName: 'Fatou Bintou Ndiaye',
    contactHandle: 'Sur Facebook Post #124',
    contactAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    channel: 'facebook',
    unread: false,
    starred: false,
    intent: 'general',
    intentLabel: 'Commentaire public',
    lastMessageTime: 'Hier',
    lastMessageSnippet: 'Quel est le numéro de contact WhatsApp pour réserver ?',
    messages: [
      {
        id: 'm6',
        sender: 'client',
        senderName: 'Fatou Bintou Ndiaye',
        text: 'Bonjour, quel est votre numéro de contact WhatsApp pour réserver une table de 6 personnes samedi soir ?',
        timestamp: 'Hier à 19:40',
      },
      {
        id: 'm7',
        sender: 'agent',
        senderName: 'Awa Diop',
        text: 'Bonjour Fatou ! Vous pouvez nous contacter directement sur WhatsApp au +221 77 800 12 34 ou via le lien dans notre bio. À très bientôt !',
        timestamp: 'Hier à 19:55',
      },
    ],
  },
];

// Réponses pré-enregistrées
const QUICK_SNIPPETS = [
  'C\'est bien noté, nous effectuons la retouche immédiatement ! 🎨',
  'Merci pour votre validation ! Le post est programmé. 🚀',
  'Bonjour ! Vous pouvez passer commande directement sur WhatsApp au +221 77 800 12 34 🍽️',
  'Merci pour votre retour chaleureux, à très vite chez Teranga Gourmet ! ✨',
];

export default function InboxPage() {
  const { activeClient } = useClient();

  // États
  const [threads, setThreads] = useState<InboxThread[]>(INITIAL_THREADS);
  const [activeThreadId, setActiveThreadId] = useState<string>('thread-1');
  const [channelFilter, setChannelFilter] = useState<'all' | 'whatsapp' | 'instagram' | 'facebook' | 'linkedin' | 'starred'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [replyText, setReplyText] = useState('');
  const [sendMode, setSendMode] = useState<'whatsapp' | 'social'>('whatsapp');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Conversation sélectionnée
  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  // Compteurs
  const unreadCount = threads.filter((t) => t.unread).length;
  const whatsappFeedbackCount = threads.filter((t) => t.channel === 'whatsapp' && t.intent === 'revision').length;

  // Filtrage
  const filteredThreads = threads.filter((thread) => {
    const matchChannel =
      channelFilter === 'all'
        ? true
        : channelFilter === 'starred'
        ? thread.starred
        : thread.channel === channelFilter;

    const matchSearch =
      thread.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.lastMessageSnippet.toLowerCase().includes(searchQuery.toLowerCase());

    return matchChannel && matchSearch;
  });

  // Envoi de message
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'agent',
      senderName: 'Awa Diop (CMFlow)',
      text: replyText,
      timestamp: 'À l\'instant',
      status: 'sent',
    };

    setThreads((prev) =>
      prev.map((t) => {
        if (t.id === activeThreadId) {
          return {
            ...t,
            unread: false,
            lastMessageTime: 'À l\'instant',
            lastMessageSnippet: replyText,
            messages: [...t.messages, newMsg],
          };
        }
        return t;
      })
    );

    setReplyText('');
    showToast(sendMode === 'whatsapp' ? '💬 Réponse envoyée directement sur WhatsApp !' : '📱 Réponse publiée sur le réseau social !');
  };

  // Basculer Favori
  const toggleStar = (threadId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setThreads((prev) =>
      prev.map((t) => (t.id === threadId ? { ...t, starred: !t.starred } : t))
    );
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
              Boîte de Réception & Retours Clients
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
              {activeClient.name} {activeClient.flag}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Centralisez les retours de validation WhatsApp et les commentaires réseaux sociaux.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => showToast('🔄 Actualisation de tous les flux en cours...')}
            className="px-4 py-2.5 rounded-2xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs border border-slate-200/80 transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#0066FF]" />
            <span>Synchroniser</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          ARCHITECTURE EN 3 VOLETS ÉPURÉS (Style Dribbble / Linear)
          ======================================================================= */}
      <div className="h-[calc(100vh-16rem)] min-h-[600px] grid grid-cols-1 md:grid-cols-12 gap-4 bg-white/70 backdrop-blur-md rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden p-2">
        
        {/* =====================================================================
            VOLET 1 : CANAUX & DOSSIERS INTELLIGENTS (Navigation Gauche)
            ===================================================================== */}
        <div className="hidden lg:flex lg:col-span-3 flex-col justify-between p-3.5 bg-slate-50/70 rounded-2xl border border-slate-200/60 overflow-y-auto">
          <div className="space-y-4">
            
            {/* En-tête Dossier */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F94F06] flex items-center justify-center font-bold shadow-2xs">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-xs font-black text-[#0F172A] tracking-tight uppercase">
                    Boîte de Réception
                  </h2>
                  <div className="text-[10px] text-slate-400 font-bold">
                    {activeClient.name} {activeClient.flag}
                  </div>
                </div>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">
                {unreadCount} non-lus
              </span>
            </div>

            {/* Liste des Filtres Pilules */}
            <div className="space-y-1 text-xs font-bold text-slate-600">
              
              {/* Retours WhatsApp */}
              <button
                type="button"
                onClick={() => setChannelFilter('whatsapp')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  channelFilter === 'whatsapp'
                    ? 'bg-[#10B981] text-white shadow-md shadow-emerald-500/20'
                    : 'hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${channelFilter === 'whatsapp' ? 'bg-white' : 'bg-[#10B981]'}`}></span>
                  <span>Retours WhatsApp</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${channelFilter === 'whatsapp' ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'}`}>
                  {whatsappFeedbackCount}
                </span>
              </button>

              {/* Tous les DMs */}
              <button
                type="button"
                onClick={() => setChannelFilter('all')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  channelFilter === 'all'
                    ? 'bg-[#0F172A] text-white shadow-md'
                    : 'hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Tous les Messages</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${channelFilter === 'all' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'}`}>
                  {threads.length}
                </span>
              </button>

              {/* Instagram DMs */}
              <button
                type="button"
                onClick={() => setChannelFilter('instagram')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  channelFilter === 'instagram'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                    : 'hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">📸</span>
                  <span>Instagram DMs</span>
                </div>
              </button>

              {/* Facebook Messenger */}
              <button
                type="button"
                onClick={() => setChannelFilter('facebook')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  channelFilter === 'facebook'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-[11px]">📘</span>
                  <span>Facebook Comments</span>
                </div>
              </button>

              {/* Épinglés */}
              <button
                type="button"
                onClick={() => setChannelFilter('starred')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all ${
                  channelFilter === 'starred'
                    ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                    : 'hover:bg-slate-200/70 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Star className="w-3.5 h-3.5" />
                  <span>Favoris & Épinglés</span>
                </div>
              </button>

            </div>
          </div>

          {/* Statut Sync temps réel */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/80 space-y-1">
            <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-600">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Synchronisation Live 4G/3G
            </div>
            <div className="text-[10px] text-slate-400">WhatsApp & Meta API connectés</div>
          </div>
        </div>

        {/* =====================================================================
            VOLET 2 : LISTE DES CONVERSATIONS (Flux Central)
            ===================================================================== */}
        <div
          className={`${
            isMobileDetailOpen ? 'hidden' : 'flex'
          } md:flex md:col-span-5 lg:col-span-4 flex-col border-r border-slate-200/60 min-h-0 bg-white/50`}
        >
          {/* Recherche & Filtre Rapide */}
          <div className="p-3 border-b border-slate-200/60 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher un message ou contact... (⌘K)"
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
              />
            </div>
          </div>

          {/* Liste Scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-1.5 space-y-1">
            {filteredThreads.map((thread) => {
              const isActive = thread.id === activeThreadId;

              return (
                <div
                  key={thread.id}
                  onClick={() => {
                    setActiveThreadId(thread.id);
                    setIsMobileDetailOpen(true);
                  }}
                  className={`p-3 rounded-2xl cursor-pointer transition-all duration-200 flex flex-col gap-1.5 relative ${
                    isActive
                      ? 'bg-white shadow-md border border-slate-200/90 ring-1 ring-[#0F172A]/10'
                      : 'hover:bg-slate-50/80 border border-transparent'
                  }`}
                >
                  {/* Ligne 1 : Avatar, Canal & Heure */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="relative shrink-0">
                        <img
                          src={thread.contactAvatar}
                          alt={thread.contactName}
                          className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200"
                        />
                        {/* Badge Canal en Superposition */}
                        <span
                          className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] text-white ${
                            thread.channel === 'whatsapp'
                              ? 'bg-[#10B981]'
                              : thread.channel === 'instagram'
                              ? 'bg-purple-600'
                              : 'bg-blue-600'
                          }`}
                        >
                          {thread.channel === 'whatsapp' ? 'W' : thread.channel === 'instagram' ? 'IG' : 'FB'}
                        </span>
                      </div>

                      <div className="min-w-0">
                        <div className={`text-xs truncate ${thread.unread ? 'font-black text-[#0F172A]' : 'font-bold text-slate-700'}`}>
                          {thread.contactName}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <span className="text-[10px] text-slate-400 font-medium">{thread.lastMessageTime}</span>
                      <button
                        type="button"
                        onClick={(e) => toggleStar(thread.id, e)}
                        className="text-slate-300 hover:text-amber-500 p-0.5"
                      >
                        <Star className={`w-3.5 h-3.5 ${thread.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  {/* Ligne 2 : Tag d'Intention */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                        thread.intent === 'revision'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : thread.intent === 'validation'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {thread.intentLabel}
                    </span>
                    {thread.unread && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#F94F06]"></span>
                    )}
                  </div>

                  {/* Ligne 3 : Snippet */}
                  <p className={`text-xs truncate ${thread.unread ? 'font-extrabold text-slate-900' : 'text-slate-500'}`}>
                    {thread.lastMessageSnippet}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* =====================================================================
            VOLET 3 : FIL DE DISCUSSION & TRAITEMENT RAPIDE (Zone Droite)
            ===================================================================== */}
        <div
          className={`${
            !isMobileDetailOpen ? 'hidden' : 'flex'
          } md:flex md:col-span-7 lg:col-span-5 flex-col bg-white rounded-2xl border border-slate-200/80 min-h-0 overflow-hidden shadow-xs`}
        >
          {/* En-tête Conversation */}
          <div className="p-3.5 border-b border-slate-200/70 flex items-center justify-between gap-3 bg-slate-50/50">
            <div className="flex items-center gap-2.5 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileDetailOpen(false)}
                className="md:hidden p-1.5 rounded-lg bg-slate-200 text-slate-700"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>

              <img
                src={activeThread.contactAvatar}
                alt={activeThread.contactName}
                className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-200 shrink-0"
              />

              <div className="min-w-0">
                <div className="text-xs font-black text-[#0F172A] truncate">
                  {activeThread.contactName}
                </div>
                <div className="text-[10px] text-slate-400 font-bold flex items-center gap-1.5">
                  <span className="capitalize">{activeThread.channel}</span> · {activeThread.contactHandle}
                </div>
              </div>
            </div>

            {/* Action WhatsApp Direct */}
            <a
              href={`https://wa.me/221778001234`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#059669] font-extrabold text-[11px] rounded-xl border border-[#10B981]/30 transition-all shrink-0"
            >
              <Share2 className="w-3 h-3 text-[#10B981]" />
              <span>Ouvrir WhatsApp</span>
            </a>
          </div>

          {/* Corps de Discussion (Chat) */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#F8FAFC]/50">
            
            {/* Widget Spécial : Contexte du Post en Validation */}
            {activeThread.postContext && (
              <div className="bg-gradient-to-r from-orange-50/80 to-amber-50/50 border border-orange-200/80 rounded-2xl p-3 flex items-center justify-between gap-3 shadow-2xs">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={activeThread.postContext.thumbnail}
                    alt="Post Thumbnail"
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-orange-300 shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="text-[10px] font-black uppercase text-[#F94F06] tracking-wider">
                      Contexte de Validation
                    </div>
                    <div className="text-xs font-extrabold text-[#0F172A] truncate">
                      {activeThread.postContext.title}
                    </div>
                    <div className="text-[10px] text-slate-500 font-medium">
                      📅 {activeThread.postContext.scheduledDate}
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full shrink-0 ${
                    activeThread.postContext.status === 'revision'
                      ? 'bg-amber-100 text-amber-800 border border-amber-300'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}
                >
                  {activeThread.postContext.status === 'revision' ? 'Retouche demandée' : 'Validé'}
                </span>
              </div>
            )}

            {/* Bulles de Messages */}
            {activeThread.messages.map((msg) => {
              const isAgent = msg.sender === 'agent';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'} space-y-1`}
                >
                  <span className="text-[10px] text-slate-400 font-bold px-1">
                    {msg.senderName} · {msg.timestamp}
                  </span>

                  <div
                    className={`max-w-[85%] sm:max-w-md p-3 rounded-2xl text-xs leading-relaxed ${
                      isAgent
                        ? 'bg-[#F94F06] text-white rounded-tr-xs shadow-md shadow-[#F94F06]/20'
                        : 'bg-white text-slate-800 rounded-tl-xs border border-slate-200/90 shadow-2xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              );
            })}

          </div>

          {/* Zone de Rédaction (Composer Haut de Gamme) */}
          <div className="p-3.5 border-t border-slate-200/80 bg-white space-y-2.5">
            
            {/* Snippets Rapides */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
              <span className="text-slate-400 font-bold text-[10px] shrink-0 flex items-center gap-0.5">
                <Zap className="w-3 h-3 text-[#F94F06]" /> Snippets :
              </span>
              {QUICK_SNIPPETS.map((snippet, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReplyText(snippet)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-orange-50 hover:text-[#F94F06] hover:border-orange-200 text-slate-700 font-bold rounded-lg border border-slate-200/70 whitespace-nowrap transition-colors"
                >
                  {snippet.length > 28 ? `${snippet.substring(0, 28)}...` : snippet}
                </button>
              ))}
            </div>

            {/* Formulaire de Réponse */}
            <form onSubmit={handleSendMessage} className="space-y-2">
              <div className="relative">
                <textarea
                  rows={2}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Rédigez votre réponse ou utilisez un snippet..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06] resize-none"
                />
              </div>

              <div className="flex items-center justify-between gap-2">
                
                {/* Sélecteur Mode d'Envoi */}
                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setSendMode('whatsapp')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      sendMode === 'whatsapp' ? 'bg-[#10B981] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    WhatsApp Direct
                  </button>
                  <button
                    type="button"
                    onClick={() => setSendMode('social')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${
                      sendMode === 'social' ? 'bg-[#0F172A] text-white shadow-2xs' : 'text-slate-600'
                    }`}
                  >
                    Réseau Social
                  </button>
                </div>

                {/* Bouton d'Envoi */}
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#F94F06] hover:bg-[#e04605] disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-lg shadow-[#F94F06]/25 active:scale-[0.98] transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Envoyer</span>
                </button>

              </div>
            </form>

          </div>

        </div>

      </div>

    </div>
  );
}
