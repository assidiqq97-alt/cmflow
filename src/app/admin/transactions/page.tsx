'use client';

import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Search,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Sparkles,
  Smartphone,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Zap,
} from 'lucide-react';
import AdminHeader from '../../../components/admin/AdminHeader';
import ManualPaymentModal from '../../../components/admin/ManualPaymentModal';
import AdminService from '../../../lib/adminService';
import { AdminTransaction, AdminAgency } from '../../../types/admin';

export default function AdminTransactionsPage() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>(() => AdminService.getTransactions());
  const [agencies, setAgencies] = useState<AdminAgency[]>(() => AdminService.getAgencies());
  const [searchQuery, setSearchQuery] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [isManualPayOpen, setIsManualPayOpen] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 4000);
  };

  const refreshData = () => {
    setTransactions(AdminService.getTransactions());
    setAgencies(AdminService.getAgencies());
  };

  const handleValidateManually = (txId: string) => {
    const res = AdminService.validateTransactionManually(txId);
    if (res.success) {
      showToast(res.message);
      refreshData();
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        !searchQuery ||
        t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.txId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.agencyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.amount.toString().includes(searchQuery);

      const matchesChannel =
        channelFilter === 'all' || t.channel === channelFilter;

      const matchesStatus =
        statusFilter === 'all' || t.status === statusFilter;

      return matchesSearch && matchesChannel && matchesStatus;
    });
  }, [transactions, searchQuery, channelFilter, statusFilter]);

  const totalVolume = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.status === 'succeeded' || t.status === 'manually_validated')
      .reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const exportCSV = () => {
    let csv = 'ID Transaction,Ref,Agence,Proprietaire,Operateur,Montant FCFA,Statut,Date\n';
    filteredTransactions.forEach((t) => {
      csv += `"${t.id}","${t.txId}","${t.agencyName}","${t.ownerName}","${t.channel}",${t.amount},"${t.status}","${new Date(t.createdAt).toISOString()}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cmflow-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    showToast('Journal des transactions exporté en CSV ! 📥');
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
        title="Journal des Transactions & Paiements"
        subtitle="Audit en direct des encaissements Wave, Orange Money et paiements manuels"
        onRefresh={refreshData}
      />

      {/* Modale Paiement Manuel */}
      <ManualPaymentModal
        isOpen={isManualPayOpen}
        agencies={agencies}
        onClose={() => setIsManualPayOpen(false)}
        onSuccess={(tx, msg) => {
          showToast(msg);
          refreshData();
        }}
      />

      <div className="p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
        
        {/* Barre d'outils, Recherche & Filtres */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl p-5 space-y-4">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Recherche */}
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher par référence, agence ou montant..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#F94F06]/20 focus:border-[#F94F06] transition-all"
              />
            </div>

            {/* Actions */}
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
                onClick={() => setIsManualPayOpen(true)}
                className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl shadow-sm flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>+ Enregistrer Paiement Manuel</span>
              </button>
            </div>

          </div>

          {/* Filtres par Passerelle et Statut */}
          <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-400 font-bold mr-1">Opérateur :</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'wave', label: '🌊 Wave (QR / Direct)' },
              { id: 'om', label: '🍊 Orange Money (OTP)' },
              { id: 'manual', label: '💵 Manuel / Espèces' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setChannelFilter(f.id)}
                className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
                  channelFilter === f.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}

            <span className="text-slate-400 font-bold ml-4 mr-1">Statut :</span>
            {[
              { id: 'all', label: 'Tous' },
              { id: 'succeeded', label: '✓ Confirmés' },
              { id: 'pending', label: '⏳ En attente OM' },
              { id: 'failed', label: '✕ Échoués' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 rounded-full font-bold transition-all text-xs ${
                  statusFilter === f.id
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}

            <div className="ml-auto font-mono text-xs font-bold text-slate-900">
              Total : <span className="text-[#F94F06]">{totalVolume.toLocaleString('fr-FR')} FCFA</span>
            </div>
          </div>

        </div>

        {/* Tableau des Transactions */}
        <div className="bg-white border border-slate-200/90 shadow-sm rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Réf. Transaction</th>
                  <th className="py-3.5 px-4">Agence & Responsable</th>
                  <th className="py-3.5 px-4">Opérateur</th>
                  <th className="py-3.5 px-4">Montant Collecté</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4">Date & Heure</th>
                  <th className="py-3.5 px-5 text-right">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-medium">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Aucune transaction trouvée pour ces critères.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => {
                    const methodBadge =
                      tx.channel === 'wave' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#00B2FE]/10 text-[#00B2FE] border border-[#00B2FE]/20 font-bold text-xs">
                          🌊 Wave
                        </span>
                      ) : tx.channel === 'om' ? (
                        <span className="px-2.5 py-0.5 rounded-full bg-[#FF6600]/10 text-[#FF6600] border border-[#FF6600]/20 font-bold text-xs">
                          🍊 Orange Money
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs">
                          💵 Manuel / Cash
                        </span>
                      );

                    return (
                      <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                        
                        <td className="py-4 px-5 font-mono text-slate-500 text-xs">
                          {tx.txId || tx.id}
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            <div className="font-bold text-slate-900 text-sm">{tx.agencyName}</div>
                            <div className="text-slate-400 text-[11px]">{tx.ownerName}</div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          {methodBadge}
                        </td>

                        <td className="py-4 px-4 font-mono font-black text-slate-900 text-sm">
                          {tx.amount.toLocaleString('fr-FR')} FCFA
                        </td>

                        <td className="py-4 px-4">
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

                        <td className="py-4 px-4 text-slate-500">
                          {new Date(tx.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>

                        <td className="py-4 px-5 text-right">
                          {tx.status === 'pending' ? (
                            <button
                              type="button"
                              onClick={() => handleValidateManually(tx.id)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                            >
                              Valider ✓
                            </button>
                          ) : (
                            <span className="text-slate-400 text-xs font-semibold">Vérifié ✓</span>
                          )}
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
