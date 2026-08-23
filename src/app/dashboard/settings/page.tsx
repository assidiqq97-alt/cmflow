'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Building2,
  Link2,
  MessageSquare,
  Users,
  ShieldCheck,
  Save,
  Check,
  Sparkles,
  Upload,
  RefreshCw,
  Plus,
  Trash2,
  Lock,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Globe,
  Key,
  Laptop,
  Copy,
  ExternalLink,
  ChevronRight,
  Sliders,
  Send,
  Instagram,
  Facebook,
  Linkedin,
  Clock,
  ShieldAlert,
  Unlink,
  CheckCheck
} from 'lucide-react';
import { useWorkspace } from '../../../context/WorkspaceContext';

// Types
export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'Admin / Owner' | 'Lead CM' | 'Graphiste UI' | 'Client Success';
  avatar: string;
  status: 'active' | 'invited';
}

const INITIAL_TEAM: TeamMember[] = [
  {
    id: 'team-1',
    name: 'Awa Diop',
    email: 'awa@cmflow.sn',
    role: 'Lead CM',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'team-2',
    name: 'Sidiqq Ndiaye',
    email: 'sidiqq@kitsunestudio.sn',
    role: 'Admin / Owner',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    status: 'active',
  },
  {
    id: 'team-3',
    name: 'Koffi Kouamé',
    email: 'koffi@crea.sn',
    role: 'Graphiste UI',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    status: 'active',
  },
];

export default function SettingsPage() {
  const { activeWorkspace } = useWorkspace();

  // Onglet Actif
  const [activeTab, setActiveTab] = useState<'profile' | 'api' | 'whatsapp' | 'team' | 'security'>('profile');

  // Formulaire Profil Agence
  const [agencyName, setAgencyName] = useState('Kitsune Studio · Dakar');
  const [agencyEmail, setAgencyEmail] = useState('contact@kitsunestudio.sn');
  const [agencyPhone, setAgencyPhone] = useState('+221 77 800 12 34');
  const [customDomain, setCustomDomain] = useState('validation.kitsunestudio.sn');
  const [whiteLabelEnabled, setWhiteLabelEnabled] = useState(true);

  // WhatsApp Templates
  const [waSenderPhone, setWaSenderPhone] = useState('+221 77 800 12 34');
  const [template1, setTemplate1] = useState('Bonjour {client_name} ! 🌟 Votre planning hebdomadaire est prêt pour validation sur votre mobile en 1 clic sans mot de passe : {validation_link} (Lien actif 48h)');
  const [template2, setTemplate2] = useState('Rappel amical pour {client_name} ⏰ Votre session de validation expire dans {expiration_time}. Accédez-y ici : {validation_link}');
  const [template3, setTemplate3] = useState('Parfait ! Merci {client_name} 🎉 Toutes vos publications sont validées et programmées sur vos réseaux.');

  // Équipe
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(INITIAL_TEAM);
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberRole, setNewMemberRole] = useState<'Lead CM' | 'Graphiste UI'>('Lead CM');

  // Sécurité
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Détection du retour Meta OAuth Callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const status = urlParams.get('status');
      const tab = urlParams.get('tab');
      const igUser = urlParams.get('ig');

      if (tab === 'social' || tab === 'api') {
        setActiveTab('api');
      }

      if (status === 'connected') {
        showToast(`🎉 Comptes Meta (${igUser ? `@${igUser}` : 'Instagram & Facebook'}) connectés avec succès !`);
      } else if (status === 'error') {
        const reason = urlParams.get('reason') || 'Erreur inconnue';
        showToast(`⚠️ Échec de la connexion Meta : ${reason}`);
      }
    }
  }, []);

  const handleSaveSettings = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    showToast('💾 Modifications enregistrées avec succès pour l\'agence !');
  };

  const handleInviteMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberEmail) return;
    const newMember: TeamMember = {
      id: `team-${Date.now()}`,
      name: newMemberEmail.split('@')[0],
      email: newMemberEmail,
      role: newMemberRole,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      status: 'invited',
    };
    setTeamMembers([...teamMembers, newMember]);
    setNewMemberEmail('');
    showToast(`📩 Invitation envoyée à ${newMember.email} !`);
  };

  const currentWorkspaceName = activeWorkspace?.name || 'Teranga Gourmet';
  const currentWorkspaceFlag = activeWorkspace?.flag || '🇸🇳';
  const currentIgFollowers = activeWorkspace?.networks?.instagram?.followers || activeWorkspace?.socialMetrics?.instagram?.followers || '34.2K';
  const currentIgEngagement = activeWorkspace?.networks?.instagram?.engagement || activeWorkspace?.socialMetrics?.instagram?.engagement || '6.2%';
  const currentIgUsername = activeWorkspace?.slug ? `@${activeWorkspace.slug}` : '@terangagourmet_sn';

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
          1. EN-TÊTE ÉPURÉ SANS CHEVAUCHEMENT (Dribbble / Linear Style)
          ======================================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          {/* Fil d'Ariane discret */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 mb-1.5">
            <span>CMFlow</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-600 font-medium">Paramètres Agence</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-[#0F172A]">
            Paramètres Généraux de l'Agence
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Configurez votre identité, vos intégrations réseaux sociaux, l'API WhatsApp et votre équipe.
          </p>
        </div>

        {/* Bouton Enregistrer Principal */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleSaveSettings()}
            className="bg-[#F94F06] hover:bg-[#e04605] text-white px-5 py-2.5 rounded-2xl font-medium shadow-md shadow-orange-500/20 active:scale-[0.98] transition-all duration-200 flex items-center gap-2 text-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Enregistrer les modifications</span>
          </button>
        </div>
      </div>

      {/* =======================================================================
          2. REFONTE DE LA BARRE D'ONGLETS (MODERN SEGMENTED PILLS)
          ======================================================================= */}
      <div className="bg-slate-200/60 p-1.5 rounded-2xl flex items-center gap-1.5 w-fit border border-slate-200/80 overflow-x-auto max-w-full">
        
        {/* Onglet 1 : Profil Agence */}
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-white text-[#0F172A] shadow-sm border border-slate-200/60 font-bold'
              : 'font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Building2 className={`w-3.5 h-3.5 ${activeTab === 'profile' ? 'text-[#F94F06]' : 'text-slate-500'}`} />
          <span>Profil Agence & Marque Blanche</span>
        </button>



        {/* Onglet 3 : WhatsApp */}
        <button
          type="button"
          onClick={() => setActiveTab('whatsapp')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'whatsapp'
              ? 'bg-white text-[#0F172A] shadow-sm border border-slate-200/60 font-bold'
              : 'font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <MessageSquare className={`w-3.5 h-3.5 ${activeTab === 'whatsapp' ? 'text-[#10B981]' : 'text-slate-500'}`} />
          <span>Configuration WhatsApp & Modèles</span>
        </button>

        {/* Onglet 4 : Équipe */}
        <button
          type="button"
          onClick={() => setActiveTab('team')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'team'
              ? 'bg-white text-[#0F172A] shadow-sm border border-slate-200/60 font-bold'
              : 'font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <Users className={`w-3.5 h-3.5 ${activeTab === 'team' ? 'text-purple-600' : 'text-slate-500'}`} />
          <span>Équipe & Rôles ({teamMembers.length})</span>
        </button>

        {/* Onglet 5 : Sécurité */}
        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'security'
              ? 'bg-white text-[#0F172A] shadow-sm border border-slate-200/60 font-bold'
              : 'font-semibold text-slate-600 hover:text-slate-900 hover:bg-white/50'
          }`}
        >
          <ShieldCheck className={`w-3.5 h-3.5 ${activeTab === 'security' ? 'text-emerald-600' : 'text-slate-500'}`} />
          <span>Sécurité & Accès</span>
        </button>
      </div>

      {/* =======================================================================
          3. CONTENU DES ONGLETS (BENTO CARDS PREMIER CHOIX)
          ======================================================================= */}

      {/* ---------------------------------------------------------------------
          ONGLET 1 : PROFIL AGENCE & MARQUE BLANCHE
          --------------------------------------------------------------------- */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/70 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] p-6 md:p-8 space-y-6">
            
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Identité de l'Agence & Marque Blanche
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Ce logo et ce nom sont affichés sur les portails mobiles WhatsApp et les rapports PDF envoyés à vos clients.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 self-start sm:self-auto">
                ✓ Marque Blanche Activée
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              
              {/* Téléversement Logo */}
              <div className="p-5 rounded-2xl bg-slate-50/60 border border-slate-200/80 space-y-3 text-center">
                <label className="block text-xs font-bold uppercase text-slate-500 tracking-wider">
                  Logo de l'Agence
                </label>

                <div className="w-24 h-24 mx-auto rounded-2xl bg-gradient-to-tr from-[#0F172A] to-slate-800 text-white flex items-center justify-center font-black text-xl shadow-md border-2 border-white">
                  KS
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => showToast('🖼️ Sélecteur de fichier ouvert...')}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 shadow-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#F94F06]" />
                    <span>Changer le logo</span>
                  </button>
                </div>
                <p className="text-[10px] text-slate-400">PNG ou SVG transparent (Recommandé : 400x400px)</p>
              </div>

              {/* Champs Formulaire */}
              <div className="lg:col-span-2 space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 uppercase tracking-wider mb-1.5">
                    Nom Commercial de l'Agence
                  </label>
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-700 uppercase tracking-wider mb-1.5">
                      Email de Contact Officiel
                    </label>
                    <input
                      type="email"
                      value={agencyEmail}
                      onChange={(e) => setAgencyEmail(e.target.value)}
                      className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 uppercase tracking-wider mb-1.5">
                      Téléphone & Ligne WhatsApp Agence
                    </label>
                    <input
                      type="text"
                      value={agencyPhone}
                      onChange={(e) => setAgencyPhone(e.target.value)}
                      className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-slate-700 uppercase tracking-wider mb-1.5">
                    Domaine Personnalisé CNAME (Option Pro Agency)
                  </label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-3 text-slate-400 text-xs">https://</span>
                      <input
                        type="text"
                        value={customDomain}
                        onChange={(e) => setCustomDomain(e.target.value)}
                        className="w-full pl-16 pr-3 py-2.5 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-mono text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => showToast('🔗 Test DNS réussi : validation.kitsunestudio.sn pointe vers CMFlow.')}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl border border-slate-200 transition-all cursor-pointer shrink-0"
                    >
                      Tester DNS
                    </button>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      )}



      {/* ---------------------------------------------------------------------
          ONGLET 3 : CONFIGURATION WHATSAPP & MODÈLES
          --------------------------------------------------------------------- */}
      {activeTab === 'whatsapp' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/70 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] p-6 md:p-8 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Passerelle WhatsApp & Modèles de Relance
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Personnalisez les messages automatiques envoyés à vos clients lors de la soumission de plannings.
              </p>
            </div>

            <div className="space-y-4 text-xs font-semibold">
              <div>
                <label className="block text-slate-700 uppercase tracking-wider mb-1.5">
                  Ligne Émettrice WhatsApp Officielle
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    value={waSenderPhone}
                    onChange={(e) => setWaSenderPhone(e.target.value)}
                    className="w-full max-w-sm p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                  />
                  <span className="px-3 py-2 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 rounded-xl text-xs font-bold flex items-center gap-1.5">
                    <CheckCheck className="w-4 h-4" />
                    Connecté API WhatsApp Cloud
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-slate-700 uppercase tracking-wider mb-1">
                    Modèle 1 : Envoi Initial du Planning
                  </label>
                  <textarea
                    rows={2}
                    value={template1}
                    onChange={(e) => setTemplate1(e.target.value)}
                    className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 uppercase tracking-wider mb-1">
                    Modèle 2 : Relance avant Expiration (H-12)
                  </label>
                  <textarea
                    rows={2}
                    value={template2}
                    onChange={(e) => setTemplate2(e.target.value)}
                    className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 uppercase tracking-wider mb-1">
                    Modèle 3 : Confirmation de Validation Intégrale
                  </label>
                  <textarea
                    rows={2}
                    value={template3}
                    onChange={(e) => setTemplate3(e.target.value)}
                    className="w-full p-3 bg-slate-50/70 border border-slate-200 rounded-xl text-slate-900 font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
                  />
                </div>
              </div>

            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          ONGLET 4 : ÉQUIPE & RÔLES
          --------------------------------------------------------------------- */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/70 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] p-6 md:p-8 space-y-6">
            
            <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                  Collaborateurs & Gestion des Rôles
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Gérez les accès de vos Community Managers, graphistes et responsables de comptes.
                </p>
              </div>

              <form onSubmit={handleInviteMember} className="flex items-center gap-2">
                <input
                  type="email"
                  placeholder="nom@agence.com"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#F94F06] hover:bg-[#e04605] text-white text-xs font-semibold rounded-xl shadow-xs transition-all cursor-pointer shrink-0"
                >
                  + Inviter
                </button>
              </form>
            </div>

            <div className="space-y-2">
              {teamMembers.map((member) => (
                <div
                  key={member.id}
                  className="p-3.5 rounded-2xl bg-slate-50/60 border border-slate-200/80 flex items-center justify-between gap-3 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-white shadow-xs"
                    />
                    <div>
                      <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
                        <span>{member.name}</span>
                        {member.role === 'Admin / Owner' && (
                          <span className="text-[10px] bg-amber-500/10 text-amber-600 border border-amber-500/20 font-bold px-2 py-0.2 rounded-full">
                            Owner
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {member.email} · <strong className="text-slate-700 font-semibold">{member.role}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                      ✓ Actif
                    </span>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

      {/* ---------------------------------------------------------------------
          ONGLET 5 : SÉCURITÉ & ACCÈS
          --------------------------------------------------------------------- */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/70 rounded-3xl shadow-[0_4px_20px_-4px_rgba(15,23,42,0.05)] p-6 md:p-8 space-y-6">
            
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-base sm:text-lg font-bold text-[#0F172A]">
                Sécurité & Double Authentification (2FA)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Protégez l'accès à vos données d'agence et aux identifiants sociaux de vos clients.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Double Authentification (SMS & Authenticator)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Exige un code de confirmation lors des connexions depuis un nouvel appareil.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setTwoFactorEnabled(!twoFactorEnabled);
                    showToast(twoFactorEnabled ? '2FA désactivée' : '2FA activée avec succès');
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    twoFactorEnabled
                      ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {twoFactorEnabled ? '✓ Activée' : 'Désactivée'}
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/60 border border-slate-200/80 flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-900">
                    Durée de validité des Liens Magiques WhatsApp
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Les liens expirent automatiquement pour garantir la fraîcheur des contenus.
                  </p>
                </div>
                <span className="px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-bold text-xs">
                  48 Heures (Défaut)
                </span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
