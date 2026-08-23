'use client';

import React from 'react';
import { Briefcase, TrendingUp } from 'lucide-react';

interface WorkspaceCounterProps {
  used: number;
  max: number; // 999 = illimité
  planName?: string;
  onUpgradeClick?: () => void;
  compact?: boolean; // mode sidebar compact
}

export function WorkspaceCounter({
  used,
  max,
  planName,
  onUpgradeClick,
  compact = false,
}: WorkspaceCounterProps) {
  const isUnlimited = max >= 999;
  const percent = isUnlimited ? 0 : Math.round((used / max) * 100);
  const isNearLimit = !isUnlimited && percent >= 80;
  const isAtLimit = !isUnlimited && used >= max;

  if (compact) {
    // Version mini pour la sidebar
    return (
      <div className="px-3 py-2">
        <div className="flex items-center justify-between text-[10px] font-bold mb-1.5">
          <span className="flex items-center gap-1 text-slate-400">
            <Briefcase className="w-3 h-3" />
            <span>Workspaces</span>
          </span>
          <span
            className={`font-black ${
              isAtLimit
                ? 'text-rose-400'
                : isNearLimit
                ? 'text-amber-400'
                : 'text-emerald-400'
            }`}
          >
            {used} / {isUnlimited ? '∞' : max}
          </span>
        </div>

        {!isUnlimited && (
          <div className="w-full h-1.5 bg-slate-700 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isAtLimit
                  ? 'bg-rose-500'
                  : isNearLimit
                  ? 'bg-amber-400'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
        )}

        {isAtLimit && onUpgradeClick && (
          <button
            onClick={onUpgradeClick}
            className="mt-1.5 w-full text-[9px] font-black text-[#F94F06] hover:underline text-left flex items-center gap-1"
          >
            <TrendingUp className="w-2.5 h-2.5" />
            Augmenter ma limite →
          </button>
        )}
      </div>
    );
  }

  // Version complète (ex: page dashboard principale)
  return (
    <div
      className={`rounded-2xl p-4 border ${
        isAtLimit
          ? 'bg-rose-50 border-rose-200'
          : isNearLimit
          ? 'bg-amber-50 border-amber-200'
          : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isAtLimit
                ? 'bg-rose-100 text-rose-600'
                : isNearLimit
                ? 'bg-amber-100 text-amber-600'
                : 'bg-slate-100 text-slate-600'
            }`}
          >
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-black text-slate-800">Workspaces Clients</div>
            {planName && (
              <div className="text-[10px] text-slate-500 font-semibold">
                Forfait {planName}
              </div>
            )}
          </div>
        </div>
        <div
          className={`text-xl font-black ${
            isAtLimit ? 'text-rose-600' : isNearLimit ? 'text-amber-600' : 'text-slate-800'
          }`}
        >
          {used}
          <span className="text-slate-400 font-semibold text-sm">
            {' '}/{isUnlimited ? ' ∞' : ` ${max}`}
          </span>
        </div>
      </div>

      {!isUnlimited && (
        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-2">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              isAtLimit
                ? 'bg-rose-500'
                : isNearLimit
                ? 'bg-amber-400'
                : 'bg-emerald-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      )}

      {isAtLimit && (
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-rose-600 font-semibold">
            Limite atteinte — passez au forfait supérieur pour continuer.
          </p>
          {onUpgradeClick && (
            <button
              onClick={onUpgradeClick}
              className="ml-3 shrink-0 px-3 py-1.5 bg-[#F94F06] text-white text-[11px] font-black rounded-xl hover:bg-[#e04605] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <TrendingUp className="w-3 h-3" />
              Passer à Pro
            </button>
          )}
        </div>
      )}

      {isNearLimit && !isAtLimit && (
        <p className="text-[11px] text-amber-700 font-semibold mt-1">
          Attention — il vous reste {max - used} workspace{max - used > 1 ? 's' : ''} disponible{max - used > 1 ? 's' : ''}.
        </p>
      )}
    </div>
  );
}

export default WorkspaceCounter;
