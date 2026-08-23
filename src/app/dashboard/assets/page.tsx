'use client';

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  UploadCloud,
  Search,
  Filter,
  Image as ImageIcon,
  Video,
  Layers,
  Copy,
  Download,
  Trash2,
  Plus,
  Check,
  Sparkles,
  ExternalLink,
  Tag,
  FolderPlus,
  Eye,
  CheckCircle2,
  HardDrive,
  Type,
  FileText,
  Send,
  X
} from 'lucide-react';
import { useClient } from '../../../context/ClientContext';

// Types Médias
export type MediaType = 'image' | 'video' | 'carousel';

export interface BrandAsset {
  id: string;
  clientId: string;
  name: string;
  type: MediaType;
  url: string;
  dimensions: string;
  size: string;
  dateAdded: string;
  usedCount: number;
  tags: string[];
}

// Données Mockées d'Assets Haute Qualité
const INITIAL_ASSETS: BrandAsset[] = [
  {
    id: 'asset-1',
    clientId: 'teranga-gourmet',
    name: 'thieboudienne-royal-hero.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    dimensions: '1080 x 1350 px',
    size: '2.4 Mo',
    dateAdded: '20 Août 2026',
    usedCount: 3,
    tags: ['Plats', 'Spécialités', 'Hero'],
  },
  {
    id: 'asset-2',
    clientId: 'teranga-gourmet',
    name: 'pastels-coulisses-chef.mp4',
    type: 'video',
    url: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    dimensions: 'Vidéo 0:45 (9:16)',
    size: '14.8 Mo',
    dateAdded: '19 Août 2026',
    usedCount: 2,
    tags: ['Reels', 'Coulisses', 'TikTok'],
  },
  {
    id: 'asset-3',
    clientId: 'teranga-gourmet',
    name: 'terrasse-soiree-feutree.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    dimensions: '1080 x 1080 px',
    size: '1.9 Mo',
    dateAdded: '18 Août 2026',
    usedCount: 1,
    tags: ['Ambiance', 'Terrasse'],
  },
  {
    id: 'asset-4',
    clientId: 'teranga-gourmet',
    name: 'cocktail-bissap-fraicheur.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
    dimensions: '1080 x 1350 px',
    size: '3.1 Mo',
    dateAdded: '17 Août 2026',
    usedCount: 4,
    tags: ['Boissons', 'Cocktails'],
  },
  {
    id: 'asset-5',
    clientId: 'teranga-gourmet',
    name: 'brunch-dimanche-template.png',
    type: 'carousel',
    url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80',
    dimensions: 'Carrousel (4 slides)',
    size: '5.2 Mo',
    dateAdded: '16 Août 2026',
    usedCount: 2,
    tags: ['Brunch', 'Promotions'],
  },
  {
    id: 'asset-6',
    clientId: 'teranga-gourmet',
    name: 'equipe-service-sommet.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    dimensions: '1080 x 1080 px',
    size: '2.8 Mo',
    dateAdded: '15 Août 2026',
    usedCount: 1,
    tags: ['B2B', 'Corporate', 'LinkedIn'],
  },
  {
    id: 'asset-7',
    clientId: 'teranga-gourmet',
    name: 'dessert-thiakry-gourmand.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=800&auto=format&fit=crop&q=80',
    dimensions: '1080 x 1350 px',
    size: '2.1 Mo',
    dateAdded: '14 Août 2026',
    usedCount: 0,
    tags: ['Desserts', 'Sucré'],
  },
  {
    id: 'asset-8',
    clientId: 'teranga-gourmet',
    name: 'grillades-poisson-braise.jpg',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&auto=format&fit=crop&q=80',
    dimensions: '1080 x 1080 px',
    size: '3.6 Mo',
    dateAdded: '12 Août 2026',
    usedCount: 3,
    tags: ['Grillades', 'Dîner'],
  },
];

// Brand Kit Teranga Gourmet
const BRAND_COLORS = [
  { name: 'Orange Électrique', hex: '#F94F06', label: 'Primaire / CTA' },
  { name: 'Bleu Ardoise Profond', hex: '#0F172A', label: 'Structure & Textes' },
  { name: 'Vert Émeraude', hex: '#10B981', label: 'Validation & Bio' },
  { name: 'Gris Perle Lumineux', hex: '#F8FAFC', label: 'Arrière-plan' },
];

const BRAND_HASHTAGS = [
  '#TerangaGourmet',
  '#DakarFoodie',
  '#SenegalGourmet',
  '#AfroGastronomie',
  '#DakarRestaurants',
  '#FoodLoversSenegal',
];

export default function AssetsPage() {
  const { activeClient } = useClient();

  // États
  const [assets, setAssets] = useState<BrandAsset[]>(INITIAL_ASSETS);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'image' | 'video' | 'carousel'>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'used' | 'size'>('recent');

  // Modales
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [previewAsset, setPreviewAsset] = useState<BrandAsset | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Formulaire Upload
  const [uploadFileName, setUploadFileName] = useState('');
  const [uploadType, setUploadType] = useState<MediaType>('image');
  const [uploadTag, setUploadTag] = useState('Nouveautés');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copie de couleur HEX
  const handleCopyHex = (hex: string, name: string) => {
    navigator.clipboard.writeText(hex);
    showToast(`🎨 Code couleur ${name} (${hex}) copié !`);
  };

  // Copie de tous les hashtags
  const handleCopyHashtags = () => {
    const allTags = BRAND_HASHTAGS.join(' ');
    navigator.clipboard.writeText(allTags);
    showToast('📋 Pack de 6 hashtags officiels copié !');
  };

  // Filtrage et Tri des Médias
  const filteredAssets = useMemo(() => {
    return assets
      .filter((asset) => {
        const matchSearch =
          asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          asset.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchType = typeFilter === 'all' || asset.type === typeFilter;
        return matchSearch && matchType;
      })
      .sort((a, b) => {
        if (sortBy === 'used') return b.usedCount - a.usedCount;
        if (sortBy === 'size') return parseFloat(b.size) - parseFloat(a.size);
        return 0; // 'recent'
      });
  }, [assets, searchTerm, typeFilter, sortBy]);

  // Supprimer un Asset
  const handleDeleteAsset = (id: string) => {
    setAssets(assets.filter((a) => a.id !== id));
    showToast('🗑️ Fichier média supprimé de la bibliothèque.');
  };

  // Téléverser un média
  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFileName.trim()) return;

    const newAsset: BrandAsset = {
      id: `asset-${Date.now()}`,
      clientId: activeClient.id,
      name: uploadFileName.endsWith('.jpg') || uploadFileName.endsWith('.png') ? uploadFileName : `${uploadFileName}.jpg`,
      type: uploadType,
      url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      dimensions: uploadType === 'video' ? 'Vidéo 1080 x 1920 px' : '1080 x 1350 px',
      size: '3.4 Mo',
      dateAdded: 'À l\'instant',
      usedCount: 0,
      tags: [uploadTag || 'Nouveautés'],
    };

    setAssets([newAsset, ...assets]);
    setIsUploadModalOpen(false);
    setUploadFileName('');
    showToast('✨ Fichier téléversé avec succès dans votre cloud !');
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
              Médiathèque & Identité de Marque
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#F94F06] border border-orange-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F94F06]"></span>
              {activeClient.name} {activeClient.flag}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Stockez vos créations, palettes de couleurs, typographies et hashtags officiels.
          </p>
        </div>

        {/* Droite : Jauge Cloud & Bouton Téléverser */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Jauge Stockage */}
          <div className="px-3.5 py-2 rounded-2xl bg-slate-100/90 border border-slate-200/80 space-y-1 text-right">
            <div className="flex items-center justify-between gap-3 text-[11px] font-extrabold text-slate-700">
              <span className="flex items-center gap-1 text-slate-500 font-semibold">
                <HardDrive className="w-3 h-3 text-[#0066FF]" /> Cloud
              </span>
              <span>4.2 Go / 10 Go</span>
            </div>
            <div className="w-32 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#0066FF] to-sky-400 rounded-full" style={{ width: '42%' }}></div>
            </div>
          </div>

          {/* Bouton Principal Orange */}
          <button
            type="button"
            onClick={() => setIsUploadModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold bg-[#F94F06] hover:bg-[#e04605] text-white shadow-lg shadow-[#F94F06]/25 hover:shadow-[#F94F06]/40 active:scale-[0.98] transition-all duration-200"
          >
            <UploadCloud className="w-4 h-4" />
            <span>+ Téléverser des fichiers</span>
          </button>

        </div>
      </div>

      {/* =======================================================================
          B. BANDEAU "BRAND KIT" (IDENTITÉ VISUELLE EN 1 COUP D'ŒIL)
          ======================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* 1. Palette Officielle (Codes HEX cliquables) */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#F94F06]" />
              Palette Officielle
            </span>
            <span className="text-[10px] text-slate-400 font-medium">Cliquez pour copier</span>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {BRAND_COLORS.map((c) => (
              <button
                key={c.hex}
                type="button"
                onClick={() => handleCopyHex(c.hex, c.name)}
                className="p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200/80 flex flex-col items-center gap-1.5 transition-all text-center group"
                title={`${c.name} - Copier ${c.hex}`}
              >
                <div
                  className="w-7 h-7 rounded-xl shadow-xs ring-1 ring-black/10 group-hover:scale-110 transition-transform"
                  style={{ backgroundColor: c.hex }}
                ></div>
                <span className="text-[10px] font-mono font-bold text-slate-700">
                  {c.hex}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. Logos & Typographies */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
              <Type className="w-3.5 h-3.5 text-[#0066FF]" />
              Logos & Typographie
            </span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Plus Jakarta Sans
            </span>
          </div>

          <div className="flex items-center justify-between gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-200/80">
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={activeClient.avatar}
                alt="Logo"
                className="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200"
              />
              <div className="min-w-0 text-xs">
                <span className="font-extrabold text-slate-800 block truncate">{activeClient.name} Vector.svg</span>
                <span className="text-[10px] text-slate-400">Fond transparent HD</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => showToast('📥 Téléchargement du pack logo officiel lancé !')}
              className="p-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 shadow-2xs transition-all"
              title="Télécharger le logo"
            >
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 3. Coffre à Hashtags Récurrents */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/70 shadow-xs space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-[#0F172A] uppercase tracking-wider flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#10B981]" />
                Hashtags Récurrents
              </span>
              <span className="text-[10px] font-bold text-slate-500">6 tags</span>
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-16 overflow-hidden">
              {BRAND_HASHTAGS.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200/60"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          <button
            type="button"
            onClick={handleCopyHashtags}
            className="w-full py-1.5 px-3 rounded-xl text-xs font-extrabold bg-[#10B981]/10 hover:bg-[#10B981]/20 text-[#059669] border border-[#10B981]/30 flex items-center justify-center gap-1.5 transition-all shadow-2xs"
          >
            <Copy className="w-3 h-3 text-[#10B981]" />
            <span>Copier le pack de tags</span>
          </button>
        </div>

      </div>

      {/* =======================================================================
          C. BARRE D'OUTILS MÉDIAS & FILTRES INTELLIGENTS
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md border border-slate-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 shadow-xs">
        
        {/* Recherche */}
        <div className="relative w-full lg:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Rechercher un fichier ou tag..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
          />
        </div>

        {/* Filtres par format & Tri */}
        <div className="flex items-center flex-wrap gap-2 text-xs">
          
          {/* Format Pills */}
          <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/70">
            {[
              { id: 'all', label: 'Tous', icon: null },
              { id: 'image', label: 'Images', icon: ImageIcon },
              { id: 'video', label: 'Vidéos', icon: Video },
              { id: 'carousel', label: 'Carrousels', icon: Layers },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setTypeFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                  typeFilter === f.id
                    ? 'bg-white text-[#0F172A] shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {f.icon && <f.icon className="w-3.5 h-3.5" />}
                <span>{f.label}</span>
              </button>
            ))}
          </div>

          {/* Tri Dropdown */}
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 rounded-xl px-3 py-1.5 shadow-xs">
            <span className="text-slate-400 font-medium">Tri :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="recent">Plus récents</option>
              <option value="used">Plus utilisés</option>
              <option value="size">Poids du fichier</option>
            </select>
          </div>

        </div>
      </div>

      {/* =======================================================================
          D. GRILLE DE MÉDIAS INTELLIGENTE (RESPONSIVE ASSET GRID)
          ======================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {filteredAssets.map((asset) => (
          <div
            key={asset.id}
            className="group relative bg-white rounded-3xl border border-slate-200/80 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between"
          >
            {/* Vignette Preview avec Badges Superposés */}
            <div className="relative h-48 w-full bg-slate-900 overflow-hidden">
              <img
                src={asset.url}
                alt={asset.name}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Badge Format / Dimensions Glassmorphism */}
              <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-md text-white px-2.5 py-0.5 rounded-full text-[10px] font-bold border border-white/15 shadow-sm">
                {asset.dimensions}
              </div>

              {/* Badge Utilisation */}
              {asset.usedCount > 0 && (
                <div className="absolute top-2.5 right-2.5 bg-emerald-500/90 backdrop-blur-md text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-sm">
                  {asset.usedCount}x utilisé
                </div>
              )}

              {/* Actions au survol (Hover Overlay) */}
              <div className="absolute inset-0 bg-[#0F172A]/85 backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-all duration-200 flex flex-col justify-between p-3.5 text-white">
                <div className="flex justify-end gap-1.5">
                  <button
                    type="button"
                    onClick={() => setPreviewAsset(asset)}
                    title="Aperçu grand format"
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-all"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast(`📥 Téléchargement de ${asset.name}...`)}
                    title="Télécharger"
                    className="p-1.5 rounded-xl bg-white/20 hover:bg-white text-white hover:text-slate-900 transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeleteAsset(asset.id)}
                    title="Supprimer"
                    className="p-1.5 rounded-xl bg-rose-500/40 hover:bg-rose-500 text-rose-200 hover:text-white transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <Link
                  href="/dashboard/calendar"
                  className="w-full py-2 px-3 rounded-xl text-xs font-extrabold bg-[#F94F06] hover:bg-[#e04605] text-white flex items-center justify-center gap-1.5 shadow-md shadow-[#F94F06]/30 transition-all text-center"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Créer un post avec ce visuel</span>
                </Link>
              </div>
            </div>

            {/* Pied de Carte Média */}
            <div className="p-3.5 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-extrabold text-[#0F172A] truncate" title={asset.name}>
                  {asset.name}
                </span>
                <span className="text-[10px] text-slate-400 font-mono shrink-0">
                  {asset.size}
                </span>
              </div>

              {/* Tags Média */}
              <div className="flex items-center gap-1 overflow-hidden">
                {asset.tags.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 rounded-md text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200/60 truncate"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>

          </div>
        ))}

      </div>

      {/* =======================================================================
          E. MODALE DE TÉLÉVERSEMENT & DROPZONE
          ======================================================================= */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 border border-slate-200 animate-fadeIn">
            
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#F94F06] flex items-center justify-center font-bold">
                  <UploadCloud className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-[#0F172A]">
                    Téléverser des Médias
                  </h3>
                  <p className="text-xs text-slate-500">Pour {activeClient.name} {activeClient.flag}</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              
              {/* Dropzone Interactive */}
              <div className="border-2 border-dashed border-slate-300 hover:border-[#0066FF] rounded-3xl p-6 text-center bg-slate-50/50 hover:bg-blue-50/20 cursor-pointer transition-colors group">
                <UploadCloud className="w-10 h-10 text-slate-400 group-hover:text-[#0066FF] mx-auto mb-2 transition-colors" />
                <div className="text-xs font-extrabold text-slate-800">
                  Glissez-déposez vos images ou vidéos ici
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  JPG, PNG, WebP, MP4 jusqu'à 50 Mo par fichier
                </div>
              </div>

              {/* Nom du fichier */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nom du fichier média *
                </label>
                <input
                  type="text"
                  value={uploadFileName}
                  onChange={(e) => setUploadFileName(e.target.value)}
                  placeholder="ex: menu-degustation-septembre.jpg"
                  required
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                />
              </div>

              {/* Type et Tag */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Format
                  </label>
                  <select
                    value={uploadType}
                    onChange={(e) => setUploadType(e.target.value as MediaType)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                  >
                    <option value="image">Image (1080x1350)</option>
                    <option value="video">Vidéo Reel/TikTok</option>
                    <option value="carousel">Carrousel</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Tag / Catégorie
                  </label>
                  <input
                    type="text"
                    value={uploadTag}
                    onChange={(e) => setUploadTag(e.target.value)}
                    placeholder="ex: Plats, Événement..."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0066FF]"
                  />
                </div>
              </div>

              {/* Boutons */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-extrabold bg-[#F94F06] hover:bg-[#e04605] text-white rounded-xl shadow-lg shadow-[#F94F06]/25 transition-all"
                >
                  Ajouter à la médiathèque
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* Modale Aperçu Grand Format */}
      {previewAsset && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-fadeIn">
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-800 truncate">
                {previewAsset.name}
              </span>
              <button
                onClick={() => setPreviewAsset(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-72 w-full bg-slate-900">
              <img
                src={previewAsset.url}
                alt={previewAsset.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="p-4 flex items-center justify-between text-xs font-bold">
              <span className="text-slate-500">{previewAsset.dimensions} · {previewAsset.size}</span>
              <button
                onClick={() => setPreviewAsset(null)}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
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
