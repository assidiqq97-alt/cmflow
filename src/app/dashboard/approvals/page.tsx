'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink,
  Copy,
  Share2,
  Smartphone,
  Eye,
  Plus,
  RefreshCw,
  Sparkles,
  Send,
  Lock,
  RotateCcw,
  Check,
  Calendar,
  FileCheck,
  MessageSquare,
  ChevronRight,
  AlertTriangle,
  X,
  Download
} from 'lucide-react';
import { useClient } from '../../../context/ClientContext';

// Types
export interface ApprovalLog {
  id: string;
  type: 'open' | 'approved' | 'revision' | 'completed';
  time: string;
  postTitle?: string;
  comment?: string;
  device?: string;
}

export interface PastSession {
  id: string;
  period: string;
  postsCount: number;
  approvedDate: string;
  status: 'published' | 'archived';
  approverName: string;
  token: string;
}

const INITIAL_LOGS: ApprovalLog[] = [
  {
    id: 'log-1',
    type: 'revision',
    time: 'Aujourd\'hui à 14:15',
    postTitle: 'Carrousel Yassa Poulet Braisé & Jus Bissap',
    comment: '« Remplacer le prix par 4 500 FCFA au lieu de 5 000 FCFA svp »',
  },
  {
    id: 'log-2',
    type: 'approved',
    time: 'Aujourd\'hui à 14:10',
    postTitle: 'Reel Thiéboudienne Royal Penda Mbaye',
  },
  {
    id: 'log-3',
    type: 'approved',
    time: 'Aujourd\'hui à 14:08',
    postTitle: 'Formule Brunch Dimanche aux Almadies',
  },
  {
    id: 'log-4',
    type: 'open',
    time: 'Aujourd\'hui à 14:02',
    device: 'iPhone 15 Pro (Safari Mobile · Dakar 🇸🇳)',
  },
];

const PAST_SESSIONS: PastSession[] = [
  {
    id: 'sess-1',
    period: 'Planning Semaine 33 (17 au 23 Août 2026)',
    postsCount: 4,
    approvedDate: '16 Août 2026',
    status: 'published',
    approverName: 'Mamadou Dieng (Dir. Marketing)',
    token: 'trk-s33-89b',
  },
  {
    id: 'sess-2',
    period: 'Planning Semaine 32 (10 au 16 Août 2026)',
    postsCount: 4,
    approvedDate: '09 Août 2026',
    status: 'published',
    approverName: 'Aïcha Traoré (Gérante)',
    token: 'trk-s32-44c',
  },
  {
    id: 'sess-3',
    period: 'Planning Semaine 31 (03 au 09 Août 2026)',
    postsCount: 3,
    approvedDate: '02 Août 2026',
    status: 'published',
    approverName: 'Mamadou Dieng',
    token: 'trk-s31-12a',
  },
];

export default function ApprovalsPage() {
  const { activeClient } = useClient();

  // États
  const [magicLink, setMagicLink] = useState('https://cmflow.sn/v/teranga-gourmet-a8f9');
  const [sessionActive, setSessionActive] = useState(true);
  const [logs, setLogs] = useState<ApprovalLog[]>(INITIAL_LOGS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Copier le lien magique
  const handleCopyMagicLink = () => {
    navigator.clipboard.writeText(magicLink);
    showToast('🔗 Lien magique de validation copié ! Prêt à coller sur WhatsApp.');
  };

  // Révoquer la session
  const handleRevokeSession = () => {
    setSessionActive(false);
    showToast('🔒 Session révoquée. Le lien ne sera plus accessible par le client.');
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
              Portail de Validation & Sessions WhatsApp
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-orange-50 text-[#F94F06] border border-orange-200/80">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F94F06]"></span>
              {activeClient.name} {activeClient.flag}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Supervisez en temps réel les liens magiques envoyés sur WhatsApp et les retours de vos clients.
          </p>
        </div>

        {/* Actions Supérieures */}
        <div className="flex items-center flex-wrap gap-3">
          
          {/* Bouton Prévisualiser Vue Client */}
          <Link
            href="/approve/teranga-demo-token"
            target="_blank"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 transition-all shadow-2xs"
          >
            <Smartphone className="w-3.5 h-3.5 text-[#0066FF]" />
            <span>Prévisualiser l'écran mobile client</span>
          </Link>

          {/* Bouton Créer Session */}
          <button
            type="button"
            onClick={() => setIsNewSessionModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#F94F06] hover:bg-[#e04605] text-white text-xs font-black rounded-xl shadow-lg shadow-[#F94F06]/25 hover:shadow-[#F94F06]/40 active:scale-[0.98] transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Nouvelle session WhatsApp</span>
          </button>

        </div>
      </div>

      {/* =======================================================================
          B. CARTES KPIS DU PROCESSUS DE VALIDATION (3 CARTES)
          ======================================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Sessions en Cours
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">
            1 session active
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Lien ouvert par le client il y a 12 min 📱
          </div>
        </div>

        {/* KPI 2 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Délai Moyen d'Approbation
            </span>
            <Clock className="w-4 h-4 text-[#0066FF]" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">
            38 minutes
          </div>
          <div className="text-xs text-emerald-600 font-bold">
            Via lien WhatsApp direct sans mot de passe
          </div>
        </div>

        {/* KPI 3 */}
        <div className="bg-white/90 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Taux de Validation Direct
            </span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl sm:text-3xl font-black text-[#0F172A]">
            91%
          </div>
          <div className="text-xs text-slate-500 font-semibold">
            Validés sans retouche ce mois-ci
          </div>
        </div>

      </div>

      {/* =======================================================================
          C. SESSION DE VALIDATION ACTIVE (CARTE HERO GLASSMORPHISM)
          ======================================================================= */}
      <div className="bg-gradient-to-br from-[#0F172A] via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-700/80 space-y-6 relative overflow-hidden">
        
        {/* Glow Effect */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-[#F94F06]/20 via-[#10B981]/20 to-transparent rounded-full blur-3xl pointer-events-none"></div>

        {/* En-tête de Session */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-[#10B981]/20 text-emerald-400 border border-[#10B981]/30 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Session Ouverte par le Client
              </span>
              <span className="text-xs text-slate-400">Expire dans 48h (Dimanche 23:59)</span>
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight text-white mt-1.5">
              Planning du 24 au 30 Août 2026 (4 publications incluses)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-300">Client :</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-xs font-bold text-white border border-slate-700">
              Mamadou Dieng (Marketing) 🇸🇳
            </span>
          </div>
        </div>

        {/* Champ Lien Magique Partagé */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
            Lien Magique Sécurisé (WhatsApp Link)
          </label>

          <div className="flex flex-col sm:flex-row items-stretch gap-2">
            <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-mono text-slate-200 select-all">
              <Lock className="w-3.5 h-3.5 text-[#10B981] shrink-0" />
              <span className="truncate">{magicLink}</span>
            </div>

            <button
              type="button"
              onClick={handleCopyMagicLink}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white text-xs font-extrabold rounded-2xl border border-white/15 flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>Copier le lien</span>
            </button>

            <a
              href="https://wa.me/221778001234?text=Bonjour%20M.%20Dieng%20!%20Voici%20votre%20planning%20de%20la%20semaine%20prochaine%20%C3%A0%20valider%20en%201%20clic%20sur%20votre%20smartphone%20%3A%20https%3A%2F%2Fcmflow.sn%2Fv%2Fteranga-gourmet-a8f9"
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2.5 bg-[#10B981] hover:bg-[#059669] text-white text-xs font-extrabold rounded-2xl shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-1.5 transition-all shrink-0"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Relancer sur WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={handleRevokeSession}
              className="px-3 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-2xl border border-rose-500/30 transition-all shrink-0"
              title="Révoquer l'accès immédiatement"
            >
              Révoquer
            </button>
          </div>
        </div>

        {/* Jauge de Progression des Retours */}
        <div className="space-y-2 pt-2">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="text-slate-300">Progression des validations (4 posts au total) :</span>
            <span className="text-emerald-400 font-mono">3 / 4 Validés (75%)</span>
          </div>

          <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden flex gap-1 p-0.5 border border-slate-700">
            {/* 3 Validés */}
            <div className="h-full bg-[#10B981] rounded-full" style={{ width: '75%' }} title="3 Validés"></div>
            {/* 1 Demande de Retouche */}
            <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }} title="1 Retouche demandée"></div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-medium pt-1">
            <span className="flex items-center gap-1 text-emerald-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span> 3 Publications Validées
            </span>
            <span className="flex items-center gap-1 text-amber-400 font-bold">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span> 1 Retouche Demandée
            </span>
          </div>
        </div>

      </div>

      {/* =======================================================================
          D. JOURNAL DES ÉVÉNEMENTS & RETOURS RÉCENTS (LIVE AUDIT FEED)
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-[#0F172A]">
              Journal des Événements & Retours Récents
            </h2>
            <p className="text-xs text-slate-500">
              Historique en direct des actions effectuées par le client sur son lien magique.
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ⚡ En direct
          </span>
        </div>

        <div className="space-y-3 divide-y divide-slate-100">
          {logs.map((log) => (
            <div key={log.id} className="pt-3 first:pt-0 flex items-start justify-between gap-3 text-xs">
              
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {log.type === 'revision' ? (
                    <div className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                  ) : log.type === 'approved' ? (
                    <div className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  ) : (
                    <div className="w-7 h-7 rounded-xl bg-blue-100 text-[#0066FF] flex items-center justify-center font-bold">
                      <Eye className="w-4 h-4" />
                    </div>
                  )}
                </div>

                <div className="space-y-0.5">
                  <div className="font-extrabold text-[#0F172A]">
                    {log.type === 'revision' && `Demande de modification sur : ${log.postTitle}`}
                    {log.type === 'approved' && `Publication validée : ${log.postTitle}`}
                    {log.type === 'open' && `Lien magique ouvert depuis : ${log.device}`}
                  </div>

                  {log.comment && (
                    <div className="text-xs text-amber-900 bg-amber-50/80 p-2 rounded-xl border border-amber-200/60 font-medium">
                      {log.comment}
                    </div>
                  )}
                </div>
              </div>

              <span className="text-[10px] text-slate-400 font-medium shrink-0">
                {log.time}
              </span>

            </div>
          ))}
        </div>

      </div>

      {/* =======================================================================
          E. HISTORIQUE DES SESSIONS CLÔTURÉES (SESSIONS PASSÉES)
          ======================================================================= */}
      <div className="bg-white/90 backdrop-blur-md p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-black text-[#0F172A]">
              Historique des Sessions Passées & Rapports
            </h2>
            <p className="text-xs text-slate-500">
              Sessions validées à 100% et archivées pour ce workspace.
            </p>
          </div>
        </div>

        <div className="space-y-2.5">
          {PAST_SESSIONS.map((sess) => (
            <div
              key={sess.id}
              className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
            >
              <div className="space-y-0.5">
                <div className="text-xs font-black text-[#0F172A]">
                  {sess.period}
                </div>
                <div className="text-[11px] text-slate-500">
                  {sess.postsCount} publications · Approuvé le {sess.approvedDate} par {sess.approverName}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 border border-emerald-200">
                  ✓ 100% Validé & Publié
                </span>

                <button
                  type="button"
                  onClick={() => showToast('📥 Téléchargement du certificat d\'approbation PDF...')}
                  className="p-1.5 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 shadow-2xs"
                  title="Télécharger le certificat d'approbation"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* =======================================================================
          MODALE NOUVELLE SESSION DE VALIDATION
          ======================================================================= */}
      {isNewSessionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 border border-slate-200 space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-sm font-black text-[#0F172A]">Créer une Session de Validation</h3>
              <button onClick={() => setIsNewSessionModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Période du Planning</label>
                <input type="text" defaultValue="Semaine du 31 Août au 06 Septembre 2026" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold" />
              </div>

              <div>
                <label className="block font-bold uppercase text-slate-700 mb-1">Destinataire WhatsApp</label>
                <input type="text" defaultValue="Mamadou Dieng (+221 77 800 12 34)" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold" />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button onClick={() => setIsNewSessionModalOpen(false)} className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl">
                Annuler
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsNewSessionModalOpen(false);
                  showToast('🚀 Nouvelle session générée et lien WhatsApp créé !');
                }}
                className="px-4 py-2 bg-[#F94F06] hover:bg-[#e04605] text-white text-xs font-black rounded-xl shadow-md shadow-[#F94F06]/25"
              >
                Générer la session
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
