'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  X,
  Volume2,
  VolumeX,
  Sparkles,
  ExternalLink,
  MessageSquare,
  PartyPopper
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useWorkspace } from '../context/WorkspaceContext';

export interface ActivityNotification {
  id: string;
  workspaceId?: string;
  workspaceName?: string;
  type: 'POST_APPROVED' | 'POST_REVISION' | string;
  action: 'APPROVED' | 'CHANGES_REQUESTED' | string;
  postId?: string;
  postCaption?: string;
  comment?: string;
  message?: string;
  createdAt?: string;
}

/**
 * Génère un son de carillon feutré et moderne via la Web Audio API
 */
function playChimeSound(type: 'APPROVED' | 'CHANGES_REQUESTED' = 'APPROVED') {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    const now = ctx.currentTime;

    if (type === 'APPROVED') {
      // Accord majeur scintillant (Do - Mi - Sol)
      const freqs = [523.25, 659.25, 783.99];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);

        gain.gain.setValueAtTime(0, now + idx * 0.08);
        gain.gain.linearRampToValueAtTime(0.12, now + idx * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.5);
      });
    } else {
      // Double ton doux d'avertissement feutré
      const freqs = [440, 392];
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0, now + idx * 0.12);
        gain.gain.linearRampToValueAtTime(0.1, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.12 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.4);
      });
    }
  } catch (audioErr) {
    // Les navigateurs peuvent restreindre l'AudioContext avant toute interaction
    console.debug('Audio notification not allowed or supported:', audioErr);
  }
}

export function RealtimeListener() {
  const { activeWorkspace } = useWorkspace();
  const [activeNotification, setActiveNotification] = useState<ActivityNotification | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const isInitialMount = useRef(true);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Charger la préférence de son depuis localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cmflow_sound_enabled');
      if (saved !== null) {
        setSoundEnabled(saved === 'true');
      }
    }
  }, []);

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('cmflow_sound_enabled', String(next));
    }
  };

  const dismissNotification = () => {
    setActiveNotification(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  // Déclenchement de la notification avec son et auto-dismiss
  const showNotification = (notif: ActivityNotification) => {
    setActiveNotification(notif);

    if (soundEnabled) {
      playChimeSound(notif.action === 'APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED');
    }

    // Émission d'un événement global pour mettre à jour les KPIs et les calendriers
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('cmflow:activity', {
          detail: notif,
        })
      );
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setActiveNotification(null);
    }, 6000);
  };

  // 1. Écouteur Firestore onSnapshot
  useEffect(() => {
    if (!db) return;

    try {
      const targetCollection = collection(db, 'activityLogs');
      const q = query(targetCollection, orderBy('timestamp', 'desc'), limit(1));

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
          }

          snapshot.docChanges().forEach((change) => {
            if (change.type === 'added') {
              const data = change.doc.data() as any;
              const notif: ActivityNotification = {
                id: change.doc.id,
                workspaceId: data.workspaceId,
                workspaceName: data.workspaceName || 'Client',
                type: data.type || 'POST_APPROVED',
                action: data.action || (data.type === 'POST_APPROVED' ? 'APPROVED' : 'CHANGES_REQUESTED'),
                postId: data.postId,
                postCaption: data.postCaption,
                comment: data.comment,
                message: data.message,
                createdAt: data.createdAt,
              };

              showNotification(notif);
            }
          });
        },
        (error) => {
          console.warn('⚠️ Écouteur Firestore désactivé ou hors-ligne :', error);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('⚠️ Erreur initialisation onSnapshot RealtimeListener :', e);
    }
  }, [activeWorkspace?.id, soundEnabled]);

  // 2. Écouteur pour simulation / déclenchement via CustomEvent direct
  useEffect(() => {
    const handleCustomTrigger = (e: any) => {
      if (e.detail) {
        showNotification(e.detail);
      }
    };

    window.addEventListener('cmflow:trigger-notification' as any, handleCustomTrigger);
    return () => {
      window.removeEventListener('cmflow:trigger-notification' as any, handleCustomTrigger);
    };
  }, [soundEnabled]);

  if (!activeNotification) return null;

  const isApproved = activeNotification.action === 'APPROVED';

  return (
    <div className="fixed top-5 right-5 z-50 max-w-sm w-full animate-in slide-in-from-top-4 fade-in duration-300">
      <div className="bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-[0_12px_40px_-8px_rgba(15,23,42,0.15)] p-4 overflow-hidden relative">
        
        {/* Ligne de Progression Temporelle */}
        <div
          className={`absolute bottom-0 left-0 h-1 transition-all duration-[6000ms] ease-linear ${
            isApproved ? 'bg-emerald-500' : 'bg-[#F94F06]'
          }`}
          style={{ width: '100%' }}
        />

        <div className="flex items-start gap-3.5">
          {/* Badge Icône */}
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
              isApproved
                ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/80 ring-4 ring-emerald-50/50'
                : 'bg-orange-50 text-[#F94F06] border border-orange-200/80 ring-4 ring-orange-50/50'
            }`}
          >
            {isApproved ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
          </div>

          {/* Contenu de la Notification */}
          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  isApproved
                    ? 'bg-emerald-100/80 text-emerald-800'
                    : 'bg-orange-100/80 text-orange-900'
                }`}
              >
                {isApproved ? 'Publication Validée !' : 'Demande de Retouche'}
              </span>

              <span className="text-[10px] text-slate-400 font-medium">À l'instant</span>
            </div>

            <h4 className="text-xs font-bold text-slate-900 truncate">
              {activeNotification.workspaceName || 'Client'}
            </h4>

            {activeNotification.comment ? (
              <p className="text-xs text-slate-600 line-clamp-2 mt-1 italic bg-slate-50 p-1.5 rounded-lg border border-slate-100">
                "{activeNotification.comment}"
              </p>
            ) : (
              <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                {activeNotification.postCaption || 'Planning approuvé sans retouche 🚀'}
              </p>
            )}
          </div>

          {/* Actions : Bouton Son & Fermeture */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={dismissNotification}
              className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={toggleSound}
              className={`p-1 rounded-lg text-[10px] transition-colors cursor-pointer ${
                soundEnabled ? 'text-slate-400 hover:text-slate-700' : 'text-slate-300'
              }`}
              title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RealtimeListener;
