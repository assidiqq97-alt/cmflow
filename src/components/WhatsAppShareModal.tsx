'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  X,
  Clock,
  Instagram,
  Facebook,
  Linkedin,
  Video,
  Layers,
  Sparkles,
  Calendar,
  Share2
} from 'lucide-react';

export interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  post?: {
    id?: string;
    caption?: string;
    mediaUrl?: string;
    mediaType?: 'image' | 'video' | 'carousel' | string;
    scheduledDate?: string;
    scheduledTime?: string;
    platforms?: string[];
    network?: string;
  };
  token?: string;
  magicUrl?: string;
  workspace?: {
    id?: string;
    name?: string;
    whatsappClient?: string;
    whatsappNumber?: string;
    whatsapp?: string;
    flag?: string;
  };
  workspaceName?: string;
  workspaceFlag?: string;
  workspaceWhatsapp?: string;
}

export function WhatsAppShareModal({
  isOpen,
  onClose,
  post,
  token = 'v_demo8a1d',
  magicUrl,
  workspace,
  workspaceName,
  workspaceFlag,
  workspaceWhatsapp,
}: WhatsAppShareModalProps) {
  const [copied, setCopied] = useState(false);
  const effectiveWorkspaceName = workspace?.name || workspaceName;
  const effectiveWhatsapp = workspaceWhatsapp || workspace?.whatsappClient || workspace?.whatsappNumber || workspace?.whatsapp || '+221 77 842 19 02';
  const [customPhone, setCustomPhone] = useState(effectiveWhatsapp);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !mounted || typeof document === 'undefined') return null;

  // Calcul du lien magique permanent
  const finalMagicUrl =
    magicUrl ||
    (typeof window !== 'undefined'
      ? `${window.location.origin}/v/${token}`
      : `https://cmflow.sn/v/${token}`);

  // Nettoyage du numéro de téléphone (uniquement chiffres avec indicatif)
  const cleanPhone = customPhone.replace(/[^0-9]/g, '');

  // Message WhatsApp soigné et engageant
  const clientName = effectiveWorkspaceName ? `${effectiveWorkspaceName} ` : '';
  const messageText = `Bonjour ${clientName}! 🌟 Voici les nouveaux visuels prêts pour validation : ${finalMagicUrl} (Lien actif pendant 48h sans mot de passe).`;
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  // Copier le lien dans le presse-papier
  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(finalMagicUrl);
      } else {
        const input = document.createElement('input');
        input.value = finalMagicUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.error('Erreur copie presse-papier :', err);
    }
  };

  const platforms = post?.platforms || (post?.network ? [post.network] : ['instagram']);

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      {/* Conteneur Modale Dribbble / Linear */}
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col scale-100 transition-all">
        
        {/* En-tête avec Bannière Festive Dégradée */}
        <div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500 p-6 text-white shrink-0 overflow-hidden">
          {/* Éléments décoratifs en arrière-plan */}
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-6 -ml-6 w-24 h-24 bg-emerald-400/20 rounded-full blur-xl pointer-events-none" />

          {/* Bouton de Fermeture */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/10 hover:bg-black/20 rounded-full transition-colors cursor-pointer"
            aria-label="Fermer la modale"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Badge & Titre */}
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 bg-white/20 backdrop-blur-md rounded-full text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 text-emerald-100">
              <Sparkles className="w-3 h-3 text-amber-300" />
              Validation WhatsApp Active
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Publication enregistrée !</span>
            <span>🎉</span>
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 leading-relaxed">
            Votre contenu a été programmé avec succès. Partagez le lien magique à votre client pour validation en 1 clic.
          </p>
        </div>

        {/* Corps de la Modale */}
        <div className="p-6 space-y-4">
          
          {/* Aperçu du Post Programmé */}
          {post && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
              {post.mediaUrl ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0 border border-slate-200">
                  <img
                    src={post.mediaUrl}
                    alt="Aperçu post"
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-slate-100 text-slate-400 shrink-0">
                  <Share2 className="w-5 h-5" />
                </div>
              )}

              {/* Infos Post */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {workspace?.name || 'Client actif'}
                  </span>
                  {workspace?.flag && <span>{workspace.flag}</span>}
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md">
                    En attente
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-1 italic mb-1.5">
                  &ldquo;{post?.caption || 'Publication sans texte'}&rdquo;
                </p>

                <div className="flex items-center gap-3 text-[11px] text-slate-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#F94F06]" />
                    <span>{post?.scheduledDate || 'Aujourd\'hui'}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{post?.scheduledTime || '18:30'}</span>
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 2. Champ Lien Magique avec Bouton Copier */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <span>Lien Magique Public</span>
                <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.2 rounded-full border border-emerald-200">
                  Valide 48h
                </span>
              </label>
              <span className="text-[11px] text-slate-400">Aucun mot de passe requis</span>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex-1 relative bg-slate-100/80 border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center text-xs font-mono text-slate-800 select-all overflow-x-auto whitespace-nowrap">
                <span className="text-emerald-700 font-semibold">{finalMagicUrl}</span>
              </div>

              <button
                type="button"
                onClick={handleCopyLink}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                  copied
                    ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copié !</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 3. Numéro WhatsApp du Client */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
              <span>Numéro WhatsApp du Client</span>
              <span className="text-[10px] text-slate-400 font-normal">Modifiable avant envoi</span>
            </label>
            <input
              type="text"
              value={customPhone}
              onChange={(e) => setCustomPhone(e.target.value)}
              placeholder="+221 77 000 00 00"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* 4. Bouton Principal WhatsApp Vert Émeraude */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="w-full py-3.5 px-5 bg-[#10B981] hover:bg-[#059669] text-white font-bold rounded-2xl text-sm shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 text-center no-underline cursor-pointer group"
          >
            {/* Icône WhatsApp Officielle */}
            <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className="shrink-0 group-hover:scale-110 transition-transform">
              <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm0 18.15c-1.5 0-2.97-.39-4.27-1.14l-.31-.18-3.17.83.85-3.09-.2-.32a8.188 8.188 0 0 1-1.25-4.34c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.12 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.14.17-.25.25-.41.08-.17.04-.31-.02-.43-.06-.12-.56-1.34-.76-1.84-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.06 0 1.21.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.18-.47-.3z" />
            </svg>
            <span>Envoyer directement sur WhatsApp</span>
          </a>

          {/* Actions Secondaires */}
          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <a
              href={finalMagicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              <span>Tester la vue client</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              type="button"
              onClick={onClose}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Fermer
            </button>
          </div>

        </div>
      </div>
    </div>,
    document.body
  );
}

export default WhatsAppShareModal;
