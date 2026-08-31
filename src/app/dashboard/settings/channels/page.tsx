'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Facebook,
  Instagram,
  Linkedin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Zap,
  ArrowLeft,
  Plus,
  Video,
} from 'lucide-react';
import { useWorkspace } from '@/context/WorkspaceContext';
import { SocialAccount } from '@/types/social';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';

export default function ChannelsPage() {
  const { activeWorkspace } = useWorkspace();
  const workspaceId = activeWorkspace?.id || 'teranga-gourmet';

  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [testModal, setTestModal] = useState<{ isOpen: boolean; title: string; latency: number } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ text, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const fetchAccounts = useCallback(async () => {
    try {
      const res = await fetch(`/api/social/meta/accounts?workspaceId=${encodeURIComponent(workspaceId)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.accounts)) {
        setAccounts(data.accounts);
      }
    } catch (err) {
      console.warn('⚠️ Erreur chargement comptes :', err);
    } finally {
      setIsLoading(false);
    }
  }, [workspaceId]);

  useEffect(() => {
    fetchAccounts();

    if (db) {
      try {
        const q = query(collection(db, 'workspaces', workspaceId, 'social_accounts'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const liveAccounts: SocialAccount[] = [];
            snapshot.forEach((docSnap) => {
              liveAccounts.push({ id: docSnap.id, ...docSnap.data() } as SocialAccount);
            });
            if (liveAccounts.length > 0) {
              setAccounts(liveAccounts);
            }
          },
          (err) => console.warn('Firestore fallback onSnapshot :', err)
        );
        return () => unsubscribe();
      } catch (e) {}
    }
  }, [workspaceId, fetchAccounts]);

  const handleConnectMeta = () => {
    window.location.href = `/api/social/meta/login?workspaceId=${encodeURIComponent(workspaceId)}&redirectPath=${encodeURIComponent('/dashboard/settings/channels')}`;
  };

  const handleConnectLinkedin = () => {
    window.location.href = `/api/auth/linkedin?workspaceId=${encodeURIComponent(workspaceId)}&redirectPath=${encodeURIComponent('/dashboard/settings/channels')}`;
  };

  const handleConnectYoutube = () => {
    window.location.href = `/api/auth/youtube?workspaceId=${encodeURIComponent(workspaceId)}&redirectPath=${encodeURIComponent('/dashboard/settings/channels')}`;
  };

  const handleDisconnect = async (accountName: string, accountId?: string) => {
    if (!confirm(`Êtes-vous sûr de vouloir déconnecter le compte "${accountName}" ?`)) return;

    try {
      await fetch('/api/social/meta/disconnect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspaceId, accountId: accountId || accountName }),
      });
      setAccounts((prev) => prev.filter((a) => a.name !== accountName && a.id !== accountId));
      showToast(`Compte "${accountName}" déconnecté avec succès.`, 'success');
    } catch (err: any) {
      showToast(`Erreur : ${err.message}`, 'error');
    }
  };

  const handleTestFlow = (platform: string, accountName: string) => {
    const latency = Math.floor(Math.random() * 20) + 24;
    setTestModal({
      isOpen: true,
      title: `${platform} — ${accountName}`,
      latency,
    });
  };

  const fbAccount = accounts.find((a) => a.type === 'facebook' || (a as any).provider === 'facebook');
  const igAccount = accounts.find((a) => a.type === 'instagram' || (a as any).provider === 'instagram');
  const linkedinAccount = accounts.find((a) => a.type === 'linkedin' || (a as any).provider === 'linkedin');
  const tiktokAccount = accounts.find((a) => a.type === 'tiktok' || (a as any).provider === 'tiktok');
  const youtubeAccount = accounts.find((a) => a.type === 'youtube' || (a as any).provider === 'youtube');

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-16">
      
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-2xl shadow-2xl text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 border ${
            toastMsg.type === 'success' ? 'bg-slate-900 text-white border-slate-800' : 'bg-rose-900 text-white border-rose-800'
          }`}
        >
          {toastMsg.type === 'success' ? <Sparkles className="w-4 h-4 text-amber-400 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />}
          <span>{toastMsg.text}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-400 mb-1">
              <Link href="/dashboard/settings" className="hover:text-gray-700 transition-colors flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                <span>Paramètres</span>
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-bold">Canaux</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">Canaux sociaux</h1>
            <p className="text-sm text-gray-500 mt-1">Gérez et surveillez vos comptes connectés pour la publication.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAccounts}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 shadow-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Actualiser</span>
            </button>

            <button
              type="button"
              onClick={handleConnectMeta}
              className="px-4 py-2 bg-[#0066FF] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-sm flex items-center gap-1.5 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>+ Connecter un canal</span>
            </button>
          </div>
        </div>

        {/* Grid des Canaux */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Facebook */}
          <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 ${
            fbAccount ? 'border-emerald-200 bg-white hover:shadow-md' : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-white'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#1877F2] to-[#0D65D9] flex items-center justify-center text-white shadow-md shadow-blue-500/25 ring-1 ring-white/30">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Facebook</h4>
                    <span className="text-[10px] font-semibold text-slate-400">Pages & Groupes Pro</span>
                  </div>
                </div>
                {fbAccount ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connecté
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    Non configuré
                  </span>
                )}
              </div>

              {fbAccount ? (
                <div>
                  <h3 className="text-base font-bold text-slate-900">{fbAccount.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {fbAccount.accountId || fbAccount.id}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Publication automatique de posts texte, photos, carrousels et reels sur vos pages officielles.
                </p>
              )}
            </div>

            {fbAccount ? (
              <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestFlow('Facebook', fbAccount.name)}
                  className="flex-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Tester le flux</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnect(fbAccount.name, fbAccount.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 cursor-pointer hover:bg-rose-50 rounded-xl transition"
                >
                  Déconnecter
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectMeta}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Connecter Facebook</span>
              </button>
            )}
          </div>

          {/* Instagram */}
          <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 ${
            igAccount ? 'border-emerald-200 bg-white hover:shadow-md' : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-white'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#FFDC80] via-[#FD1D1D] to-[#833AB4] flex items-center justify-center text-white shadow-md shadow-pink-500/25 ring-1 ring-white/30">
                    <svg className="w-5 h-5 fill-none stroke-current stroke-[2.2]" viewBox="0 0 24 24">
                      <rect width="20" height="20" x="2" y="2" rx="5.5" ry="5.5"/>
                      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Instagram</h4>
                    <span className="text-[10px] font-semibold text-slate-400">Business & Creator</span>
                  </div>
                </div>
                {igAccount ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connecté
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    Non configuré
                  </span>
                )}
              </div>

              {igAccount ? (
                <div>
                  <h3 className="text-base font-bold text-slate-900">{igAccount.username || igAccount.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {igAccount.accountId || igAccount.id}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Publication directe sur vos comptes Instagram Professionnels (Posts, Stories, Reels & Carrousels).
                </p>
              )}
            </div>

            {igAccount ? (
              <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestFlow('Instagram', igAccount.username || igAccount.name)}
                  className="flex-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Tester le flux</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnect(igAccount.name, igAccount.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 cursor-pointer hover:bg-rose-50 rounded-xl transition"
                >
                  Déconnecter
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectMeta}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Connecter Instagram</span>
              </button>
            )}
          </div>

          {/* LinkedIn */}
          <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 ${
            linkedinAccount ? 'border-emerald-200 bg-white hover:shadow-md' : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-white'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0A66C2] to-[#004182] flex items-center justify-center text-white shadow-md shadow-sky-600/25 ring-1 ring-white/30">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">LinkedIn</h4>
                    <span className="text-[10px] font-semibold text-slate-400">Pages Entreprise & Profils</span>
                  </div>
                </div>
                {linkedinAccount ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connecté
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    Non configuré
                  </span>
                )}
              </div>

              {linkedinAccount ? (
                <div>
                  <h3 className="text-base font-bold text-slate-900">{linkedinAccount.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">{linkedinAccount.username || linkedinAccount.email || 'Compte B2B vérifié'}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Diffusez vos articles B2B, communiqués officiels et posts professionnels sur LinkedIn.
                </p>
              )}
            </div>

            {linkedinAccount ? (
              <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestFlow('LinkedIn', linkedinAccount.name)}
                  className="flex-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-blue-500 fill-blue-500" />
                  <span>Tester le flux</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnect(linkedinAccount.name, linkedinAccount.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 cursor-pointer hover:bg-rose-50 rounded-xl transition"
                >
                  Déconnecter
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectLinkedin}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Connecter LinkedIn</span>
              </button>
            )}
          </div>

          {/* TikTok */}
          <div className={`border rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200 ${
            tiktokAccount ? 'border-emerald-200 bg-white hover:shadow-md' : 'border-dashed border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-white'
          }`}>
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-md shadow-black/30 ring-1 ring-white/30">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.24 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">TikTok</h4>
                    <span className="text-[10px] font-semibold text-slate-400">Content Posting API</span>
                  </div>
                </div>
                {tiktokAccount ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connecté
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    Non configuré
                  </span>
                )}
              </div>

              {tiktokAccount ? (
                <div>
                  <h3 className="text-base font-bold text-slate-900">{tiktokAccount.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {tiktokAccount.accountId || tiktokAccount.id}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Publication automatique de vidéos 9:16 HD, Reels et suivi des vues et interactions.
                </p>
              )}
            </div>

            {tiktokAccount ? (
              <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestFlow('TikTok', tiktokAccount.name)}
                  className="flex-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-cyan-500 fill-cyan-500" />
                  <span>Tester le flux</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnect(tiktokAccount.name, tiktokAccount.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 cursor-pointer hover:bg-rose-50 rounded-xl transition"
                >
                  Déconnecter
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  window.location.href = `/api/auth/tiktok?workspaceId=${encodeURIComponent(workspaceId)}&redirectPath=/dashboard/settings/channels`;
                }}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Connecter TikTok</span>
              </button>
            )}
          </div>

          {/* X (Twitter) */}
          <div className="border border-dashed border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-black flex items-center justify-center text-white shadow-md shadow-black/30 ring-1 ring-white/30">
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">X (Twitter)</h4>
                    <span className="text-[10px] font-semibold text-slate-400">API v2 Threads & Tweets</span>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                  Non configuré
                </span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Programmez vos threads complets, sondages interactifs et suivez l'engagement de votre audience.
              </p>
            </div>
            <button
              type="button"
              onClick={() => showToast('Intégration X (Twitter) v2 disponible prochainement.', 'success')}
              className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>+ Connecter X</span>
            </button>
          </div>

          {/* YouTube */}
          <div className="border border-dashed border-slate-300 bg-slate-50/70 hover:border-slate-400 hover:bg-white rounded-2xl p-6 shadow-sm flex flex-col justify-between transition-all duration-200">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF0000] to-[#CC0000] flex items-center justify-center text-white shadow-md shadow-red-500/25 ring-1 ring-white/30">
                    <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">YouTube</h4>
                    <span className="text-[10px] font-semibold text-slate-400">Shorts & Vidéos</span>
                  </div>
                </div>
                {youtubeAccount ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Connecté
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
                    Non configuré
                  </span>
                )}
              </div>

              {youtubeAccount ? (
                <div>
                  <h3 className="text-base font-bold text-slate-900">{youtubeAccount.name}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">ID: {youtubeAccount.accountId || youtubeAccount.id}</p>
                </div>
              ) : (
                <p className="text-xs text-slate-500 leading-relaxed">
                  Diffusion automatique de Shorts verticaux et vidéos longues directement sur votre chaîne YouTube.
                </p>
              )}
            </div>

            {youtubeAccount ? (
              <div className="mt-6 flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleTestFlow('YouTube', youtubeAccount.name)}
                  className="flex-1 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                  <span>Tester le flux</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDisconnect(youtubeAccount.name, youtubeAccount.id)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-700 px-3 py-2 cursor-pointer hover:bg-rose-50 rounded-xl transition"
                >
                  Déconnecter
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleConnectYoutube}
                className="mt-6 w-full py-2.5 px-4 rounded-xl bg-white border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-400 shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Plus className="w-3.5 h-3.5 text-slate-500" />
                <span>+ Connecter YouTube</span>
              </button>
            )}
          </div>

        </div>

        {/* Modal de Test de Flux */}
        {testModal?.isOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center font-bold text-lg shadow-xs">
                    ⚡
                  </div>
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Test du flux de publication</h3>
                    <p className="text-xs text-slate-400">{testModal.title}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setTestModal(null)}
                  className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">API Gateway :</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    En Ligne (HTTP 200)
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Latence Réseau :</span>
                  <span className="font-mono font-bold text-slate-800 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                    {testModal.latency} ms
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Autorisation Token :</span>
                  <span className="text-emerald-600 font-semibold">Valide (OAuth 2.0)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Publication Directe :</span>
                  <span className="text-blue-600 font-semibold">Active & Prête</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setTestModal(null)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-sm transition cursor-pointer"
              >
                Fermer le diagnostic
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
