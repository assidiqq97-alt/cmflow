'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Plus, Sparkles, Building2, Shield } from 'lucide-react';
import { useWorkspace, Workspace } from '../context/WorkspaceContext';

interface WorkspaceSelectorProps {
  variant?: 'topbar' | 'sidebar' | 'compact';
  className?: string;
}

export default function WorkspaceSelector({ variant = 'topbar', className = '' }: WorkspaceSelectorProps) {
  const { workspaces, activeWorkspace, setActiveWorkspace } = useWorkspace();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermeture au clic à l'extérieur ou touche Echap
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (ws: Workspace) => {
    setActiveWorkspace(ws);
    setIsOpen(false);
  };

  if (variant === 'sidebar') {
    return (
      <div ref={dropdownRef} className={`relative select-none ${className}`}>
        <div className="text-[9px] font-extrabold uppercase text-slate-400 px-2 mb-1.5 flex items-center justify-between tracking-wider">
          <span>Espace Client Actif</span>
          <span className="text-emerald-400 flex items-center gap-1 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 transition-all text-left group shadow-xs cursor-pointer"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="relative shrink-0">
              <img
                src={activeWorkspace?.avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'}
                alt={activeWorkspace?.name || 'Workspace'}
                className="w-8 h-8 rounded-xl object-cover ring-2 ring-[#0066FF]/40"
              />
              <span className="absolute -bottom-1 -right-1 text-[10px] leading-none bg-slate-900 rounded-full px-0.5 py-0.5 border border-slate-700">
                {activeWorkspace?.flag || '🇸🇳'}
              </span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-bold text-white truncate group-hover:text-sky-300 transition-colors">
                {activeWorkspace?.name}
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {activeWorkspace?.industry || activeWorkspace?.category}
              </div>
            </div>
          </div>
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 shrink-0 ${
              isOpen ? 'rotate-180 text-white' : ''
            }`}
          />
        </button>

        {/* Dropdown Panel Sidebar */}
        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-3xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 flex items-center justify-between">
              <span>Changer de Workspace</span>
              <span className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                {workspaces.length} marques
              </span>
            </div>

            <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
              {workspaces.map((ws) => {
                const isActive = ws.id === activeWorkspace?.id;
                return (
                  <div
                    key={ws.id}
                    onClick={() => handleSelect(ws)}
                    className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                      isActive
                        ? 'bg-gradient-to-r from-orange-500/25 to-orange-500/10 border border-[#F94F06]/40 text-white shadow-xs'
                        : 'hover:bg-slate-800/80 text-slate-300 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <img src={ws.avatar} alt={ws.name} className="w-7 h-7 rounded-lg object-cover" />
                        <span className="absolute -bottom-1 -right-1 text-[9px] leading-none">{ws.flag}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate flex items-center gap-1">
                          <span className="truncate">{ws.name}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">{ws.industry}</div>
                      </div>
                    </div>
                    {isActive ? (
                      <span className="w-5 h-5 rounded-full bg-[#F94F06] text-white flex items-center justify-center text-[10px] font-black shrink-0">
                        ✓
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-500 font-bold px-1.5 py-0.5 rounded-md bg-slate-800/60 shrink-0">
                        {ws.globalMetrics.totalAudience}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-800 mt-1.5 pt-1.5">
              <button
                type="button"
                className="w-full text-xs font-semibold text-[#F94F06] hover:bg-orange-500/10 p-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
                onClick={() => {
                  alert('Modal de création de marque client');
                  setIsOpen(false);
                }}
              >
                <Plus className="w-4 h-4" />
                <span>+ Ajouter une nouvelle marque</span>
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Variant Topbar (Dribbble / Raycast Floating Pill)
  return (
    <div ref={dropdownRef} className={`relative select-none ${className}`}>
      {/* Trigger Button Pilule Flottante */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="bg-white/90 hover:bg-white backdrop-blur-md border border-slate-200/80 px-3.5 py-2 rounded-2xl shadow-[0_2px_10px_-2px_rgba(15,23,42,0.05)] hover:shadow-md transition-all duration-200 flex items-center gap-3 cursor-pointer select-none group"
      >
        <div className="relative shrink-0">
          <img
            src={activeWorkspace?.avatar || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80'}
            alt={activeWorkspace?.name || 'Workspace'}
            className="w-7 h-7 rounded-xl object-cover ring-2 ring-slate-100"
          />
          <span className="absolute -bottom-1 -right-1 text-[10px] leading-none bg-white rounded-full px-0.5 border border-slate-100 shadow-2xs">
            {activeWorkspace?.flag || '🇸🇳'}
          </span>
        </div>

        <div className="text-left hidden sm:block min-w-0 max-w-[150px]">
          <div className="text-xs font-bold text-[#0F172A] tracking-tight truncate flex items-center gap-1.5">
            <span className="truncate">{activeWorkspace?.name}</span>
          </div>
          <div className="text-[10px] text-slate-400 truncate flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.7)]"></span>
            <span className="truncate">{activeWorkspace?.plan} Plan</span>
          </div>
        </div>

        <ChevronDown
          className={`w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-transform duration-200 shrink-0 ${
            isOpen ? 'rotate-180 text-[#F94F06]' : ''
          }`}
        />
      </button>

      {/* Menu Déroulant Glassmorphism */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2.5 bg-white/95 backdrop-blur-xl border border-slate-200/80 rounded-3xl shadow-[0_20px_50px_-12px_rgba(15,23,42,0.15)] p-2 min-w-[300px] sm:min-w-[320px] z-50 animate-in fade-in zoom-in-95 duration-150 space-y-1">
          
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 py-1.5 flex items-center justify-between">
            <span>Changer de Workspace</span>
            <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
              {workspaces.length} marques gérées
            </span>
          </div>

          <div className="max-h-64 overflow-y-auto space-y-1.5 pr-0.5">
            {workspaces.map((ws) => {
              const isActive = ws.id === activeWorkspace?.id;
              return (
                <div
                  key={ws.id}
                  onClick={() => handleSelect(ws)}
                  className={`flex items-center justify-between p-2.5 rounded-2xl cursor-pointer transition-all duration-150 ${
                    isActive
                      ? 'bg-orange-50/90 border border-orange-200/70 shadow-xs'
                      : 'hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="relative shrink-0">
                      <img
                        src={ws.avatar}
                        alt={ws.name}
                        className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100"
                      />
                      <span className="absolute -bottom-1 -right-1 text-[11px] leading-none bg-white rounded-full px-0.5 border border-slate-100">
                        {ws.flag}
                      </span>
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-bold text-[#0F172A] truncate flex items-center gap-1.5">
                        <span className="truncate">{ws.name}</span>
                        {isActive && (
                          <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded-md bg-[#F94F06]/10 text-[#F94F06]">
                            Actif
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">
                        {ws.industry}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold mt-0.5 flex items-center gap-1">
                        <span>👥 {ws.globalMetrics.totalAudience}</span>
                        <span>•</span>
                        <span>👁️ {ws.globalMetrics.totalImpressions}</span>
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 ml-2">
                    {isActive ? (
                      <div className="w-6 h-6 rounded-full bg-[#F94F06] text-white flex items-center justify-center shadow-sm">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center text-xs font-bold group-hover:bg-slate-200">
                        →
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="border-t border-slate-100 mt-1.5 pt-1.5">
            <button
              type="button"
              className="w-full text-xs font-semibold text-[#F94F06] hover:bg-orange-50/70 p-2.5 rounded-xl flex items-center gap-2 transition-colors cursor-pointer"
              onClick={() => {
                alert('Ajout d\'une nouvelle marque client');
                setIsOpen(false);
              }}
            >
              <div className="w-5 h-5 rounded-lg bg-orange-100 text-[#F94F06] flex items-center justify-center font-black">
                +
              </div>
              <span>Ajouter une nouvelle marque</span>
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
