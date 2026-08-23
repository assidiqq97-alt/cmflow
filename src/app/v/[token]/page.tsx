'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Send,
  Sparkles,
  Calendar,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Video,
  Layers,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  PartyPopper,
  Hourglass,
  ArrowRight,
  Loader2,
  Check,
  Share2,
  ExternalLink,
  MessageCircle,
  Flame,
  CheckCheck
} from 'lucide-react';

export type SocialNetwork = 'instagram' | 'facebook' | 'tiktok' | 'linkedin';
export type PostApprovalStatus = 'PENDING' | 'APPROVED' | 'CHANGES_REQUESTED';

export interface PublicValidationPost {
  id: string;
  workspaceId?: string;
  network: SocialNetwork;
  scheduledDate: string;
  scheduledTime: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'carousel';
  carouselCount?: number;
  status: PostApprovalStatus;
  feedbackComment?: string;
}

export interface ClientWorkspaceInfo {
  id: string;
  name: string;
  flag?: string;
  avatar: string;
  agencyName?: string;
  agencyWhatsapp?: string;
  whatsappNumber?: string;
}

// Données initiales et de repli
const DEFAULT_WORKSPACE: ClientWorkspaceInfo = {
  id: 'teranga-gourmet',
  name: 'Teranga Gourmet',
  flag: '🇸🇳',
  avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=160&auto=format&fit=crop&q=80',
  agencyName: 'Awa Diop · Dakar Digital CM',
  agencyWhatsapp: '+221778421902',
  whatsappNumber: '+221778421902',
};

const DEFAULT_POSTS: PublicValidationPost[] = [
  {
    id: 'post-1',
    network: 'instagram',
    scheduledDate: 'Lundi 24 Août 2026',
    scheduledTime: '18:30',
    caption: 'Ce soir, découvrez notre nouveau Thiéboudienne royal revisité aux fruits de mer frais de Soumbédioune 🐟✨ Réservez votre table en terrasse pour ce week-end !\n\n📍 Almadies, Dakar\n#DakarFood #SenegalGourmet #Teranga #DakarFoodies #Gastronomie',
    mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
    mediaType: 'carousel',
    carouselCount: 3,
    status: 'PENDING',
  },
  {
    id: 'post-2',
    network: 'tiktok',
    scheduledDate: 'Mardi 25 Août 2026',
    scheduledTime: '12:15',
    caption: 'Dans les coulisses avec notre Chef Moussa qui prépare les fameux pastels croustillants au poisson 🔥 Vous êtes plutôt sauce pimentée ou douce ? Dites-le nous en commentaire ! 👇\n\n#DakarFood #Foodie #CuisineAfricaine #PastelsDakar',
    mediaUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
    mediaType: 'video',
    status: 'PENDING',
  },
  {
    id: 'post-3',
    network: 'facebook',
    scheduledDate: 'Mercredi 26 Août 2026',
    scheduledTime: '09:00',
    caption: 'Offre spéciale déjeuner d\'entreprise : Bénéficiez de -15% sur toutes vos commandes de groupe du mercredi au vendredi 💼🍽️ Livraison express et soignée au Plateau et aux Almadies.\n\nCommandes par WhatsApp ou au 33 800 00 00.\n#DakarBusiness #DejeunerPro #TerangaGourmet',
    mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
    mediaType: 'image',
    status: 'PENDING',
  },
];

export default function ClientValidationPage({ params }: { params?: { token?: string } }) {
  const router = useRouter();
  const routeParams = useParams();
  const token = (routeParams?.token as string) || params?.token || 'v_demo8a1d';

  // State Management
  const [workspace, setWorkspace] = useState<ClientWorkspaceInfo>(DEFAULT_WORKSPACE);
  const [posts, setPosts] = useState<PublicValidationPost[]>(DEFAULT_POSTS);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRevisionOpen, setIsRevisionOpen] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [hoursLeft, setHoursLeft] = useState<number>(47);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);

  // Toast Trigger
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 1. Logique de Résolution & Sécurité du Token (Firestore / API)
  useEffect(() => {
    let isMounted = true;

    async function loadValidationSession() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/approvals/${token}`);

        if (res.status === 410) {
          router.push('/approve/expired');
          return;
        }

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            if (data.workspace) {
              setWorkspace({
                id: data.workspace.id || DEFAULT_WORKSPACE.id,
                name: data.workspace.name || DEFAULT_WORKSPACE.name,
                flag: data.workspace.flag || DEFAULT_WORKSPACE.flag,
                avatar: data.workspace.avatar || DEFAULT_WORKSPACE.avatar,
                agencyName: data.workspace.agencyName || DEFAULT_WORKSPACE.agencyName,
                agencyWhatsapp: data.workspace.whatsappNumber || DEFAULT_WORKSPACE.agencyWhatsapp,
                whatsappNumber: data.workspace.whatsappNumber || DEFAULT_WORKSPACE.whatsappNumber,
              });
            }

            if (Array.isArray(data.posts) && data.posts.length > 0) {
              const formattedPosts: PublicValidationPost[] = data.posts.map((p: any) => ({
                id: p.id || `post-${Math.random()}`,
                workspaceId: p.workspaceId,
                network: (p.network || 'instagram').toLowerCase() as SocialNetwork,
                scheduledDate: p.scheduledDate || 'Bientôt',
                scheduledTime: p.scheduledTime || '18:30',
                caption: p.caption || '',
                mediaUrl: p.mediaUrl || DEFAULT_POSTS[0].mediaUrl,
                mediaType: (p.mediaType || 'image').toLowerCase() as any,
                carouselCount: p.carouselCount || (p.mediaType === 'carousel' ? 3 : undefined),
                status: p.status === 'validated' || p.status === 'APPROVED' ? 'APPROVED' : p.status === 'CHANGES_REQUESTED' || p.status === 'needs_revision' ? 'CHANGES_REQUESTED' : 'PENDING',
                feedbackComment: p.feedbackComment || '',
              }));
              setPosts(formattedPosts);
            }

            // Calcul du temps restant
            if (data.session?.expiresAt) {
              const diffMs = new Date(data.session.expiresAt).getTime() - Date.now();
              const hrs = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
              setHoursLeft(hrs);
            }
          }
        }
      } catch (err) {
        console.warn('⚠️ Mode démo actif pour la validation :', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadValidationSession();
    return () => {
      isMounted = false;
    };
  }, [token, router]);

  // Post Actuellement Affiché
  const currentPost = posts[currentIndex] || posts[0];

  // Statistiques de progression
  const approvedCount = useMemo(() => posts.filter((p) => p.status === 'APPROVED').length, [posts]);
  const reviewedCount = useMemo(() => posts.filter((p) => p.status !== 'PENDING').length, [posts]);
  const allApproved = useMemo(() => posts.length > 0 && posts.every((p) => p.status === 'APPROVED'), [posts]);
  const allReviewed = useMemo(() => posts.length > 0 && posts.every((p) => p.status !== 'PENDING'), [posts]);

  // Vérifier si la fête doit être déclenchée
  useEffect(() => {
    if (allApproved && !isLoading) {
      setShowCelebration(true);
      setConfettiActive(true);
      const timer = setTimeout(() => setConfettiActive(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [allApproved, isLoading]);

  // 2. Action : Valider la publication courante (Vert Émeraude #10B981)
  const handleApproveCurrentPost = async () => {
    if (!currentPost || isSubmitting) return;

    setIsSubmitting(true);
    const targetId = currentPost.id;

    try {
      // 1. Appel API d'approbation et Webhook temps réel
      fetch('/api/webhooks/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          postId: targetId,
          workspaceId: workspace.id,
          action: 'APPROVED',
          comment: '',
        }),
      }).catch((e) => console.warn('Webhook dispatch warning:', e));

      fetch(`/api/approvals/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: targetId,
          status: 'APPROVED',
          comment: '',
        }),
      }).catch((e) => console.warn('Sync API feedback error:', e));

      // Mise à jour de l'état local
      const updated = posts.map((p) => (p.id === targetId ? { ...p, status: 'APPROVED' as PostApprovalStatus } : p));
      setPosts(updated);
      setIsRevisionOpen(false);
      setRevisionComment('');

      triggerToast('✨ Publication validée avec succès !');

      // Passer automatiquement au post suivant non validé
      const nextPendingIndex = updated.findIndex((p, idx) => idx > currentIndex && p.status === 'PENDING');
      if (nextPendingIndex !== -1) {
        setTimeout(() => setCurrentIndex(nextPendingIndex), 400);
      } else {
        const anyPendingIndex = updated.findIndex((p) => p.status === 'PENDING');
        if (anyPendingIndex !== -1) {
          setTimeout(() => setCurrentIndex(anyPendingIndex), 400);
        }
      }
    } catch (error) {
      console.error('Erreur lors de la validation :', error);
      triggerToast('❌ Erreur lors de la validation.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 3. Action : Soumettre une demande de retouche (Ambre / Orange)
  const handleSubmitRevision = async () => {
    if (!currentPost || !revisionComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    const targetId = currentPost.id;
    const comment = revisionComment.trim();

    try {
      // 1. Appel API de webhook temps réel
      fetch('/api/webhooks/approvals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          postId: targetId,
          workspaceId: workspace.id,
          action: 'CHANGES_REQUESTED',
          comment,
        }),
      }).catch((e) => console.warn('Webhook dispatch warning:', e));

      fetch(`/api/approvals/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: targetId,
          status: 'CHANGES_REQUESTED',
          comment,
        }),
      }).catch((e) => console.warn('Sync API feedback error:', e));

      const updated = posts.map((p) =>
        p.id === targetId ? { ...p, status: 'CHANGES_REQUESTED' as PostApprovalStatus, feedbackComment: comment } : p
      );
      setPosts(updated);
      setIsRevisionOpen(false);
      setRevisionComment('');

      triggerToast('✏️ Remarque transmise à votre Community Manager !');

      // Passer au post suivant si possible
      const nextPendingIndex = updated.findIndex((p, idx) => idx > currentIndex && p.status === 'PENDING');
      if (nextPendingIndex !== -1) {
        setTimeout(() => setCurrentIndex(nextPendingIndex), 400);
      }
    } catch (error) {
      console.error('Erreur lors de la demande de retouche :', error);
      triggerToast('❌ Impossible d\'envoyer le commentaire.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Formatage enrichi de la légende (mise en surbrillance des #hashtags et @mentions)
  const renderFormattedCaption = (text: string) => {
    if (!text) return null;
    const parts = text.split(/(#[a-zA-Z0-9_À-ÿ]+|@[a-zA-Z0-9_.]+)/g);
    return parts.map((part, i) => {
      if (part.startsWith('#')) {
        return (
          <span key={i} className="text-[#0066FF] font-semibold hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      if (part.startsWith('@')) {
        return (
          <span key={i} className="text-[#F94F06] font-semibold hover:underline cursor-pointer">
            {part}
          </span>
        );
      }
      return <span key={i}>{part}</span>;
    });
  };

  // Badge du réseau social cible
  const renderPlatformBadge = (net: SocialNetwork) => {
    switch (net) {
      case 'instagram':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-pink-50 text-[#E1306C] border border-pink-200/80">
            <Instagram className="w-3 h-3" />
            <span>Instagram</span>
          </span>
        );
      case 'facebook':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#1877F2] border border-blue-200/80">
            <Facebook className="w-3 h-3" />
            <span>Facebook</span>
          </span>
        );
      case 'tiktok':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-white shadow-xs">
            <Video className="w-3 h-3" />
            <span>TikTok</span>
          </span>
        );
      case 'linkedin':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-50 text-[#0077B5] border border-sky-200/80">
            <Linkedin className="w-3 h-3" />
            <span>LinkedIn</span>
          </span>
        );
    }
  };

  // WhatsApp Contact Direct
  const whatsappCleanPhone = (workspace.agencyWhatsapp || workspace.whatsappNumber || '221778421902').replace(/[^0-9]/g, '');
  const whatsappThankYouText = encodeURIComponent(
    `Bonjour ! J'ai validé les visuels pour ${workspace.name} 🚀 Merci beaucoup pour la réactivité !`
  );
  const whatsappContactUrl = `https://wa.me/${whatsappCleanPhone}?text=${whatsappThankYouText}`;

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans antialiased flex flex-col justify-between selection:bg-[#10B981] selection:text-white relative overflow-x-hidden">
      
      {/* Background Subtle Slate Glows */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Confetti Animation Effect on Full Approval */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-3 h-3 bg-emerald-400 rounded-full animate-ping" />
          <div className="absolute top-10 right-1/3 w-2 h-4 bg-[#F94F06] rotate-45 animate-bounce" />
          <div className="absolute top-5 right-1/4 w-3 h-3 bg-amber-400 rounded-sm animate-pulse" />
          <div className="absolute top-20 left-1/3 w-4 h-2 bg-blue-500 rounded-full animate-bounce" />
        </div>
      )}

      {/* Toast Notification Flottante */}
      {toastMessage && (
        <div className="fixed top-4 inset-x-4 max-w-sm mx-auto z-50 bg-[#0F172A] text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 animate-in fade-in slide-in-from-top-4 duration-200">
          <Sparkles className="w-4 h-4 text-[#10B981]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =======================================================================
          A. EN-TÊTE CLIENT & COMPTE À REBOURS (STICKY HEADER)
          ======================================================================= */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-xs px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          
          {/* Marque Cliente & Logo */}
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-200 shrink-0 overflow-hidden shadow-xs relative">
              <img
                src={workspace.avatar}
                alt={workspace.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-extrabold text-slate-900 truncate">
                  {workspace.name}
                </h1>
                {workspace.flag && <span className="text-xs">{workspace.flag}</span>}
              </div>
              <p className="text-[10px] text-slate-500 font-medium truncate">
                Validation client sans mot de passe
              </p>
            </div>
          </div>

          {/* Badge Compte à Rebours Dynamique */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-full text-[11px] font-bold shrink-0 shadow-xs">
            <Hourglass className="w-3 h-3 text-amber-600 animate-pulse" />
            <span>Lien actif encore {hoursLeft}h</span>
          </div>

        </div>

        {/* Barre de Progression / Pagination des Publications */}
        {posts.length > 1 && (
          <div className="max-w-lg mx-auto pt-2 mt-2 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1">
              <span className="text-slate-900 font-bold">Publication {currentIndex + 1}</span>
              <span className="text-slate-400">sur {posts.length}</span>
            </div>

            {/* Pastilles indicatrices interactives */}
            <div className="flex items-center gap-1.5">
              {posts.map((p, idx) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setCurrentIndex(idx);
                    setIsRevisionOpen(false);
                  }}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-[#10B981]'
                      : p.status === 'APPROVED'
                      ? 'w-2 bg-emerald-300'
                      : p.status === 'CHANGES_REQUESTED'
                      ? 'w-2 bg-amber-400'
                      : 'w-2 bg-slate-200 hover:bg-slate-300'
                  }`}
                  aria-label={`Aller à la publication ${idx + 1}`}
                />
              ))}
            </div>

            {/* Taux de validation */}
            <span className="text-[11px] font-bold text-emerald-600">
              {approvedCount}/{posts.length} validé(s)
            </span>
          </div>
        )}
      </header>

      {/* =======================================================================
          CORPS PRINCIPAL : CARTE DE PUBLICATION OU ÉCRAN DE FÉLICITATIONS
          ======================================================================= */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 py-5 flex flex-col justify-center">

        {/* 1. ÉCRAN DE FÉLICITATIONS (QUAND TOUT EST VALIDÉ) */}
        {showCelebration ? (
          <div className="bg-white border border-slate-200/80 rounded-3xl p-6 sm:p-8 shadow-[0_8px_30px_-6px_rgba(15,23,42,0.06)] text-center space-y-5 animate-in zoom-in-95 duration-300">
            
            {/* Badge Festif */}
            <div className="w-20 h-20 rounded-3xl bg-emerald-50 border border-emerald-200 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-500/10">
              <PartyPopper className="w-10 h-10 text-emerald-600 animate-bounce" />
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100/80 text-emerald-800 rounded-full text-xs font-black uppercase tracking-wider mb-2">
                <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
                Planning 100% Approuvé
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Tout est validé ! 🎉
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed max-w-xs mx-auto">
                Votre Community Manager s'occupe de la programmation et de la diffusion selon le calendrier convenu 🚀
              </p>
            </div>

            {/* Récapitulatif Visuel Compact */}
            <div className="bg-slate-50 border border-slate-200/70 rounded-2xl p-3.5 text-left space-y-2">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Publications programmées ({posts.length})
              </div>
              <div className="grid grid-cols-3 gap-2">
                {posts.map((p, idx) => (
                  <div key={p.id} className="relative h-20 rounded-xl overflow-hidden bg-slate-900 border border-slate-200">
                    <img src={p.mediaUrl} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                      <Check className="w-5 h-5 text-white stroke-[3]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bouton WhatsApp de Remerciement */}
            <div className="space-y-2.5 pt-2">
              <a
                href={whatsappContactUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3.5 px-5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-white" />
                <span>Confirmer sur WhatsApp au CM</span>
              </a>

              <button
                type="button"
                onClick={() => setShowCelebration(false)}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 py-2 transition-colors cursor-pointer"
              >
                Revoir le détail des publications
              </button>
            </div>

          </div>
        ) : (
          
          /* 2. CARTE DE PUBLICATION (FEED PREVIEW RÉALISTE) */
          <div className="bg-white border border-slate-200/80 rounded-3xl shadow-[0_8px_30px_-6px_rgba(15,23,42,0.06)] overflow-hidden max-w-lg mx-auto flex flex-col transition-all duration-300">
            
            {/* A. En-tête de la Publication */}
            <div className="p-4 flex items-center justify-between border-b border-slate-100 bg-white">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full ring-2 ring-emerald-500/20 p-0.5 overflow-hidden shrink-0 bg-slate-100">
                  <img
                    src={workspace.avatar}
                    alt={workspace.name}
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-900 truncate">
                      {workspace.name}
                    </span>
                    <span className="text-emerald-500 text-xs">●</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-[#F94F06]" />
                      <span>{currentPost?.scheduledDate}</span>
                    </span>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{currentPost?.scheduledTime}</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Badge Réseau & Statut */}
              <div className="flex flex-col items-end gap-1 shrink-0">
                {renderPlatformBadge(currentPost?.network || 'instagram')}
                {currentPost?.status === 'APPROVED' && (
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 flex items-center gap-1">
                    <Check className="w-3 h-3" /> Validé
                  </span>
                )}
                {currentPost?.status === 'CHANGES_REQUESTED' && (
                  <span className="text-[10px] font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Retouche demandée
                  </span>
                )}
              </div>
            </div>

            {/* B. Média du Post (Image HD ou Lecteur Vidéo MP4) */}
            <div className="relative w-full aspect-square bg-slate-950 flex items-center justify-center overflow-hidden group">
              {currentPost?.mediaType === 'video' ? (
                <video
                  src={currentPost.mediaUrl}
                  controls
                  playsInline
                  className="w-full h-full object-cover"
                  poster="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80"
                />
              ) : (
                <img
                  src={currentPost?.mediaUrl}
                  alt="Visuel publication"
                  className="w-full h-full object-cover select-none"
                />
              )}

              {/* Badge Carrousel si multiple */}
              {currentPost?.mediaType === 'carousel' && (
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-full text-white text-[10px] font-bold flex items-center gap-1.5 shadow-md">
                  <Layers className="w-3 h-3 text-white" />
                  <span>1 / {currentPost.carouselCount || 3}</span>
                </div>
              )}

              {/* Navigation Précédent / Suivant sur les bords si plusieurs posts */}
              {posts.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : posts.length - 1));
                      setIsRevisionOpen(false);
                    }}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
                    aria-label="Publication précédente"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentIndex((prev) => (prev < posts.length - 1 ? prev + 1 : 0));
                      setIsRevisionOpen(false);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/70 text-white rounded-full backdrop-blur-md transition-all cursor-pointer"
                    aria-label="Publication suivante"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {/* C. Légende & Texte du Post */}
            <div className="p-4 space-y-2.5 bg-white">
              <div className="text-xs text-slate-800 leading-relaxed">
                <span className="font-bold text-slate-900 mr-1.5">{workspace.name}</span>
                {showFullCaption || currentPost?.caption.length < 140 ? (
                  <span className="whitespace-pre-line">
                    {renderFormattedCaption(currentPost?.caption || '')}
                  </span>
                ) : (
                  <span>
                    {renderFormattedCaption((currentPost?.caption || '').slice(0, 140))}...
                  </span>
                )}
              </div>

              {currentPost?.caption.length >= 140 && (
                <button
                  type="button"
                  onClick={() => setShowFullCaption(!showFullCaption)}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {showFullCaption ? 'Voir moins' : 'Voir plus'}
                </button>
              )}

              {/* Affichage du commentaire de retouche s'il existe */}
              {currentPost?.feedbackComment && (
                <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5 text-amber-800">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Votre demande de modification :</span>
                  </div>
                  <p className="italic pl-5 text-slate-700">"{currentPost.feedbackComment}"</p>
                </div>
              )}
            </div>

            {/* D. Tiroir Intégré : Demande de Retouche */}
            {isRevisionOpen && (
              <div className="p-4 bg-orange-50/60 border-t border-orange-200/80 space-y-3 animate-in slide-in-from-bottom-2 duration-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-orange-950 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-[#F94F06]" />
                    <span>Décrivez les retouches souhaitées</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsRevisionOpen(false)}
                    className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Annuler
                  </button>
                </div>

                <textarea
                  value={revisionComment}
                  onChange={(e) => setRevisionComment(e.target.value)}
                  placeholder="Ex: Corriger la faute au 2e paragraphe, remplacer l'image par celle de vendredi..."
                  rows={3}
                  className="w-full p-3 bg-white border border-orange-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F94F06]/30 focus:border-[#F94F06] transition-all"
                  autoFocus
                />

                <button
                  type="button"
                  onClick={handleSubmitRevision}
                  disabled={!revisionComment.trim() || isSubmitting}
                  className="w-full py-2.5 px-4 bg-[#F94F06] hover:bg-[#e04605] disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>Envoyer les retouches au CM</span>
                    </>
                  )}
                </button>
              </div>
            )}

            {/* ===================================================================
                E. BARRE D'ACTIONS INFÉRIEURE (DECISION BAR)
                =================================================================== */}
            <div className="p-3.5 sm:p-4 bg-slate-50/90 border-t border-slate-100 grid grid-cols-2 gap-2.5">
              
              {/* Bouton 1 — "Demander une modification" (Ambre / Orange) */}
              <button
                type="button"
                onClick={() => setIsRevisionOpen(!isRevisionOpen)}
                disabled={isSubmitting}
                className="py-3 px-3 bg-orange-50 text-[#F94F06] border border-orange-200 hover:bg-orange-100/60 font-bold rounded-2xl text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#F94F06]" />
                <span className="truncate">Demander retouche</span>
              </button>

              {/* Bouton 2 — "Valider cette publication" (Vert Émeraude #10B981) */}
              <button
                type="button"
                onClick={handleApproveCurrentPost}
                disabled={isSubmitting || currentPost?.status === 'APPROVED'}
                className={`py-3 px-4 font-bold rounded-2xl text-xs transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer ${
                  currentPost?.status === 'APPROVED'
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-none'
                    : 'bg-[#10B981] hover:bg-[#059669] text-white shadow-lg shadow-emerald-500/25'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Validation...</span>
                  </>
                ) : currentPost?.status === 'APPROVED' ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    <span>Validé ✓</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Valider ce post</span>
                  </>
                )}
              </button>

            </div>

          </div>
        )}

      </main>

      {/* =======================================================================
          PIED DE PAGE : MARQUE AGENCE & "PROPULSÉ PAR CMFLOW"
          ======================================================================= */}
      <footer className="w-full py-4 text-center text-xs text-slate-400 space-y-1 shrink-0">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200/60 text-slate-600 font-medium text-[11px]">
          <Sparkles className="w-3 h-3 text-[#F94F06]" />
          <span>Propulsé par <strong>CMFlow</strong></span>
        </div>
        <p className="text-[10px] text-slate-400">
          La plateforme tout-en-un des Community Managers d'Afrique 🇸🇳
        </p>
      </footer>

    </div>
  );
}
