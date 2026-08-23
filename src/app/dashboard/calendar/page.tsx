'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import Image from 'next/image';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  Send,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Copy,
  CheckCircle2,
  Clock,
  Video,
  Layers,
  Instagram,
  Facebook,
  Linkedin,
  UploadCloud,
  X,
  Sparkles,
  Flame,
  Check,
  Share2,
  ExternalLink,
  MessageSquare,
  Image as ImageIcon,
  Film,
  Play,
  RotateCcw,
  Heart,
  Bookmark,
  MoreHorizontal,
  CheckCheck,
  FolderOpen,
  Sliders,
  CheckSquare,
  Square,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';
import { uploadPostMedia } from '../../../lib/uploadMedia';
import { WhatsAppShareModal } from '../../../components/WhatsAppShareModal';

// Types
export type SocialNetwork = 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
export type PostStatus = 'draft' | 'pending_validation' | 'validated' | 'scheduled' | 'PUBLISHED' | 'PUBLISH_FAILED';
export type ViewMode = 'week' | 'month' | 'list';
export type PostFormat = 'image' | 'carousel' | 'video';
export type AspectRatio = '1:1' | '4:5' | '9:16' | '16:9';

export interface CalendarPost {
  id: string;
  clientId: string;
  network: SocialNetwork;
  status: PostStatus;
  scheduledDate: string; // YYYY-MM-DD
  scheduledTime: string; // HH:mm
  caption: string;
  mediaUrl: string;
  mediaUrls?: string[];
  mediaType: 'image' | 'video' | 'carousel';
  format?: PostFormat;
  aspectRatio?: AspectRatio;
  requiresApproval?: boolean;
  carouselCount?: number;
  likesEst?: number;
}

export interface BrandAsset {
  id: string;
  title: string;
  url: string;
  type: 'image' | 'video';
  duration?: string;
  category: string;
}

// Données Mockées Réalistes (Teranga Gourmet & autres)
const INITIAL_CALENDAR_POSTS: CalendarPost[] = [
  {
    id: 'cal-post-1',
    clientId: 'teranga-gourmet',
    network: 'instagram',
    status: 'validated',
    scheduledDate: '2026-08-24', // Lundi
    scheduledTime: '18:30',
    caption: 'Ce soir, découvrez notre nouveau Thiéboudienne royal revisité aux fruits de mer frais de Soumbédioune 🐟✨ Réservez votre table en terrasse ! #DakarFood #SenegalGourmet #TerangaGourmet',
    mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    mediaUrls: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80'
    ],
    mediaType: 'carousel',
    format: 'carousel',
    aspectRatio: '1:1',
    carouselCount: 3,
    likesEst: 342,
  },
  {
    id: 'cal-post-2',
    clientId: 'teranga-gourmet',
    network: 'tiktok',
    status: 'pending_validation',
    scheduledDate: '2026-08-25', // Mardi
    scheduledTime: '12:15',
    caption: 'Dans les coulisses avec notre Chef Moussa qui prépare les fameux pastels croustillants 🔥 Vous êtes plutôt sauce pimentée ou douce ? #DakarFood #Foodie #TikTokFood',
    mediaUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    format: 'video',
    aspectRatio: '9:16',
    likesEst: 1250,
  },
  {
    id: 'cal-post-3',
    clientId: 'teranga-gourmet',
    network: 'facebook',
    status: 'scheduled',
    scheduledDate: '2026-08-26', // Mercredi
    scheduledTime: '09:00',
    caption: 'Offre spéciale déjeuner d\'entreprise : -15% sur toutes vos commandes de groupe du mercredi au vendredi 💼🍽️ Livraison express au Plateau et aux Almadies. #BusinessLunch',
    mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    format: 'image',
    aspectRatio: '1:1',
    likesEst: 89,
  },
  {
    id: 'cal-post-4',
    clientId: 'teranga-gourmet',
    network: 'instagram',
    status: 'draft',
    scheduledDate: '2026-08-27', // Jeudi
    scheduledTime: '19:45',
    caption: 'Ambiance feutrée et musique acoustique en terrasse ce week-end. Qui vous accompagne ? Mentionnez-les en commentaire ! 🥂🎷 #DakarNight #TerangaGourmet #AfroJazz',
    mediaUrl: 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    format: 'image',
    aspectRatio: '4:5',
    likesEst: 215,
  },
  {
    id: 'cal-post-5',
    clientId: 'teranga-gourmet',
    network: 'linkedin',
    status: 'validated',
    scheduledDate: '2026-08-28', // Vendredi
    scheduledTime: '10:30',
    caption: 'Fier d\'accueillir les délégations du Sommet Tech Afrique de l\'Ouest pour leurs déjeuners et dîners officiels d\'affaires. L\'excellence du service au cœur de notre engagement gastronomique.',
    mediaUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    format: 'image',
    aspectRatio: '1:1',
    likesEst: 178,
  },
  {
    id: 'cal-post-6',
    clientId: 'teranga-gourmet',
    network: 'instagram',
    status: 'pending_validation',
    scheduledDate: '2026-08-29', // Samedi
    scheduledTime: '11:00',
    caption: 'Brunch du dimanche en préparation : viennoiseries maison, jus de bissap bio et grillades à la braise. Pensez à réserver vos places à l\'avance ! 🥞🍹',
    mediaUrl: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    format: 'image',
    aspectRatio: '1:1',
    likesEst: 430,
  }
];

// Bibliothèque d'assets de la marque active
const BRAND_ASSETS_LIBRARY: BrandAsset[] = [
  {
    id: 'asset-1',
    title: 'Thiéboudienne Royal Penda Mbaye',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    type: 'image',
    category: 'Plats Signature',
  },
  {
    id: 'asset-2',
    title: 'Marinade Braisée au Feu de Bois',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
    type: 'image',
    category: 'Coulisses Cuisine',
  },
  {
    id: 'asset-3',
    title: 'Cocktails Bissap & Gingembre Frais',
    url: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=800&auto=format&fit=crop&q=80',
    type: 'image',
    category: 'Boissons & Bar',
  },
  {
    id: 'asset-4',
    title: 'Terrasse Lounge & Ambiance Nuit',
    url: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    type: 'image',
    category: 'Lieu & Décoration',
  },
  {
    id: 'asset-5',
    title: 'Brunch Dégustation Dimanche',
    url: 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=800&auto=format&fit=crop&q=80',
    type: 'image',
    category: 'Événements',
  },
  {
    id: 'asset-6',
    title: 'Chef Moussa en Cuisine (Reel 9:16)',
    url: 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=800&auto=format&fit=crop&q=80',
    type: 'video',
    duration: '0:28',
    category: 'Vidéos & Reels',
  },
];

export default function CalendarPage() {
  const { activeWorkspace } = useWorkspace();

  // État du planning
  const [posts, setPosts] = useState<CalendarPost[]>(INITIAL_CALENDAR_POSTS);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedNetworkFilter, setSelectedNetworkFilter] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');

  // Modales
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isAssetLibraryOpen, setIsAssetLibraryOpen] = useState(false);
  const [isWhatsAppModalOpen, setIsWhatsAppModalOpen] = useState(false);
  const [previewPost, setPreviewPost] = useState<CalendarPost | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // État Téléversement & Partage WhatsApp
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [shareModalPost, setShareModalPost] = useState<any>(null);
  const [shareModalToken, setShareModalToken] = useState<string>('v_demo8a1d');
  const [shareModalMagicUrl, setShareModalMagicUrl] = useState<string>('');

  // =========================================================================
  // Formulaire Nouveau Post Enrichi (Formats, Ratios & Multi-médias)
  // =========================================================================
  const [postFormat, setPostFormat] = useState<PostFormat>('image');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('1:1');
  const [caption, setCaption] = useState('');
  const [targetPlatforms, setTargetPlatforms] = useState<SocialNetwork[]>(['instagram', 'facebook']);
  const [scheduledDate, setScheduledDate] = useState('2026-08-24');
  const [scheduledTime, setScheduledTime] = useState('18:30');
  const [initialStatus, setInitialStatus] = useState<PostStatus>('pending_validation');
  const [requiresApproval, setRequiresApproval] = useState<boolean>(true);

  // Gestion des Médias (Multi-visuels / Carrousels / Vidéos)
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = useState<string[]>([
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80'
  ]);
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Écouteur en temps réel des décisions clients (Webhooks & Activités)
  useEffect(() => {
    const handleRealtimeActivity = (e: any) => {
      const notif = e.detail;
      if (!notif) return;

      if (notif.postId) {
        setPosts((prevPosts) =>
          prevPosts.map((p) => {
            if (p.id === notif.postId || notif.postId.includes(p.id)) {
              // Si validé sur le portail WhatsApp, le statut bascule automatiquement en "scheduled"
              const newStatus: PostStatus =
                notif.action === 'APPROVED' ? 'scheduled' : 'pending_validation';
              return { ...p, status: newStatus };
            }
            return p;
          })
        );
      }
    };

    window.addEventListener('cmflow:activity', handleRealtimeActivity);
    return () => {
      window.removeEventListener('cmflow:activity', handleRealtimeActivity);
    };
  }, []);

  // Changement de format explicite
  const handleSelectFormat = (format: PostFormat) => {
    setPostFormat(format);
    if (format === 'video') {
      setAspectRatio('9:16');
      if (mediaPreviews.length > 1) {
        setMediaPreviews([mediaPreviews[0]]);
        setMediaFiles(mediaFiles.slice(0, 1));
      }
    } else if (format === 'carousel') {
      if (aspectRatio === '9:16' || aspectRatio === '16:9') {
        setAspectRatio('1:1');
      }
    } else {
      // image
      if (aspectRatio === '9:16' || aspectRatio === '16:9') {
        setAspectRatio('1:1');
      }
      if (mediaPreviews.length > 1) {
        setMediaPreviews([mediaPreviews[0]]);
        setMediaFiles(mediaFiles.slice(0, 1));
      }
    }
    setActiveCarouselIndex(0);
  };

  // Traitement d'importation de fichiers
  const handleFilesSelected = (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    if (fileArray.length === 0) return;

    if (postFormat === 'carousel') {
      // Carrousel : on peut ajouter jusqu'à 10 visuels
      const newUrls = fileArray.map((f) => URL.createObjectURL(f));
      const combinedUrls = [...mediaPreviews, ...newUrls].slice(0, 10);
      const combinedFiles = [...mediaFiles, ...fileArray].slice(0, 10);

      setMediaFiles(combinedFiles);
      setMediaPreviews(combinedUrls);
      triggerToast(`📑 Carrousel : ${combinedUrls.length}/10 visuel(s) prêts !`);
    } else if (postFormat === 'video') {
      // Vidéo unique
      const videoFile = fileArray[0];
      const videoUrl = URL.createObjectURL(videoFile);
      setMediaFiles([videoFile]);
      setMediaPreviews([videoUrl]);
      triggerToast('🎥 Vidéo / Reel chargé avec succès !');
    } else {
      // Image unique
      const imgFile = fileArray[0];
      const imgUrl = URL.createObjectURL(imgFile);
      setMediaFiles([imgFile]);
      setMediaPreviews([imgUrl]);
      triggerToast('🖼️ Image chargée avec succès !');
    }
    setSelectedAssetId(null);
  };

  // Suppression d'un média spécifique (index du carrousel ou total)
  const handleRemoveSingleMedia = (index: number) => {
    if (mediaPreviews.length <= 1) {
      setMediaFiles([]);
      setMediaPreviews([]);
      setActiveCarouselIndex(0);
      triggerToast('🗑️ Média retiré.');
      return;
    }

    const nextPreviews = mediaPreviews.filter((_, i) => i !== index);
    const nextFiles = mediaFiles.filter((_, i) => i !== index);
    setMediaPreviews(nextPreviews);
    setMediaFiles(nextFiles);
    setActiveCarouselIndex((prev) => Math.min(prev, nextPreviews.length - 1));
    triggerToast(`🗑️ Slide #${index + 1} supprimé.`);
  };

  // Sélection depuis la Médiathèque
  const handleSelectAsset = (asset: BrandAsset) => {
    if (postFormat === 'carousel') {
      const combined = [...mediaPreviews, asset.url].slice(0, 10);
      setMediaPreviews(combined);
      triggerToast(`🖼️ « ${asset.title} » ajouté au carrousel (${combined.length}/10) !`);
    } else {
      setMediaFiles([]);
      setMediaPreviews([asset.url]);
      if (asset.type === 'video') {
        setPostFormat('video');
        setAspectRatio('9:16');
      }
      triggerToast(`🖼️ Visuel « ${asset.title} » sélectionné !`);
    }
    setSelectedAssetId(asset.id);
    setIsAssetLibraryOpen(false);
  };

  // Toggle plateforme cible
  const togglePlatform = (platform: SocialNetwork) => {
    if (targetPlatforms.includes(platform)) {
      if (targetPlatforms.length > 1) {
        setTargetPlatforms(targetPlatforms.filter((p) => p !== platform));
      } else {
        triggerToast('⚠️ Veuillez conserver au moins un réseau cible.');
      }
    } else {
      setTargetPlatforms([...targetPlatforms, platform]);
    }
  };

  // Filtrage des posts pour la marque active
  const currentWorkspaceId = activeWorkspace?.id || 'teranga-gourmet';
  const currentWorkspaceName = activeWorkspace?.name || 'Teranga Gourmet';
  const currentWorkspaceFlag = activeWorkspace?.flag || '🇸🇳';

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (post.clientId !== currentWorkspaceId && post.clientId !== 'teranga-gourmet') return false;
      if (selectedNetworkFilter !== 'all' && post.network !== selectedNetworkFilter) return false;
      if (selectedStatusFilter !== 'all' && post.status !== selectedStatusFilter) return false;
      return true;
    });
  }, [posts, currentWorkspaceId, selectedNetworkFilter, selectedStatusFilter]);

  // KPIs
  const pendingPostsCount = useMemo(() => filteredPosts.filter((p) => p.status === 'pending_validation').length, [filteredPosts]);
  const validatedPostsCount = useMemo(() => filteredPosts.filter((p) => p.status === 'validated').length, [filteredPosts]);
  const scheduledPostsCount = useMemo(() => filteredPosts.filter((p) => p.status === 'scheduled').length, [filteredPosts]);

  // Soumission Création Post avec Upload Firebase & Firestore
  const handleCreatePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!caption.trim() && mediaPreviews.length === 0) {
      triggerToast('⚠️ Veuillez ajouter au moins un média ou une légende.');
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);

    try {
      const primaryNetwork = targetPlatforms[0] || 'instagram';
      let mainMedia = mediaPreviews[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80';
      const uploadedMediaUrls: string[] = [];

      // 1. Téléversement Réel sur Firebase Storage si des fichiers locaux ont été importés
      if (mediaFiles.length > 0) {
        for (let i = 0; i < mediaFiles.length; i++) {
          try {
            const url = await uploadPostMedia(mediaFiles[i], currentWorkspaceId, (p) => {
              setUploadProgress(Math.round(20 + (p * 0.6) / mediaFiles.length));
            });
            if (url) uploadedMediaUrls.push(url);
          } catch (uploadErr) {
            console.warn(`⚠️ Upload fichier ${i} fallback preview :`, uploadErr);
          }
        }
        if (uploadedMediaUrls.length > 0) {
          mainMedia = uploadedMediaUrls[0];
        }
      }

      setUploadProgress(85);

      const finalMediaUrls = uploadedMediaUrls.length > 0 ? uploadedMediaUrls : mediaPreviews;

      // 2. Appel Route API /api/posts/create pour Firestore & Session 48h
      let createdToken = `v_${Math.random().toString(36).substring(2, 10)}`;
      let magicUrl = `https://cmflow.sn/v/${createdToken}`;
      let createdPostId = `post_${Date.now()}`;

      try {
        const response = await fetch('/api/posts/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workspaceId: currentWorkspaceId,
            caption,
            mediaUrl: mainMedia,
            mediaUrls: finalMediaUrls,
            mediaType: postFormat,
            format: postFormat,
            aspectRatio,
            platforms: targetPlatforms,
            scheduledDate,
            scheduledTime,
            requiresApproval,
            publishMode: requiresApproval ? 'whatsapp_approval' : 'direct',
          }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.token) createdToken = result.token;
          if (result.magicUrl) magicUrl = result.magicUrl;
          if (result.postId) createdPostId = result.postId;
        }
      } catch (apiErr) {
        console.warn('⚠️ Enregistrement local fallback :', apiErr);
      }

      const assignedStatus: PostStatus = requiresApproval ? 'pending_validation' : 'scheduled';

      const newPost: CalendarPost = {
        id: createdPostId,
        clientId: currentWorkspaceId,
        network: primaryNetwork,
        status: assignedStatus,
        scheduledDate,
        scheduledTime,
        caption,
        mediaUrl: mainMedia,
        mediaUrls: finalMediaUrls,
        mediaType: postFormat,
        format: postFormat,
        aspectRatio,
        requiresApproval,
        carouselCount: postFormat === 'carousel' ? finalMediaUrls.length : undefined,
        likesEst: Math.floor(Math.random() * 400) + 50,
      };

      setPosts([newPost, ...posts]);
      setIsCreatePostModalOpen(false);

      if (requiresApproval) {
        // Ouverture immédiate de la modale de validation WhatsApp
        setShareModalPost(newPost);
        setShareModalToken(createdToken);
        setShareModalMagicUrl(magicUrl);
        setIsWhatsAppModalOpen(true);
        triggerToast('🎉 Publication enregistrée & lien WhatsApp prêt pour validation !');
      } else {
        triggerToast('⚡ Publication programmée directement avec succès !');
      }

      // Reset formulaire
      setCaption('');
      setMediaFiles([]);
      setMediaPreviews(['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80']);
      setPostFormat('image');
      setAspectRatio('1:1');
      setRequiresApproval(true);
      setActiveCarouselIndex(0);
    } catch (err) {
      console.error('Erreur lors de la création du post :', err);
      triggerToast('❌ Erreur lors de la création de la publication.');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const renderNetworkIcon = (network: SocialNetwork, className = 'w-4 h-4') => {
    switch (network) {
      case 'instagram':
        return <Instagram className={`${className} text-[#E1306C]`} />;
      case 'facebook':
        return <Facebook className={`${className} text-[#1877F2]`} />;
      case 'tiktok':
        return <Video className={`${className} text-black`} />;
      case 'linkedin':
        return <Linkedin className={`${className} text-[#0077B5]`} />;
    }
  };

  const renderStatusBadge = (status: PostStatus) => {
    switch (status) {
      case 'draft':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
            Brouillon
          </span>
        );
      case 'pending_validation':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
            En attente de validation
          </span>
        );
      case 'validated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <CheckCheck className="w-3 h-3 text-emerald-600" />
            Validé client
          </span>
        );
      case 'scheduled':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 shadow-2xs">
            <Clock className="w-3 h-3 text-emerald-600" />
            Programmé
          </span>
        );
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-xs">
            <Sparkles className="w-3 h-3 text-emerald-600" />
            🚀 Publié en ligne
          </span>
        );
      case 'PUBLISH_FAILED':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <X className="w-3 h-3 text-rose-600" />
            Échec diffusion
          </span>
        );
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Toast Flottant */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0F172A]/95 backdrop-blur-xl text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-[#F94F06]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          A. EN-TÊTE DE PAGE & ACTIONS RAPIDES
          ======================================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <span>CMFlow</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium">Planning &amp; File de publication</span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
              Planning des Publications
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{currentWorkspaceName} {currentWorkspaceFlag}</span>
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Organisez, prévisualisez et soumettez vos contenus pour validation client WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Bouton Nouveau Post Principal */}
          <button
            type="button"
            onClick={() => setIsCreatePostModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-[#F94F06] hover:bg-[#e04605] text-white shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouveau post</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          B. 4 CARTES KPIS RAPIDES
          ======================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Posts ce mois</span>
            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200/60">+4 vs m-1</span>
          </div>
          <div className="text-xl font-extrabold text-[#0F172A] mt-1">{filteredPosts.length} publications</div>
          <div className="text-[11px] text-slate-500 mt-1">Rythme régulier maintenu</div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">En attente retour</span>
            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
              WhatsApp
            </span>
          </div>
          <div className="text-xl font-extrabold text-amber-600 mt-1">{pendingPostsCount} posts</div>
          <div className="text-[11px] text-slate-500 mt-1">En cours d&apos;examen client</div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Validés client</span>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/60">94% Succès</span>
          </div>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{validatedPostsCount} posts</div>
          <div className="text-[11px] text-slate-500 mt-1">Prêts pour diffusion</div>
        </div>

        <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200/70 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Programmés</span>
            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200/60">Meta Queue</span>
          </div>
          <div className="text-xl font-extrabold text-purple-600 mt-1">{scheduledPostsCount} posts</div>
          <div className="text-[11px] text-slate-500 mt-1">En file d&apos;attente automatique</div>
        </div>
      </div>

      {/* =======================================================================
          C. VUE PLANNING SEMAINE / LISTE DES POSTS
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-[#0F172A]">File de Programmation</h2>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
              {filteredPosts.length} posts
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap text-xs">
            <select
              value={selectedNetworkFilter}
              onChange={(e) => setSelectedNetworkFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700"
            >
              <option value="all">Tous les réseaux</option>
              <option value="instagram">Instagram</option>
              <option value="facebook">Facebook</option>
              <option value="tiktok">TikTok</option>
              <option value="linkedin">LinkedIn</option>
            </select>

            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="p-2 rounded-xl bg-slate-50 border border-slate-200 font-bold text-slate-700"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending_validation">En attente WhatsApp</option>
              <option value="validated">Validé client</option>
              <option value="scheduled">Programmé</option>
            </select>
          </div>
        </div>

        {/* Grille des publications */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all space-y-3 group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {renderNetworkIcon(post.network)}
                  <span className="text-xs font-bold text-slate-700 capitalize">{post.network}</span>
                </div>
                {renderStatusBadge(post.status)}
              </div>

              {/* Média Card */}
              <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                <img
                  src={post.mediaUrl}
                  alt="Post preview"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {post.format === 'carousel' && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                    <Layers className="w-3 h-3" />
                    <span>{post.carouselCount || 3} slides</span>
                  </div>
                )}
                {post.format === 'video' && (
                  <div className="absolute top-2 right-2 px-2 py-0.5 rounded-md bg-purple-600/90 text-white text-[10px] font-bold flex items-center gap-1">
                    <Video className="w-3 h-3" />
                    <span>Reel 9:16</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-bold flex items-center gap-1">
                  <CalendarIcon className="w-3 h-3" />
                  <span>{post.scheduledDate} à {post.scheduledTime}</span>
                </div>
              </div>

              <p className="text-xs text-slate-700 line-clamp-2 leading-relaxed">
                {post.caption}
              </p>

              <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                <span className="font-semibold">Format : <strong className="text-slate-800 uppercase text-[10px]">{post.format || post.mediaType}</strong></span>
                <button
                  type="button"
                  onClick={() => {
                    setShareModalPost(post);
                    setShareModalToken(`v_${post.id.slice(-6)}`);
                    setShareModalMagicUrl(`https://cmflow.sn/v/v_${post.id.slice(-6)}`);
                    setIsWhatsAppModalOpen(true);
                  }}
                  className="text-[#F94F06] hover:underline font-bold text-xs flex items-center gap-1 cursor-pointer"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Partager WhatsApp</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* =======================================================================
          D. MODALE DE CRÉATION DE POST ENRICHI (FORMATS, RATIOS, MULTI-MÉDIAS)
          ======================================================================= */}
      {isCreatePostModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full border border-slate-200/90 overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in">
            
            {/* Header Modale */}
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#F94F06]/10 text-[#F94F06] flex items-center justify-center font-bold">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                    Planifier une Publication
                  </h2>
                  <p className="text-xs text-slate-500">
                    Pour <strong>{currentWorkspaceName} {currentWorkspaceFlag}</strong> • Multi-canaux &amp; Validation WhatsApp
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps en 2 Colonnes */}
            <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 min-h-0 overflow-y-auto">
              
              {/* COLONNE GAUCHE (Formulaire 60%) */}
              <div className="lg:col-span-7 p-5 sm:p-6 space-y-5 border-r border-slate-100 overflow-y-auto">
                
                {/* 1. SÉLECTEUR DE FORMAT EXPLICITE (Image Unique / Carrousel / Vidéo) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    1. Format de la Publication
                  </label>
                  <div className="grid grid-cols-3 gap-2.5">
                    
                    {/* A. Image Unique */}
                    <button
                      type="button"
                      onClick={() => handleSelectFormat('image')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        postFormat === 'image'
                          ? 'border-[#F94F06] bg-orange-50/60 ring-2 ring-orange-200/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <ImageIcon className={`w-4 h-4 ${postFormat === 'image' ? 'text-[#F94F06]' : 'text-slate-500'}`} />
                        {postFormat === 'image' && <Check className="w-3.5 h-3.5 text-[#F94F06]" />}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Image Unique</div>
                      <div className="text-[10px] text-slate-400">1:1 ou 4:5 Portrait</div>
                    </button>

                    {/* B. Carrousel */}
                    <button
                      type="button"
                      onClick={() => handleSelectFormat('carousel')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        postFormat === 'carousel'
                          ? 'border-[#F94F06] bg-orange-50/60 ring-2 ring-orange-200/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Layers className={`w-4 h-4 ${postFormat === 'carousel' ? 'text-[#F94F06]' : 'text-slate-500'}`} />
                        {postFormat === 'carousel' && <Check className="w-3.5 h-3.5 text-[#F94F06]" />}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Carrousel</div>
                      <div className="text-[10px] text-slate-400">Jusqu&apos;à 10 visuels</div>
                    </button>

                    {/* C. Vidéo / Reel */}
                    <button
                      type="button"
                      onClick={() => handleSelectFormat('video')}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        postFormat === 'video'
                          ? 'border-[#F94F06] bg-orange-50/60 ring-2 ring-orange-200/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <Video className={`w-4 h-4 ${postFormat === 'video' ? 'text-[#F94F06]' : 'text-slate-500'}`} />
                        {postFormat === 'video' && <Check className="w-3.5 h-3.5 text-[#F94F06]" />}
                      </div>
                      <div className="text-xs font-bold text-slate-900">Vidéo / Reel</div>
                      <div className="text-[10px] text-slate-400">9:16 ou 16:9 HD</div>
                    </button>

                  </div>
                </div>

                {/* 2. SÉLECTEUR DE RATIO D'ASPECT */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Ratio &amp; Dimensions du Média
                  </label>
                  <div className="flex items-center gap-2 flex-wrap text-xs">
                    {postFormat !== 'video' ? (
                      <>
                        <button
                          type="button"
                          onClick={() => setAspectRatio('1:1')}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            aspectRatio === '1:1'
                              ? 'bg-[#0F172A] text-white border-[#0F172A]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Carré 1:1 (1080 × 1080)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAspectRatio('4:5')}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            aspectRatio === '4:5'
                              ? 'bg-[#0F172A] text-white border-[#0F172A]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Portrait 4:5 (1080 × 1350)
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setAspectRatio('9:16')}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            aspectRatio === '9:16'
                              ? 'bg-[#0F172A] text-white border-[#0F172A]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Vertical 9:16 (Reel / TikTok / Story)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAspectRatio('16:9')}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            aspectRatio === '16:9'
                              ? 'bg-[#0F172A] text-white border-[#0F172A]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          Paysage 16:9 (Vidéo Standard)
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. CANAUX SOCIAUX */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                    Réseaux Sociaux Cibles
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { id: 'instagram', label: 'Instagram', icon: <Instagram className="w-4 h-4 text-[#E1306C]" /> },
                      { id: 'facebook', label: 'Facebook', icon: <Facebook className="w-4 h-4 text-[#1877F2]" /> },
                      { id: 'tiktok', label: 'TikTok', icon: <Video className="w-4 h-4 text-black" /> },
                      { id: 'linkedin', label: 'LinkedIn', icon: <Linkedin className="w-4 h-4 text-[#0077B5]" /> },
                    ].map((platform) => {
                      const isSelected = targetPlatforms.includes(platform.id as SocialNetwork);
                      return (
                        <button
                          key={platform.id}
                          type="button"
                          onClick={() => togglePlatform(platform.id as SocialNetwork)}
                          className={`p-2.5 rounded-2xl border flex items-center justify-center gap-2 text-xs font-semibold transition-all cursor-pointer ${
                            isSelected
                              ? 'border-[#F94F06] bg-orange-50/50 text-[#F94F06] shadow-xs'
                              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                          }`}
                        >
                          {platform.icon}
                          <span>{platform.label}</span>
                          {isSelected && <Check className="w-3 h-3 text-[#F94F06] ml-auto" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 4. ZONE D'UPLOAD & GESTION DES MÉDIAS */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Médias ({postFormat === 'carousel' ? `${mediaPreviews.length}/10 slides` : postFormat === 'video' ? 'Vidéo' : 'Image'})
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAssetLibraryOpen(true)}
                      className="text-[#0066FF] hover:underline text-xs font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>Médiathèque ({BRAND_ASSETS_LIBRARY.length})</span>
                    </button>
                  </div>

                  {/* Input file caché */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files && handleFilesSelected(e.target.files)}
                    multiple={postFormat === 'carousel'}
                    accept={postFormat === 'video' ? 'video/mp4,video/quicktime,video/webm' : 'image/png,image/jpeg,image/webp'}
                    className="hidden"
                  />

                  {/* Zone de drop principale */}
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      if (e.dataTransfer.files) handleFilesSelected(e.dataTransfer.files);
                    }}
                    className="border-2 border-dashed border-slate-200 hover:border-orange-400 bg-slate-50/50 hover:bg-orange-50/20 rounded-3xl p-5 text-center transition-all cursor-pointer group flex flex-col items-center justify-center min-h-[140px]"
                  >
                    <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center text-[#F94F06] mb-2 group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-5 h-5" />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      {postFormat === 'carousel'
                        ? 'Glissez vos images ou cliquez pour ajouter (jusqu\'à 10)'
                        : postFormat === 'video'
                        ? 'Glissez votre vidéo MP4/MOV ici'
                        : 'Glissez votre visuel 1080x1080 ou 1080x1350'}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, WEBP ou MP4 jusqu&apos;à 50 Mo</span>
                  </div>

                  {/* BANDEAU MINIATURES DU CARROUSEL (Si mode Carrousel activé) */}
                  {postFormat === 'carousel' && mediaPreviews.length > 0 && (
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] font-bold uppercase text-slate-500">Slides du Carrousel (Cliquez pour inspecter) :</span>
                      <div className="flex items-center gap-2 overflow-x-auto pb-1">
                        {mediaPreviews.map((url, idx) => (
                          <div
                            key={idx}
                            onClick={() => setActiveCarouselIndex(idx)}
                            className={`relative w-16 h-16 rounded-xl overflow-hidden shrink-0 border-2 cursor-pointer transition-all ${
                              activeCarouselIndex === idx ? 'border-[#F94F06] ring-2 ring-orange-200' : 'border-slate-200 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                            <span className="absolute bottom-0 left-0 bg-black/75 text-white text-[9px] font-black px-1 rounded-tr">
                              #{idx + 1}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveSingleMedia(idx);
                              }}
                              className="absolute top-0.5 right-0.5 bg-red-500 text-white rounded-full p-0.5 hover:scale-110 shadow-xs"
                            >
                              <X className="w-2.5 h-2.5" />
                            </button>
                          </div>
                        ))}

                        {mediaPreviews.length < 10 && (
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="w-16 h-16 rounded-xl border-2 border-dashed border-slate-300 hover:border-orange-400 bg-slate-50 text-slate-500 hover:text-[#F94F06] flex flex-col items-center justify-center shrink-0 text-[10px] font-bold gap-0.5 cursor-pointer transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Ajouter</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                </div>

                {/* 5. LÉGENDE & HASHTAGS */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Légende &amp; Hashtags
                    </label>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {caption.length} caractères
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="Rédigez votre texte captivant avec émojis et hashtags..."
                    className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                  />
                  <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                    {['#DakarFood', '#TerangaGourmet', '#Senegal', '#Foodie', '#ReelsDakar'].map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => setCaption((prev) => `${prev} ${tag}`.trim())}
                        className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[10px] font-semibold transition-colors cursor-pointer"
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 6. DATE & HEURE DE DIFFUSION */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Date de Publication
                    </label>
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                      Heure de Diffusion
                    </label>
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      required
                      className="w-full p-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-xs text-slate-900 font-medium"
                    />
                  </div>
                </div>

                {/* 7. SÉLECTEUR DU MODE DE VALIDATION & PUBLICATION (Option A vs Option B) */}
                <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-800">
                      Option de Validation &amp; Publication
                    </label>
                    <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs ${
                      requiresApproval
                        ? 'bg-amber-50 text-amber-700 border-amber-200/80'
                        : 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    }`}>
                      {requiresApproval ? '💬 Validation WhatsApp requise' : '⚡ Publication directe'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* Option A : Programmer directement */}
                    <div
                      onClick={() => setRequiresApproval(false)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        !requiresApproval
                          ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-200/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        !requiresApproval ? 'border-emerald-600 bg-emerald-600 text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {!requiresApproval && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>⚡ Programmer directement</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Sans validation client. Publication automatique à la date et heure choisies.
                        </div>
                      </div>
                    </div>

                    {/* Option B : Envoyer pour validation WhatsApp */}
                    <div
                      onClick={() => setRequiresApproval(true)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-start gap-3 ${
                        requiresApproval
                          ? 'border-[#F94F06] bg-orange-50/60 ring-2 ring-orange-200/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50/80'
                      }`}
                    >
                      <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                        requiresApproval ? 'border-[#F94F06] bg-[#F94F06] text-white' : 'border-slate-300 bg-white'
                      }`}>
                        {requiresApproval && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                          <span>💬 Validation WhatsApp</span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          Génère un lien interactif 48h. Attend l&apos;accord client avant diffusion.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* COLONNE DROITE (Live Feed Mockup Preview avec Ratio Strict et max-h) */}
              <div className="lg:col-span-5 p-5 sm:p-6 bg-slate-50/70 flex flex-col items-center justify-center space-y-3">
                <div className="w-full flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-[#F94F06]" />
                    <span>Aperçu Mobile Feed Live</span>
                  </span>
                  <span className="text-[10px] font-semibold text-slate-500 bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    {aspectRatio === '1:1' ? '1:1 Carré' : aspectRatio === '4:5' ? '4:5 Portrait' : '9:16 Vertical'}
                  </span>
                </div>

                {/* Smartphone Card Mockup */}
                <div className="w-full max-w-sm bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden transition-all">
                  
                  {/* Header Feed */}
                  <div className="p-3 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#F94F06] to-amber-500 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                        TG
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900 flex items-center gap-1">
                          <span>{currentWorkspaceName}</span>
                          <span className="text-[10px]">{currentWorkspaceFlag}</span>
                        </div>
                        <div className="text-[9px] text-slate-400 font-medium">Dakar • Sponsorisé</div>
                      </div>
                    </div>
                    <MoreHorizontal className="w-4 h-4 text-slate-400" />
                  </div>

                  {/* CONTENEUR MÉDIA STRICT AVEC RATIO CSS (CORRECTION BUG 1080x1080) */}
                  <div className="w-full max-h-[380px] overflow-hidden bg-slate-950 flex items-center justify-center relative">
                    <div
                      className={`w-full max-h-[380px] relative flex items-center justify-center ${
                        aspectRatio === '1:1'
                          ? 'aspect-square'
                          : aspectRatio === '4:5'
                          ? 'aspect-[4/5]'
                          : aspectRatio === '9:16'
                          ? 'aspect-[9/16]'
                          : 'aspect-video'
                      }`}
                    >
                      {mediaPreviews.length > 0 ? (
                        postFormat === 'video' ? (
                          <video
                            src={mediaPreviews[0]}
                            controls
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <img
                            src={mediaPreviews[activeCarouselIndex] || mediaPreviews[0]}
                            alt="Feed preview"
                            className="w-full h-full object-cover rounded-lg"
                          />
                        )
                      ) : (
                        <div className="text-center p-4 text-slate-400">
                          <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                          <span className="text-xs font-semibold">Aucun média</span>
                        </div>
                      )}

                      {/* Flèches de navigation Carrousel */}
                      {postFormat === 'carousel' && mediaPreviews.length > 1 && (
                        <>
                          {activeCarouselIndex > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveCarouselIndex((prev) => prev - 1)}
                              className="absolute left-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/90 cursor-pointer shadow-md"
                            >
                              ‹
                            </button>
                          )}
                          {activeCarouselIndex < mediaPreviews.length - 1 && (
                            <button
                              type="button"
                              onClick={() => setActiveCarouselIndex((prev) => prev + 1)}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black/90 cursor-pointer shadow-md"
                            >
                              ›
                            </button>
                          )}
                          <div className="absolute top-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            {activeCarouselIndex + 1} / {mediaPreviews.length}
                          </div>
                          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
                            {mediaPreviews.map((_, i) => (
                              <span
                                key={i}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                   activeCarouselIndex === i ? 'bg-white w-3' : 'bg-white/50'
                                }`}
                              />
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Actions Sociales */}
                  <div className="p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Heart className="w-4 h-4 text-slate-700 hover:text-red-500 cursor-pointer" />
                        <MessageSquare className="w-4 h-4 text-slate-700" />
                        <Share2 className="w-4 h-4 text-slate-700" />
                      </div>
                      <Bookmark className="w-4 h-4 text-slate-700" />
                    </div>

                    <div className="text-[10px] font-bold text-slate-900">
                      1 428 J&apos;aime
                    </div>

                    <div className="text-xs text-slate-800 leading-relaxed font-normal">
                      <strong className="font-bold mr-1.5 text-slate-900">{currentWorkspaceName}</strong>
                      <span>{caption || 'Votre légende s\'affiche ici en direct...'}</span>
                    </div>

                    <div className="text-[9px] text-slate-400 uppercase tracking-wider pt-0.5 flex items-center justify-between">
                      <span>Programmé le {scheduledDate} à {scheduledTime}</span>
                      <span className={`font-bold ${requiresApproval ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {requiresApproval ? '• Validation requise' : '• Direct'}
                      </span>
                    </div>
                  </div>

                </div>

              </div>

            </div>

            {/* Footer Modale avec Bouton d'action dynamique */}
            <div className="p-4 bg-white border-t border-slate-100 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setIsCreatePostModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>

              <button
                type="button"
                onClick={handleCreatePostSubmit}
                disabled={(!caption.trim() && mediaPreviews.length === 0) || isUploading}
                className={`px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer ${
                  requiresApproval
                    ? 'bg-[#F94F06] hover:bg-[#e04605] shadow-orange-500/25'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                }`}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span>Téléversement {uploadProgress > 0 ? `${uploadProgress}%` : '...'}</span>
                  </>
                ) : requiresApproval ? (
                  <>
                    <MessageSquare className="w-4 h-4" />
                    <span>Enregistrer &amp; Obtenir le lien WhatsApp</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Programmer la publication</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =======================================================================
          E. MODALE TIROIR : SÉLECTEUR DE LA MÉDIATHÈQUE ASSETS
          ======================================================================= */}
      {isAssetLibraryOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-200 p-6 max-h-[85vh] flex flex-col animate-in fade-in">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Médiathèque de la Marque ({BRAND_ASSETS_LIBRARY.length} visuels HD)
                </h3>
                <p className="text-xs text-slate-500">
                  Sélectionnez un visuel existant de {currentWorkspaceName} en 1 clic
                </p>
              </div>
              <button
                onClick={() => setIsAssetLibraryOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto py-4 flex-1">
              {BRAND_ASSETS_LIBRARY.map((asset) => (
                <div
                  key={asset.id}
                  onClick={() => handleSelectAsset(asset)}
                  className="group relative rounded-2xl overflow-hidden border border-slate-200 hover:border-[#F94F06] cursor-pointer shadow-xs transition-all aspect-square bg-slate-900"
                >
                  <img src={asset.url} alt={asset.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-2.5">
                    <span className="text-white text-xs font-bold truncate">{asset.title}</span>
                    <span className="text-[10px] text-slate-300">{asset.category}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsAssetLibraryOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =======================================================================
          F. MODALE DE PARTAGE WHATSAPP EN 1 CLIC
          ======================================================================= */}
      {isWhatsAppModalOpen && shareModalPost && (
        <WhatsAppShareModal
          isOpen={isWhatsAppModalOpen}
          onClose={() => setIsWhatsAppModalOpen(false)}
          post={shareModalPost}
          token={shareModalToken}
          magicUrl={shareModalMagicUrl}
          workspaceName={currentWorkspaceName}
          workspaceFlag={currentWorkspaceFlag}
          workspaceWhatsapp="+221 77 800 12 34"
        />
      )}

    </div>
  );
}
