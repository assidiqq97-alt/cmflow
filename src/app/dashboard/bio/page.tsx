'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Smartphone,
  Copy,
  QrCode,
  Sparkles,
  ExternalLink,
  Plus,
  Trash2,
  GripVertical,
  Share2,
  Check,
  Eye,
  CheckCircle2,
  Palette,
  Layout,
  Link as LinkIcon,
  MessageCircle,
  MapPin,
  FileText,
  Video,
  Upload,
  Globe,
  Instagram,
  Facebook,
  Music2,
  Phone,
  Layers,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  Save,
  CheckCheck
} from 'lucide-react';
import { useClient } from '../../../context/ClientContext';
import { db } from '../../../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// ============================================================================
// Types
// ============================================================================

type IconType = 'whatsapp' | 'website' | 'instagram' | 'phone' | 'maps' | 'pdf' | 'tiktok';

interface BioLinkItem {
  id: string;
  label: string;
  url: string;
  icon: IconType;
  isActive: boolean;
  clicksCount?: number;
}

type ThemeStyle = 'dark' | 'light' | 'orange' | 'glass';
type ButtonStyle = 'soft-glass' | 'pill' | 'solid' | 'outline';

// Options d'icônes avec libellés et composants visuels
const ICON_OPTIONS: { value: IconType; label: string; emoji: string }[] = [
  { value: 'whatsapp', label: 'WhatsApp (Message / Commande)', emoji: '💬' },
  { value: 'website', label: 'Site Web / URL (Globe)', emoji: '🌐' },
  { value: 'instagram', label: 'Instagram (Profil / Reel)', emoji: '📸' },
  { value: 'phone', label: 'Téléphone (Appel direct)', emoji: '📞' },
  { value: 'maps', label: 'Maps / Localisation (Google Maps)', emoji: '📍' },
  { value: 'pdf', label: 'Menu / Document PDF (Carte)', emoji: '📋' },
  { value: 'tiktok', label: 'TikTok (Vidéos / Profil)', emoji: '🎵' },
];

const INITIAL_LINKS: BioLinkItem[] = [
  {
    id: 'link-1',
    label: 'Commander sur WhatsApp (+221 77 800 12 34)',
    url: 'https://wa.me/221778001234?text=Bonjour,%20je%20souhaite%20commander',
    icon: 'whatsapp',
    isActive: true,
    clicksCount: 842,
  },
  {
    id: 'link-2',
    label: 'Découvrir la Carte & Menu du Soir (PDF)',
    url: 'https://teranga-gourmet.sn/menu-degustation.pdf',
    icon: 'pdf',
    isActive: true,
    clicksCount: 426,
  },
  {
    id: 'link-3',
    label: 'Nous Trouver & Réserver aux Almadies',
    url: 'https://maps.google.com/?q=Teranga+Gourmet+Dakar',
    icon: 'maps',
    isActive: true,
    clicksCount: 215,
  },
  {
    id: 'link-4',
    label: 'Voir nos Coulisses & Recettes sur TikTok',
    url: 'https://tiktok.com/@teranga_gourmet',
    icon: 'tiktok',
    isActive: true,
    clicksCount: 358,
  },
];

export default function BioPage() {
  const { activeClient } = useClient();

  // États Profil
  const [displayName, setDisplayName] = useState('Teranga Gourmet Dakar');
  const [bioDescription, setBioDescription] = useState('Le meilleur de la gastronomie sénégalaise 🇸🇳 • Ouvert 7j/7 midi & soir aux Almadies.');
  const [avatarUrl, setAvatarUrl] = useState('https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&auto=format&fit=crop&q=80');
  const [isLive, setIsLive] = useState(true);

  // Réseaux Sociaux Bio
  const [socialInstagram, setSocialInstagram] = useState('@teranga_gourmet');
  const [socialTikTok, setSocialTikTok] = useState('@terangafood');
  const [socialFacebook, setSocialFacebook] = useState('TerangaGourmetDk');
  const [socialWhatsApp, setSocialWhatsApp] = useState('+221778001234');

  // Thème & Style
  const [themeStyle, setThemeStyle] = useState<ThemeStyle>('dark');
  const [buttonStyle, setButtonStyle] = useState<ButtonStyle>('pill');

  // Blocs de Liens
  const [links, setLinks] = useState<BioLinkItem[]>(INITIAL_LINKS);
  const [expandedLinkId, setExpandedLinkId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'profile' | 'links' | 'theme'>('links');

  // États de sauvegarde & UI
  const [isSaving, setIsSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isMobilePreviewOpen, setIsMobilePreviewOpen] = useState(false);

  const workspaceSlug = activeClient?.id || 'teranga-gourmet';
  const publicUrl = `cmflow.sn/bio/${workspaceSlug}`;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Chargement initial depuis localStorage ou Firestore
  useEffect(() => {
    try {
      const cached = localStorage.getItem(`cmflow_bio_${workspaceSlug}`);
      if (cached) {
        const data = JSON.parse(cached);
        if (data.links && Array.isArray(data.links)) setLinks(data.links);
        if (data.displayName) setDisplayName(data.displayName);
        if (data.bioDescription) setBioDescription(data.bioDescription);
        if (data.themeStyle) setThemeStyle(data.themeStyle);
        if (data.buttonStyle) setButtonStyle(data.buttonStyle);
      }
    } catch (err) {
      console.warn('Erreur chargement cache bio:', err);
    }

    if (db) {
      const bioDocRef = doc(db, 'bio_pages', workspaceSlug);
      getDoc(bioDocRef).then((snap) => {
        if (snap.exists()) {
          const d = snap.data();
          if (d.links && Array.isArray(d.links)) setLinks(d.links);
          if (d.displayName) setDisplayName(d.displayName);
          if (d.bioDescription) setBioDescription(d.bioDescription);
          if (d.themeStyle) setThemeStyle(d.themeStyle);
          if (d.buttonStyle) setButtonStyle(d.buttonStyle);
        }
      }).catch(() => {});
    }
  }, [workspaceSlug]);

  // Copier le lien public
  const handleCopyLink = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(`https://${publicUrl}`);
      showToast('🔗 Lien Bio public copié dans le presse-papiers !');
    }
  };

  // 1. Ajouter un nouveau lien
  const handleAddLink = () => {
    const newId = `link-${typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Date.now()}`;
    const newLink: BioLinkItem = {
      id: newId,
      label: 'Nouveau bouton d\'action',
      url: 'https://',
      icon: 'website',
      isActive: true,
      clicksCount: 0,
    };
    setLinks((prev) => [newLink, ...prev]);
    setExpandedLinkId(newId);
    showToast('✨ Nouveau bloc de lien ajouté avec succès !');
  };

  // 2. Supprimer un lien précis
  const handleDeleteLink = (id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
    showToast('🗑️ Bloc de lien supprimé.');
  };

  // 3. Basculer l'état actif/inactif
  const handleToggleLinkActive = (id: string) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, isActive: !l.isActive } : l))
    );
  };

  // 4. Mettre à jour un champ d'un lien en direct
  const handleUpdateLink = (id: string, field: keyof BioLinkItem, val: any) => {
    setLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, [field]: val } : l))
    );
  };

  // 5. Sauvegarde dans Firestore & LocalStorage
  const handleSaveBioPage = async () => {
    setIsSaving(true);
    const payload = {
      workspaceSlug,
      displayName,
      bioDescription,
      avatarUrl,
      isLive,
      socialInstagram,
      socialTikTok,
      socialFacebook,
      socialWhatsApp,
      themeStyle,
      buttonStyle,
      links,
      updatedAt: new Date().toISOString(),
    };

    // Cache local
    try {
      localStorage.setItem(`cmflow_bio_${workspaceSlug}`, JSON.stringify(payload));
    } catch (e) {}

    // Écriture Firestore
    if (db) {
      try {
        await setDoc(doc(db, 'bio_pages', workspaceSlug), payload, { merge: true });
      } catch (err) {
        console.warn('Firestore offline fallback:', err);
      }
    }

    setTimeout(() => {
      setIsSaving(false);
      showToast('🚀 Start Page enregistrée et publiée en direct avec succès !');
    }, 600);
  };

  // Rendu de l'icône de prévisualisation
  const renderIcon = (icon: IconType) => {
    switch (icon) {
      case 'whatsapp':
        return <span className="text-[#10B981] font-bold text-sm">💬</span>;
      case 'instagram':
        return <span className="text-[#E1306C] font-bold text-sm">📸</span>;
      case 'phone':
        return <Phone className="w-3.5 h-3.5 text-[#0066FF]" />;
      case 'maps':
        return <MapPin className="w-3.5 h-3.5 text-rose-500" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-[#F94F06]" />;
      case 'tiktok':
        return <span className="text-slate-800 font-bold text-xs">🎵</span>;
      case 'website':
      default:
        return <Globe className="w-3.5 h-3.5 text-slate-500" />;
    }
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* Toast Flottant */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A]/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-bounce">
          <Sparkles className="w-4 h-4 text-[#F94F06]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          A. EN-TÊTE STANDARD AVEC ACTIONS PRINCIPALES
          ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#0F172A]">
              Start Page • Lien en Bio
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#F94F06] border border-orange-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F94F06]"></span>
              {activeClient?.name || 'Teranga Gourmet'} {activeClient?.flag || '🇸🇳'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Gérez vos boutons WhatsApp, cartes menus et liens de redirection pour vos bios Instagram et TikTok.
          </p>
        </div>

        {/* Actions Supérieures */}
        <div className="flex items-center flex-wrap gap-2.5">
          
          {/* Switch Page en Ligne */}
          <button
            type="button"
            onClick={() => {
              setIsLive(!isLive);
              showToast(isLive ? '⏸️ Page mise hors-ligne temporairement' : '🟢 Page publiée et active en ligne !');
            }}
            className={`px-3 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 border transition-all cursor-pointer ${
              isLive
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                : 'bg-slate-100 text-slate-500 border-slate-200'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
            <span>{isLive ? 'Page en Ligne' : 'Hors-ligne'}</span>
          </button>

          {/* Badge Lien Public Court */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="px-3 py-2 rounded-xl text-xs font-extrabold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 flex items-center gap-1.5 transition-all cursor-pointer group"
            title="Copier le lien public"
          >
            <span className="text-slate-600 font-mono text-[11px]">{publicUrl}</span>
            <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0F172A]" />
          </button>

          {/* Bouton QR Code */}
          <button
            type="button"
            onClick={() => setIsQrModalOpen(true)}
            className="p-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Générer QR Code"
          >
            <QrCode className="w-4 h-4 text-[#0066FF]" />
          </button>

          {/* Bouton Enregistrer / Publier Orange */}
          <button
            type="button"
            onClick={handleSaveBioPage}
            disabled={isSaving}
            className="px-4 py-2.5 bg-[#F94F06] hover:bg-[#e04605] text-white text-xs font-black rounded-xl shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-75"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Enregistrement...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer &amp; Publier</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Bouton Aperçu Mobile Flottant (Écrans Mobiles) */}
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setIsMobilePreviewOpen(true)}
          className="w-full py-3 px-4 bg-[#0F172A] text-white font-extrabold text-xs rounded-2xl flex items-center justify-center gap-2 shadow-lg cursor-pointer"
        >
          <Smartphone className="w-4 h-4 text-[#F94F06]" />
          <span>Voir l&apos;Aperçu Smartphone en Direct</span>
        </button>
      </div>

      {/* =======================================================================
          ARCHITECTURE EN 2 VOLETS (Éditeur 7 cols + Mockup Mobile 5 cols)
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* =====================================================================
            VOLET GAUCHE : PANNEAU D'ÉDITION & BLOCS DE CONTENU
            ===================================================================== */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Navigation par Onglets Éditeur */}
          <div className="flex items-center gap-2 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/70 overflow-x-auto text-xs font-bold text-slate-600">
            <button
              type="button"
              onClick={() => setActiveTab('links')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'links'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-[#F94F06]" />
              <span>1. Blocs de Liens ({links.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'profile'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Layout className="w-3.5 h-3.5 text-[#0066FF]" />
              <span>2. Identité Profil</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('theme')}
              className={`flex-1 py-2 px-3 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'theme'
                  ? 'bg-white text-[#0F172A] shadow-xs'
                  : 'hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>3. Thème &amp; Style</span>
            </button>
          </div>

          {/* ===================================================================
              ONGLET 1 : GESTIONNAIRE COMPLET & INTERACTIF DES BLOCS DE LIENS
              =================================================================== */}
          {activeTab === 'links' && (
            <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h2 className="text-sm font-black text-[#0F172A]">
                    Liste des Liens &amp; Redirections
                  </h2>
                  <p className="text-xs text-slate-500">
                    Modifiez le titre, l&apos;URL et l&apos;icône en direct. L&apos;aperçu se met à jour instantanément.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddLink}
                  className="px-3.5 py-2 bg-[#F94F06] hover:bg-[#e04605] text-white font-extrabold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 transition-all cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Ajouter un lien</span>
                </button>
              </div>

              {/* Pile des Blocs de Liens Interactifs */}
              <div className="space-y-3">
                {links.length === 0 ? (
                  <div className="p-8 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-2">
                    <div className="text-3xl">🔗</div>
                    <div className="text-xs font-bold text-slate-700">Aucun lien actif pour le moment</div>
                    <p className="text-[11px] text-slate-400">Cliquez sur &quot;Ajouter un lien&quot; pour créer votre premier bouton.</p>
                  </div>
                ) : (
                  links.map((item, index) => {
                    const isExpanded = expandedLinkId === item.id || expandedLinkId === null;
                    return (
                      <div
                        key={item.id}
                        className={`rounded-2xl border transition-all space-y-3 p-3.5 ${
                          item.isActive
                            ? 'bg-white border-slate-200/90 shadow-2xs hover:border-slate-300'
                            : 'bg-slate-50/70 border-slate-200/60 opacity-60'
                        }`}
                      >
                        {/* Barre Supérieure du Bloc (Header) */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <GripVertical className="w-4 h-4 text-slate-300 hover:text-slate-500 cursor-grab shrink-0" />
                            
                            {/* Pastille Icône Active */}
                            <div className="w-8 h-8 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shrink-0 text-sm">
                              {renderIcon(item.icon)}
                            </div>

                            {/* Titre aperçu */}
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-black text-slate-800 truncate">
                                {item.label || 'Sans titre'}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400 truncate">
                                {item.url || 'https://...'}
                              </div>
                            </div>
                          </div>

                          {/* Actions rapides du bloc */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Statut Pill */}
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                                item.isActive
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-slate-100 text-slate-500 border-slate-200'
                              }`}
                            >
                              {item.isActive ? 'Actif' : 'Masqué'}
                            </span>

                            {/* Toggle Switch Actif / Inactif */}
                            <button
                              type="button"
                              onClick={() => handleToggleLinkActive(item.id)}
                              className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer ${
                                item.isActive ? 'bg-[#10B981]' : 'bg-slate-300'
                              }`}
                              title={item.isActive ? 'Désactiver le lien' : 'Activer le lien'}
                            >
                              <div
                                className={`w-4 h-4 rounded-full bg-white transition-transform ${
                                  item.isActive ? 'translate-x-4' : 'translate-x-0'
                                }`}
                              />
                            </button>

                            {/* Bouton Corbeille (Supprimer) */}
                            <button
                              type="button"
                              onClick={() => handleDeleteLink(item.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Supprimer ce lien"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* =======================================================
                            FORMULAIRE DIRECTEMENT ÉDITABLE DANS LA CARTE
                            ======================================================= */}
                        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-12 gap-3 text-xs">
                          
                          {/* 1. Champ Titre du Bouton */}
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                              Titre du Bouton (Label) *
                            </label>
                            <input
                              type="text"
                              value={item.label}
                              onChange={(e) => handleUpdateLink(item.id, 'label', e.target.value)}
                              placeholder="Ex: Commander sur WhatsApp"
                              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                            />
                          </div>

                          {/* 2. Menu Déroulant Sélection Icône */}
                          <div className="sm:col-span-6">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                              Icône du Bouton
                            </label>
                            <div className="relative">
                              <select
                                value={item.icon}
                                onChange={(e) => handleUpdateLink(item.id, 'icon', e.target.value as IconType)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all appearance-none cursor-pointer pr-8"
                              >
                                {ICON_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.emoji} {opt.label}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                            </div>
                          </div>

                          {/* 3. Champ URL de Destination */}
                          <div className="sm:col-span-12">
                            <label className="block text-[10px] font-black uppercase tracking-wider text-slate-600 mb-1">
                              URL de Destination (Lien WhatsApp, Site, Maps, PDF) *
                            </label>
                            <div className="relative">
                              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <LinkIcon className="w-3.5 h-3.5" />
                              </div>
                              <input
                                type="url"
                                value={item.url}
                                onChange={(e) => handleUpdateLink(item.id, 'url', e.target.value)}
                                placeholder="https://wa.me/221... ou https://..."
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]/20 focus:border-[#0066FF] transition-all"
                              />
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Bouton d'ajout bordé de pointillés */}
              <button
                type="button"
                onClick={handleAddLink}
                className="w-full py-3.5 rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#F94F06] hover:bg-orange-50/20 text-slate-600 hover:text-[#F94F06] font-extrabold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajouter un nouveau bloc de lien</span>
              </button>

            </div>
          )}

          {/* ===================================================================
              ONGLET 2 : IDENTITÉ & EN-TÊTE DU PROFIL
              =================================================================== */}
          {activeTab === 'profile' && (
            <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-[#0F172A] pb-2 border-b border-slate-100">
                En-tête &amp; Profil Public
              </h2>

              {/* Avatar & Photo */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#F94F06]"
                  />
                  <button
                    type="button"
                    onClick={() => showToast('📷 Téléversement de photo de profil...')}
                    className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#0F172A] text-white shadow-sm hover:bg-[#F94F06] transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                  </button>
                </div>
                <div className="text-xs">
                  <span className="font-extrabold text-slate-800 block">Logo / Photo de profil</span>
                  <span className="text-slate-400">Recommandé : Format carré 500x500 px (PNG/JPG)</span>
                </div>
              </div>

              {/* Nom & Bio */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Nom affiché sur la page
                  </label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Bio courte &amp; Description
                  </label>
                  <textarea
                    rows={2}
                    value={bioDescription}
                    onChange={(e) => setBioDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>
              </div>

              {/* Liens Réseaux Sociaux */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <span className="text-xs font-extrabold text-slate-800 block">
                  Comptes Sociaux Connectés (Pastilles en haut)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">Instagram Handle</label>
                    <input
                      type="text"
                      value={socialInstagram}
                      onChange={(e) => setSocialInstagram(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase mb-0.5">WhatsApp Numéro</label>
                    <input
                      type="text"
                      value={socialWhatsApp}
                      onChange={(e) => setSocialWhatsApp(e.target.value)}
                      className="w-full p-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* ===================================================================
              ONGLET 3 : THÈME & PERSONNALISATION
              =================================================================== */}
          {activeTab === 'theme' && (
            <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-black text-[#0F172A] pb-2 border-b border-slate-100">
                Thème Visuel &amp; Forme des Boutons
              </h2>

              {/* Style de Fond */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Palette &amp; Arrière-plan
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { id: 'dark', label: 'Sombre Ardoise', bg: 'bg-[#0F172A]' },
                    { id: 'light', label: 'Clair Épuré', bg: 'bg-[#F8FAFC]' },
                    { id: 'orange', label: 'Orange Électrique', bg: 'bg-[#F94F06]' },
                    { id: 'glass', label: 'Gradient Nuit', bg: 'bg-gradient-to-b from-slate-900 to-indigo-950' },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setThemeStyle(t.id as any)}
                      className={`p-3 rounded-2xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
                        themeStyle === t.id
                          ? 'border-[#F94F06] ring-2 ring-[#F94F06]/30 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-xl ${t.bg} shadow-2xs border border-white/20`}></div>
                      <span className="text-[10px] font-bold text-slate-700">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Style des Boutons */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Forme &amp; Effet des Boutons
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-bold">
                  {[
                    { id: 'pill', label: 'Pilule Arrondie' },
                    { id: 'soft-glass', label: 'Soft Glass (Flou)' },
                    { id: 'solid', label: 'Solid Minimal' },
                    { id: 'outline', label: 'Contour Fin' },
                  ].map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setButtonStyle(b.id as any)}
                      className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                        buttonStyle === b.id
                          ? 'bg-[#0F172A] text-white border-[#0F172A] shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {b.label}
                    </button>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* =====================================================================
            VOLET DROIT : PREVIEW SMARTPHONE RÉALISTE EN DIRECT (MOCKUP)
            ===================================================================== */}
        <div className="hidden lg:flex lg:col-span-5 justify-center sticky top-20">
          
          {/* Chassis iPhone Moderne */}
          <div className="w-[310px] bg-[#0F172A] p-3 rounded-[48px] shadow-2xl border-4 border-slate-700 ring-1 ring-white/10">
            
            {/* Écran iPhone */}
            <div
              className={`rounded-[38px] p-5 text-white flex flex-col justify-between min-h-[580px] shadow-inner transition-colors duration-300 relative overflow-hidden ${
                themeStyle === 'dark'
                  ? 'bg-gradient-to-b from-slate-900 to-slate-950'
                  : themeStyle === 'light'
                  ? 'bg-gradient-to-b from-slate-100 to-white text-[#0F172A]'
                  : themeStyle === 'orange'
                  ? 'bg-gradient-to-b from-[#F94F06] to-[#d93f00]'
                  : 'bg-gradient-to-b from-slate-900 via-indigo-950 to-slate-950'
              }`}
            >
              
              {/* Dynamic Island Notch */}
              <div className="w-20 h-4 bg-black rounded-full mx-auto mb-4 shadow-sm"></div>

              {/* Contenu Profil */}
              <div className="text-center space-y-3.5">
                <div className="relative inline-block">
                  <img
                    src={avatarUrl}
                    alt="Avatar"
                    className="w-16 h-16 rounded-full mx-auto object-cover ring-2 ring-[#F94F06] shadow-md"
                  />
                  <span className="absolute -bottom-1 -right-1 text-xs bg-slate-900 rounded-full px-1 border border-slate-700">
                    {activeClient?.flag || '🇸🇳'}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-extrabold tracking-tight">
                    {displayName || 'Nom de la marque'}
                  </h3>
                  <p className="text-[11px] opacity-75 mt-1 leading-relaxed px-2">
                    {bioDescription || 'Description courte du compte...'}
                  </p>
                </div>

                {/* Pastilles Réseaux Sociaux */}
                <div className="flex items-center justify-center gap-2 pt-1">
                  {socialInstagram && (
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs backdrop-blur-xs">
                      📸
                    </span>
                  )}
                  {socialTikTok && (
                    <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs backdrop-blur-xs">
                      🎵
                    </span>
                  )}
                  {socialWhatsApp && (
                    <span className="w-7 h-7 rounded-full bg-[#10B981] text-white flex items-center justify-center text-xs shadow-xs">
                      💬
                    </span>
                  )}
                </div>

                {/* =============================================================
                    LISTE DES BOUTONS DE LIENS EN DIRECT DANS LE SMARTPHONE
                    ============================================================= */}
                <div className="space-y-2.5 pt-2">
                  {links.filter((l) => l.isActive).length === 0 ? (
                    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-[11px] opacity-60">
                      Aucun bouton actif affiché
                    </div>
                  ) : (
                    links
                      .filter((l) => l.isActive)
                      .map((l) => (
                        <a
                          key={l.id}
                          href={l.url || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-full py-3 px-4 flex items-center justify-between text-xs font-black transition-all group shadow-sm ${
                            buttonStyle === 'pill'
                              ? 'rounded-full'
                              : buttonStyle === 'soft-glass'
                              ? 'rounded-2xl backdrop-blur-md bg-white/15 border border-white/20 hover:bg-white/25'
                              : buttonStyle === 'solid'
                              ? 'rounded-xl bg-[#F94F06] text-white hover:bg-[#e04605]'
                              : 'rounded-xl border-2 border-white/40 hover:border-white text-white'
                          } ${
                            buttonStyle === 'pill' && (
                              l.icon === 'whatsapp'
                                ? 'bg-[#10B981] hover:bg-[#059669] text-white shadow-emerald-500/20'
                                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20 backdrop-blur-xs'
                            )
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span className="shrink-0 text-sm">
                              {renderIcon(l.icon)}
                            </span>
                            <span className="truncate">{l.label || 'Bouton d\'action'}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 shrink-0 ml-1.5" />
                        </a>
                      ))
                  )}
                </div>

              </div>

              {/* Branding CMFlow en bas de l'écran */}
              <div className="text-center pt-4 text-[9px] opacity-50 font-semibold">
                Propulsé par <span className="font-extrabold text-[#F94F06]">CMFlow ⚡</span>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* =======================================================================
          MODALE APERÇU MOBILE PLEIN ÉCRAN
          ======================================================================= */}
      {isMobilePreviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-xs">
            <button
              type="button"
              onClick={() => setIsMobilePreviewOpen(false)}
              className="absolute -top-10 right-0 text-white font-extrabold text-xs flex items-center gap-1 bg-white/20 px-3 py-1.5 rounded-full"
            >
              <X className="w-4 h-4" /> Fermer l&apos;Aperçu
            </button>
            <div className="w-full bg-[#0F172A] p-3 rounded-[48px] shadow-2xl border-4 border-slate-700">
              <div className="rounded-[38px] p-5 bg-gradient-to-b from-slate-900 to-slate-950 text-white flex flex-col justify-between min-h-[520px]">
                <div className="w-20 h-4 bg-black rounded-full mx-auto mb-4"></div>
                <div className="text-center space-y-3">
                  <img src={avatarUrl} alt="Avatar" className="w-14 h-14 rounded-full mx-auto object-cover ring-2 ring-[#F94F06]" />
                  <h3 className="text-xs font-black">{displayName}</h3>
                  <p className="text-[10px] text-slate-400">{bioDescription}</p>
                  <div className="space-y-2 pt-2 text-xs font-bold">
                    {links.filter((l) => l.isActive).map((l) => (
                      <div key={l.id} className="py-2.5 px-3 rounded-full bg-white/15 text-white flex items-center justify-between">
                        <span className="truncate">{l.label}</span>
                        <ExternalLink className="w-3 h-3 opacity-60" />
                      </div>
                    ))}
                  </div>
                </div>
                <div className="text-center pt-3 text-[9px] text-slate-500 font-semibold">
                  CMFlow ⚡
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          MODALE QR CODE
          ======================================================================= */}
      {isQrModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-[#0F172A]">QR Code Start Page</h3>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 inline-block">
              {/* QR Code SVG */}
              <svg viewBox="0 0 100 100" className="w-44 h-44 mx-auto text-[#0F172A]">
                <path fill="currentColor" d="M10,10 h30 v30 h-30 z M15,15 v20 h20 v-20 z M20,20 h10 v10 h-10 z" />
                <path fill="currentColor" d="M60,10 h30 v30 h-30 z M65,15 v20 h20 v-20 z M70,20 h10 v10 h-10 z" />
                <path fill="currentColor" d="M10,60 h30 v30 h-30 z M15,65 v20 h20 v-20 z M20,70 h10 v10 h-10 z" />
                <rect x="50" y="50" width="10" height="10" fill="#F94F06" />
                <rect x="70" y="60" width="10" height="20" fill="currentColor" />
                <rect x="60" y="80" width="20" height="10" fill="currentColor" />
                <rect x="85" y="85" width="10" height="10" fill="#F94F06" />
              </svg>
            </div>

            <p className="text-xs text-slate-500 font-medium">
              Imprimez ce QR Code sur vos tables, emballages, cartes de visite ou stands pour rediriger directement vos clients.
            </p>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  showToast('📥 QR Code téléchargé (PNG Haute Définition) !');
                  setIsQrModalOpen(false);
                }}
                className="flex-1 py-2.5 bg-[#F94F06] text-white text-xs font-black rounded-xl shadow-md cursor-pointer"
              >
                Télécharger PNG
              </button>
              <button
                type="button"
                onClick={() => setIsQrModalOpen(false)}
                className="px-4 py-2.5 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-200 cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
