'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  TrendingUp,
  Users,
  CreditCard,
  Building2,
  ArrowUpRight,
  Sparkles,
  Zap,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Download,
  Plus,
  ArrowRight,
  RefreshCw,
  MoreVertical,
  Calendar,
  Trash2,
} from 'lucide-react';
import AdminHeader from '../../components/admin/AdminHeader';
import ManualPaymentModal from '../../components/admin/ManualPaymentModal';
import AddAgencyModal from '../../components/admin/AddAgencyModal';
import ChangePlanModal from '../../components/admin/ChangePlanModal';
import AdminService, { MONTHLY_EVOLUTION } from '../../lib/adminService';
import { AdminFinancialKPIs, AdminAgency, AdminTransaction } from '../../types/admin';

export default function AdminDashboardPage() {
  const [kpis, setKpis] = useState<AdminFinancialKPIs>(() => AdminService.calculateKPIs());
  const [agencies, setAgencies] = useState<AdminAgency[]>(() => AdminService.getAgencies());
  const [transactions, setTransactions] = useState<AdminTransaction[]>(() => AdminService.getTransactions());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modales
  const [isManualPayOpen, setIsManualPayOpen] = useState(false);
  const [isAddAgencyOpen, setIsAddAgencyOpen] = useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [selectedAgencyForPlan, setSelectedAgencyForPlan] = useState<AdminAgency | null>(null);
  const [selectedAgencyForPay, setSelectedAgencyForPay] = useState<string | undefined>();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const refreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setKpis(AdminService.calculateKPIs());
      setAgencies(AdminService.getAgencies());
      setTransactions(AdminService.getTransactions());
      setIsRefreshing(false);
      showToast('Données financières et statistiques actualisées ! 🔄');
    }, 400);
  };

  const handleValidateTx = (txId: string) => {
    const res = AdminService.validateTransactionManually(txId);
    if (res.success) {
      showToast(res.message);
      refreshData();
    }
  };

  const handleOpenChangePlan = (agency: AdminAgency) => {
    setSelectedAgencyForPlan(agency);
    setIsChangePlanOpen(true);
  };

  const handleExtendTrial = (agencyId: string) => {
    const res = AdminService.extendTrial(agencyId, 7);
    if (res.success) {
      showToast(res.message);
      refreshData();
    }
  };

  const handleDeleteAgency = (agency: AdminAgency) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement l'agence "${agency.agencyName}" ?`
      )
    ) {
      const res = AdminService.deleteAgency(agency.id);
      if (res.success) {
        showToast(res.message);
        refreshData();
      }
    }
  };

  const recentTransactions = transactions.slice(0, 6);
  const recentAgencies = agencies.slice(0, 6);

  // Calcul répartition Wave vs Orange Money
  const wavePercent = kpis.wavePercent || 68;
  const omPercent = kpis.omPercent || 32;
  const waveTotal = Math.round((kpis.mrr * wavePercent) / 100);
  const omTotal = Math.round((kpis.mrr * omPercent) / 100);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Toast Flottant */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Admin Épuré */}
      <AdminHeader
        title="Cockpit Financier & Métriques Clés"
        subtitle="Supervision du MRR en FCFA, des flux Wave/OM et des nouveaux forfaits"
        onRefresh={refreshData}
        isRefreshing={isRefreshing}
      />

      {/* Modale Paiement Manuel */}
      <ManualPaymentModal
        isOpen={isManualPayOpen}
        agencies={agencies}
        selectedAgencyId={selectedAgencyForPay}
        onClose={() => setIsManualPayOpen(false)}
        onSuccess={(tx, msg) => {
          showToast(msg);
          refreshData();
        }}
      />

      {/* Modale Ajout Agence */}
      <AddAgencyModal
        isOpen={isAddAgencyOpen}
        onClose={() => setIsAddAgencyOpen(false)}
        onSuccess={(newAgency, msg) => {
          showToast(msg);
          refreshData();
        }}
      />

      {/* Modale Changement Plan */}
      <ChangePlanModal
        isOpen={isChangePlanOpen}
        agency={selectedAgencyForPlan}
        onClose={() => setIsChangePlanOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          refreshData();
        }}
      />

      {/* Corps de Page */}
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-8">
        
        {/* =======================================================================
            1. CARTES DE MÉTRIQUES FINANCIÈRES & KPIS (STYLE LINEAR / STRIPE)
            ======================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* KPI 1 : MRR TOTAL */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                MRR Récurrent
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                +{kpis.mrrGrowthPercent || 14.2}%
              </span>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {kpis.mrr.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-500">FCFA</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Revenu mensuel récurrent prévisionnel
              </p>
            </div>
          </div>

          {/* KPI 2 : AGENCES & CMS ACTIFS */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Agences Actives
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                <Users className="w-3 h-3" />
                +12 ce mois
              </span>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {kpis.activeUsersCount} <span className="text-sm font-bold text-slate-500">Clients</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {kpis.proUsersCount} Pro · {kpis.scaleUsersCount} Scale · {kpis.trialUsersCount} Essais
              </p>
            </div>
          </div>

          {/* KPI 3 : VOLUME MOBILE MONEY */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Collecté Mobile Money
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#00B2FE]" />
                Wave & OM
              </span>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {kpis.totalCollected.toLocaleString('fr-FR')} <span className="text-sm font-bold text-slate-500">FCFA</span>
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                Volume brut cumulé des transactions
              </p>
            </div>
          </div>

          {/* KPI 4 : TAUX DE CONVERSION */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Conversion Essai
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Top 10% SaaS
              </span>
            </div>
            <div>
              <div className="text-2xl lg:text-3xl font-black text-slate-900 font-mono tracking-tight">
                {kpis.conversionRate}%
              </div>
              <p className="text-xs text-slate-500 mt-1 font-medium">
                {kpis.trialUsersCount} utilisateurs en période d'essai 14j
              </p>
            </div>
          </div>

        </div>

        {/* =======================================================================
            2. GRAPHIQUE ÉPURÉ DU MRR + RÉPARTITION VISUELLE WAVE VS ORANGE MONEY
            ======================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* GAUCHE (2 cols) : Graphique Évolution Mensuelle du MRR */}
          <div className="lg:col-span-2 bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#F94F06]" />
                  <span>Évolution Mensuelle du MRR (2026)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Croissance nette des abonnements payants en Afrique de l'Ouest
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                  Total : 3 345 000 FCFA
                </span>
              </div>
            </div>

            {/* Barres d'évolution mensuelle */}
            <div className="pt-2">
              <div className="grid grid-cols-8 gap-2 sm:gap-4 items-end h-48">
                {MONTHLY_EVOLUTION.map((item, idx) => {
                  const maxMrr = 3500000;
                  const heightPercent = Math.max(15, Math.round((item.mrr / maxMrr) * 100));
                  const isLatest = idx === MONTHLY_EVOLUTION.length - 1;

                  return (
                    <div key={item.month} className="flex flex-col items-center gap-2 group h-full justify-end">
                      <div className="text-[10px] font-bold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity font-mono text-center">
                        {(item.mrr / 1000).toFixed(0)}k
                      </div>
                      <div className="w-full bg-slate-100 rounded-xl overflow-hidden flex flex-col justify-end p-1 hover:bg-slate-200/60 transition-colors">
                        <div
                          style={{ height: `${heightPercent}%` }}
                          className={`w-full rounded-lg transition-all ${
                            isLatest
                              ? 'bg-gradient-to-t from-[#F94F06] to-amber-400 shadow-md shadow-orange-500/25'
                              : 'bg-slate-700 group-hover:bg-slate-900'
                          }`}
                        />
                      </div>
                      <span className={`text-[11px] font-bold ${isLatest ? 'text-[#F94F06]' : 'text-slate-500'}`}>
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* DROITE (1 col) : Répartition Wave vs Orange Money */}
          <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-6 space-y-6 flex flex-col justify-between">
            <div>
              <div className="border-b border-slate-100 pb-4">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-blue-500" />
                  <span>Répartition Mobile Money</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Part de marché par passerelle de paiement
                </p>
              </div>

              <div className="space-y-5 mt-5">
                
                {/* Jauge Wave */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <div className="w-3 h-3 rounded-full bg-[#00B2FE]" />
                      <span>Wave (QR Code & Direct)</span>
                    </div>
                    <span className="font-mono text-slate-900">{wavePercent}% ({waveTotal.toLocaleString('fr-FR')} F)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${wavePercent}%` }}
                      className="h-full bg-[#00B2FE] rounded-full transition-all"
                    />
                  </div>
                </div>

                {/* Jauge Orange Money */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <div className="flex items-center gap-2 text-slate-800">
                      <div className="w-3 h-3 rounded-full bg-[#FF6600]" />
                      <span>Orange Money (OTP / USSD)</span>
                    </div>
                    <span className="font-mono text-slate-900">{omPercent}% ({omTotal.toLocaleString('fr-FR')} F)</span>
                  </div>
                  <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${omPercent}%` }}
                      className="h-full bg-[#FF6600] rounded-full transition-all"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Boutons d'Actions Rapides Fondateur */}
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2.5">
              <button
                type="button"
                onClick={() => setIsManualPayOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>Enregistrer un Paiement Manuel</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddAgencyOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-orange-50 hover:bg-orange-100 text-[#F94F06] border border-orange-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
              >
                <Building2 className="w-4 h-4" />
                <span>+ Ajouter une Agence Manuellement</span>
              </button>
            </div>

          </div>

        </div>

        {/* =======================================================================
            3. TABLEAU DES AGENCES & CMS (STYLE LINEAR / STRIPE)
            ======================================================================= */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#F94F06]" />
                <span>Dernières Agences & Community Managers</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Surveillance des forfaits actifs, espaces clients et renouvellements
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/agencies"
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Voir tout ({agencies.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">Agence / CM</th>
                  <th className="py-3 px-5">Forfait SaaS</th>
                  <th className="py-3 px-5">Tarif Mensuel</th>
                  <th className="py-3 px-5">Workspaces</th>
                  <th className="py-3 px-5">Statut</th>
                  <th className="py-3 px-5 text-right">Actions Rapides</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {recentAgencies.map((agency) => {
                  const planBadgeClass =
                    agency.plan === 'scale'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : agency.plan === 'pro'
                      ? 'bg-orange-50 text-[#F94F06] border-orange-200'
                      : agency.plan === 'solo'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200';

                  const statusBadgeClass =
                    agency.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : agency.status === 'trial'
                      ? 'bg-amber-50 text-amber-700 border-amber-200'
                      : 'bg-rose-50 text-rose-700 border-rose-200';

                  return (
                    <tr key={agency.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {agency.agencyName.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{agency.agencyName}</div>
                            <div className="text-slate-500 text-[11px]">{agency.ownerName} · {agency.phone}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${planBadgeClass}`}>
                          {agency.planName}
                        </span>
                      </td>

                      <td className="py-4 px-5 font-mono font-bold text-slate-900">
                        {agency.priceMonthly > 0 ? `${agency.priceMonthly.toLocaleString('fr-FR')} F` : 'Gratuit'}
                      </td>

                      <td className="py-4 px-5 font-medium text-slate-700">
                        {agency.workspacesCount} / {agency.workspacesMax >= 999 ? '∞' : agency.workspacesMax} marques
                      </td>

                      <td className="py-4 px-5">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                          {agency.status === 'active' ? '✓ Actif' : agency.status === 'trial' ? '⏳ Essai 14j' : 'Suspendu'}
                        </span>
                      </td>

                      <td className="py-4 px-5 text-right relative">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleExtendTrial(agency.id)}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                            title="Prolonger l'essai de 7 jours"
                          >
                            +7j Essai
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenChangePlan(agency)}
                            className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#F94F06] text-xs font-semibold transition-colors border border-orange-200"
                            title="Changer de formule SaaS"
                          >
                            Changer Plan
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteAgency(agency)}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Supprimer définitivement l'agence"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* =======================================================================
            4. TABLEAU DES DERNIÈRES TRANSACTIONS MOBILE MONEY
            ======================================================================= */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-emerald-500" />
                <span>Flux de Paiements & Transactions Récentes</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Historique des encaissements Wave, Orange Money et espèces
              </p>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin/transactions"
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-all flex items-center gap-1.5"
              >
                <span>Toutes les transactions</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-5">ID Transaction</th>
                  <th className="py-3 px-5">Agence / CM</th>
                  <th className="py-3 px-5">Méthode</th>
                  <th className="py-3 px-5">Montant Net</th>
                  <th className="py-3 px-5">Statut</th>
                  <th className="py-3 px-5">Date & Heure</th>
                  <th className="py-3 px-5 text-right">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {recentTransactions.map((tx) => {
                  const methodBadge =
                    tx.channel === 'wave' ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#00B2FE]/10 text-[#00B2FE] border border-[#00B2FE]/20 font-bold text-xs">
                        Wave
                      </span>
                    ) : tx.channel === 'om' ? (
                      <span className="px-2 py-0.5 rounded-md bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 font-bold text-xs">
                        Orange Money
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 font-bold text-xs">
                        Manuel / Cash
                      </span>
                    );

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-4 px-5 font-mono text-slate-500 text-[11px]">
                        {tx.txId || tx.id}
                      </td>

                      <td className="py-4 px-5 font-bold text-slate-900">
                        {tx.agencyName}
                      </td>

                      <td className="py-4 px-5">
                        {methodBadge}
                      </td>

                      <td className="py-4 px-5 font-mono font-black text-slate-900">
                        {tx.amount.toLocaleString('fr-FR')} FCFA
                      </td>

                      <td className="py-4 px-5">
                        {tx.status === 'succeeded' || tx.status === 'manually_validated' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            ✓ Confirmé
                          </span>
                        ) : tx.status === 'pending' ? (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            ⏳ En attente
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            ✕ Échoué
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-5 text-slate-500">
                        {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>

                      <td className="py-4 px-5 text-right">
                        {tx.status === 'pending' ? (
                          <button
                            type="button"
                            onClick={() => handleValidateTx(tx.id)}
                            className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                          >
                            Valider ✓
                          </button>
                        ) : (
                          <span className="text-slate-400 text-xs">Vérifié ✓</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
