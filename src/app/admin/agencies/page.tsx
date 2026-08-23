'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Download,
  Building2,
  Phone,
  Mail,
  Clock,
  Sparkles,
  Shield,
  Trash2,
  CheckCircle2,
  Ban,
  MessageSquare,
  ExternalLink,
  ChevronDown,
  Layers,
  Zap,
} from 'lucide-react';
import AdminHeader from '../../../components/admin/AdminHeader';
import AddAgencyModal from '../../../components/admin/AddAgencyModal';
import ChangePlanModal from '../../../components/admin/ChangePlanModal';
import ManualPaymentModal from '../../../components/admin/ManualPaymentModal';
import AdminService from '../../../lib/adminService';
import { AdminAgency } from '../../../types/admin';

export default function AdminAgenciesPage() {
  const [agencies, setAgencies] = useState<AdminAgency[]>(() => AdminService.getAgencies());
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Modales
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false);
  const [selectedAgencyForPlan, setSelectedAgencyForPlan] = useState<AdminAgency | null>(null);
  const [isManualPayOpen, setIsManualPayOpen] = useState(false);
  const [selectedAgencyForPay, setSelectedAgencyForPay] = useState<string | undefined>();

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const refreshAgencies = () => {
    setAgencies(AdminService.getAgencies());
  };

  const handleToggleStatus = (agency: AdminAgency) => {
    const res = AdminService.toggleStatus(agency.id);
    if (res.success) {
      showToast(res.message);
      refreshAgencies();
    }
  };

  const handleExtendTrial = (agencyId: string, days: number = 7) => {
    const res = AdminService.extendTrial(agencyId, days);
    if (res.success) {
      showToast(res.message);
      refreshAgencies();
    }
  };

  const handleDeleteAgency = (agency: AdminAgency) => {
    if (
      window.confirm(
        `Êtes-vous sûr de vouloir supprimer définitivement le compte de l'agence "${agency.agencyName}" (${agency.email}) ?`
      )
    ) {
      const res = AdminService.deleteAgency(agency.id);
      if (res.success) {
        showToast(res.message);
        refreshAgencies();
      }
    }
  };

  const handleOpenChangePlan = (agency: AdminAgency) => {
    setSelectedAgencyForPlan(agency);
    setIsChangePlanOpen(true);
  };

  const handleOpenManualPay = (agencyId: string) => {
    setSelectedAgencyForPay(agencyId);
    setIsManualPayOpen(true);
  };

  const filteredAgencies = useMemo(() => {
    return agencies.filter((a) => {
      const matchesSearch =
        !searchQuery ||
        a.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.phone.replace(/[^0-9]/g, '').includes(searchQuery.replace(/[^0-9]/g, ''));

      const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
      const matchesPlan = planFilter === 'all' || a.plan === planFilter;

      return matchesSearch && matchesStatus && matchesPlan;
    });
  }, [agencies, searchQuery, statusFilter, planFilter]);

  const exportCSV = () => {
    let csv =
      'Nom Agence,Propriétaire,Email,Telephone WhatsApp,Forfait,Prix Mensuel,Workspaces Utilises,Workspaces Max,Statut,Inscription\n';
    filteredAgencies.forEach((a) => {
      csv += `"${a.agencyName}","${a.ownerName}","${a.email}","${a.phone}","${a.planName}",${a.priceMonthly},${a.workspacesCount},${a.workspacesMax},"${a.status}","${new Date(a.createdAt).toLocaleDateString('fr-FR')}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cmflow-agencies-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Fichier CSV des agences téléchargé avec succès ! 📥');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      
      {/* Toast Flottant */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-slate-800 text-xs sm:text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5">
          <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <AdminHeader
        title="Gestion des Agences & Utilisateurs"
        subtitle="Contrôle des forfaits, quotas de marques clientes et actions administratives"
        onRefresh={refreshAgencies}
      />

      {/* Modales */}
      <AddAgencyModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={(newAgency, msg) => {
          showToast(msg);
          refreshAgencies();
        }}
      />

      <ChangePlanModal
        isOpen={isChangePlanOpen}
        agency={selectedAgencyForPlan}
        onClose={() => setIsChangePlanOpen(false)}
        onSuccess={(msg) => {
          showToast(msg);
          refreshAgencies();
        }}
      />

      <ManualPaymentModal
        isOpen={isManualPayOpen}
        agencies={agencies}
        selectedAgencyId={selectedAgencyForPay}
        onClose={() => setIsManualPayOpen(false)}
        onSuccess={(tx, msg) => {
          showToast(msg);
          refreshAgencies();
        }}
      />

      {/* Contenu */}
      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Barre d'outils, Recherche & Filtres */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Barre de Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par nom d'agence, gérant, email ou WhatsApp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
              />
            </div>

            {/* Boutons d'Action Header */}
            <div className="flex items-center gap-3 flex-wrap">
              <button
                type="button"
                onClick={exportCSV}
                className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 shadow-xs flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-[#F94F06] hover:bg-[#e04605] text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/25 flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Ajouter une Agence / CM</span>
              </button>
            </div>

          </div>

          {/* Filtres par Statut et Forfait */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-bold mr-1">Statut :</span>
            {[
              { id: 'all', label: 'Tous les statuts' },
              { id: 'active', label: '✓ Actifs' },
              { id: 'trial', label: '⏳ Essais 14j' },
              { id: 'expired', label: '⛔ Expirés' },
              { id: 'suspended', label: '🚫 Suspendus' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
                  statusFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}

            <span className="text-slate-400 font-bold ml-4 mr-1">Forfait :</span>
            {[
              { id: 'all', label: 'Tous forfaits' },
              { id: 'solo', label: 'Solo (3 500 F)' },
              { id: 'pro', label: 'Pro (15 000 F)' },
              { id: 'scale', label: 'Scale (35 000 F)' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setPlanFilter(f.id)}
                className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
                  planFilter === f.id
                    ? 'bg-[#F94F06] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}

            <span className="ml-auto text-slate-400 font-mono text-[11px] font-semibold">
              {filteredAgencies.length} agence{filteredAgencies.length > 1 ? 's' : ''}
            </span>
          </div>

        </div>

        {/* Tableau CRM Complet */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Agence & Responsable</th>
                  <th className="py-3.5 px-4">Contact WhatsApp / Email</th>
                  <th className="py-3.5 px-4">Forfait Actif</th>
                  <th className="py-3.5 px-4">Marques Clientes</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-5 text-right">Actions Super-Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredAgencies.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400">
                      Aucune agence trouvée pour ces critères de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredAgencies.map((agency) => {
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
                        
                        {/* Agence & Nom */}
                        <td className="py-4 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-xs shrink-0 shadow-xs">
                              {agency.agencyName.charAt(0)}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 text-sm">
                                {agency.agencyName}
                              </div>
                              <div className="text-slate-500 text-[11px]">
                                {agency.ownerName}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
                              <span>📱</span>
                              <span>{agency.phone}</span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {agency.email}
                            </div>
                          </div>
                        </td>

                        {/* Forfait */}
                        <td className="py-4 px-4">
                          <div className="space-y-1">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${planBadgeClass}`}>
                              {agency.planName}
                            </span>
                            <div className="text-[11px] font-mono font-bold text-slate-600">
                              {agency.priceMonthly > 0 ? `${agency.priceMonthly.toLocaleString('fr-FR')} FCFA/m` : '0 FCFA (Essai)'}
                            </div>
                          </div>
                        </td>

                        {/* Quotas */}
                        <td className="py-4 px-4 font-semibold text-slate-700">
                          {agency.workspacesCount} / {agency.workspacesMax >= 999 ? '∞' : agency.workspacesMax} marques
                        </td>

                        {/* Statut */}
                        <td className="py-4 px-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${statusBadgeClass}`}>
                            {agency.status === 'active' ? '✓ Actif' : agency.status === 'trial' ? '⏳ Essai 14j' : 'Suspendu'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            <button
                              type="button"
                              onClick={() => handleExtendTrial(agency.id, 7)}
                              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors"
                              title="Prolonger l'essai de 7 jours"
                            >
                              +7j Essai
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenChangePlan(agency)}
                              className="px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-[#F94F06] border border-orange-200 text-xs font-bold transition-colors"
                              title="Changer de formule SaaS"
                            >
                              Changer Plan
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenManualPay(agency.id)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-500 transition-colors"
                              title="Enregistrer un paiement"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleToggleStatus(agency)}
                              className={`p-1.5 rounded-lg transition-colors ${
                                agency.status === 'suspended'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-500'
                              }`}
                              title={agency.status === 'suspended' ? 'Réactiver le compte' : 'Suspendre le compte'}
                            >
                              <Ban className="w-3.5 h-3.5" />
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
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
}
