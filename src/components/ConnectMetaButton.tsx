'use client';

import React, { useState } from 'react';
import { Instagram, Facebook, CheckCircle2, Loader2, RefreshCw, CheckCheck, Plus } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';

interface ConnectMetaButtonProps {
  workspaceId?: string;
  variant?: 'card' | 'button' | 'compact';
  onConnect?: () => void;
}

export default function ConnectMetaButton({
  workspaceId,
  variant = 'card',
  onConnect,
}: ConnectMetaButtonProps) {
  const { activeWorkspace } = useWorkspace();
  const [isLoading, setIsLoading] = useState(false);

  const targetWorkspaceId = workspaceId || activeWorkspace?.id || 'teranga-gourmet';
  const isConnected = activeWorkspace?.networks?.instagram?.connected || activeWorkspace?.networks?.facebook?.connected || (activeWorkspace as any)?.socialMetrics?.instagram?.connected;
  const igFollowers = activeWorkspace?.networks?.instagram?.followers || (activeWorkspace as any)?.socialMetrics?.instagram?.followers || '34.2K';
  const igEngagement = activeWorkspace?.networks?.instagram?.engagement || (activeWorkspace as any)?.socialMetrics?.instagram?.engagement || '6.2%';
  const igUsername = activeWorkspace?.slug ? `@${activeWorkspace.slug}` : '@terangagourmet_sn';

  const handleConnect = () => {
    setIsLoading(true);
    if (onConnect) onConnect();

    // Redirection vers la route OAuth Next.js
    const loginUrl = `/api/auth/meta/login?workspaceId=${encodeURIComponent(targetWorkspaceId)}`;
    window.location.href = loginUrl;
  };

  // Variante Bouton Simple
  if (variant === 'button') {
    return (
      <button
        type="button"
        onClick={handleConnect}
        disabled={isLoading}
        className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
            <span>Connexion...</span>
          </>
        ) : isConnected ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Re-synchroniser Meta</span>
          </>
        ) : (
          <>
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>Connecter Meta</span>
          </>
        )}
      </button>
    );
  }

  // Variante Carte Dribbble / Linear Style
  return (
    <div className="p-5 rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="flex items-start gap-4">
        {/* Pastille Dégradé Subtil Meta */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-blue-500/10 border border-slate-200 flex items-center justify-center text-pink-600 shrink-0">
          <div className="flex items-center -space-x-1">
            <Instagram className="w-5 h-5 text-[#E1306C]" />
            <Facebook className="w-5 h-5 text-[#1877F2]" />
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">
              Meta Graph API (Instagram Pro & Facebook Pages)
            </h3>
            {isConnected ? (
              <span className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Connecté (Token 60j)</span>
              </span>
            ) : (
              <span className="bg-slate-100 text-slate-600 border border-slate-200 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                Non configuré
              </span>
            )}
          </div>

          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Publication automatique des Reels, Stories, carrousels et lecture des Insights d'audience.
          </p>

          {isConnected && (
            <div className="flex items-center gap-2 mt-2 text-xs text-slate-500 font-medium">
              <span className="text-slate-800 font-semibold">{igUsername}</span>
              <span>•</span>
              <span>{igFollowers} abonnés</span>
              <span>•</span>
              <span className="text-emerald-600 font-semibold">{igEngagement} engagement</span>
            </div>
          )}
        </div>
      </div>

      {/* Bouton d'action */}
      <div className="shrink-0 self-start md:self-center">
        <button
          type="button"
          onClick={handleConnect}
          disabled={isLoading}
          className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center gap-2 hover:border-slate-300 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-500" />
              <span>Connexion...</span>
            </>
          ) : isConnected ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
              <span>Re-synchroniser Meta</span>
            </>
          ) : (
            <>
              <Plus className="w-3.5 h-3.5 text-slate-500" />
              <span>Connecter mes comptes</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
