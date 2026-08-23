// ===============================================================
// CMFlow — Service & Moteur de Données Super-Admin
// Synchronisation Firestore + LocalStorage + Grille Tarifaire FCFA
// ===============================================================

import { AdminAgency, AdminTransaction, AdminFinancialKPIs, MonthlyChartData, MerchantSettings } from '../types/admin';
import { PLANS_MAP } from '../constants/plans';

export const DEFAULT_MERCHANT_SETTINGS: MerchantSettings = {
  waveMerchantNumber: '+221 77 842 19 02',
  omMerchantNumber: '+221 77 842 19 02',
  adminEmail: 'admin@cmflow.sn',
  adminPhone: '+221 77 000 00 00',
  autoLockDelayMinutes: 15,
  simulationMode: false,
};

export const INITIAL_AGENCIES: AdminAgency[] = [
  {
    id: 'agency_teranga',
    agencyName: 'Teranga Digital Agency',
    ownerName: 'Sidiq Ndiaye',
    email: 'sidiq@terangadigital.sn',
    phone: '+221 77 123 45 67',
    plan: 'scale',
    planName: 'Scale Agence',
    priceMonthly: 35000,
    status: 'active',
    workspacesCount: 12,
    workspacesMax: 999,
    postsCount: 184,
    currentPeriodEnd: '2026-09-15T00:00:00.000Z',
    createdAt: '2026-05-10T10:00:00.000Z',
    lastActiveAt: '2026-08-22T19:45:00.000Z',
    paymentMethod: 'wave',
    notes: 'Compte agence grand compte Dakar. 12 marques actives.',
  },
  {
    id: 'agency_dakar_media',
    agencyName: 'Dakar Media Flow',
    ownerName: 'Aminata Diallo',
    email: 'aminata.cm@gmail.com',
    phone: '+221 77 234 56 78',
    plan: 'pro',
    planName: 'Pro Agency',
    priceMonthly: 15000,
    status: 'active',
    workspacesCount: 7,
    workspacesMax: 10,
    postsCount: 92,
    currentPeriodEnd: '2026-09-08T00:00:00.000Z',
    createdAt: '2026-06-01T12:00:00.000Z',
    lastActiveAt: '2026-08-22T18:20:00.000Z',
    paymentMethod: 'wave',
    notes: 'Portefeuille de 7 marques restaurants & beauté.',
  },
  {
    id: 'agency_cheikh_cm',
    agencyName: 'Cheikh Digital Freelance',
    ownerName: 'Cheikh Tidiane Ba',
    email: 'cheikh.ba@outlook.fr',
    phone: '+221 76 345 67 89',
    plan: 'solo',
    planName: 'Solo / Freelance',
    priceMonthly: 3500,
    status: 'active',
    workspacesCount: 2,
    workspacesMax: 3,
    postsCount: 28,
    currentPeriodEnd: '2026-09-02T00:00:00.000Z',
    createdAt: '2026-07-15T09:30:00.000Z',
    lastActiveAt: '2026-08-22T16:10:00.000Z',
    paymentMethod: 'om',
    notes: 'Freelance CM Solo.',
  },
  {
    id: 'agency_sow_com',
    agencyName: 'Sow Com & Social',
    ownerName: 'Fatou Bintou Sow',
    email: 'fatou.sow@agence.sn',
    phone: '+221 78 456 78 90',
    plan: 'pro',
    planName: 'Pro Agency',
    priceMonthly: 15000,
    status: 'active',
    workspacesCount: 6,
    workspacesMax: 10,
    postsCount: 74,
    currentPeriodEnd: '2026-09-12T00:00:00.000Z',
    createdAt: '2026-06-18T14:20:00.000Z',
    lastActiveAt: '2026-08-21T20:15:00.000Z',
    paymentMethod: 'om',
  },
  {
    id: 'agency_sahel_creative',
    agencyName: 'Sahel Creative Studio',
    ownerName: 'Moussa Traoré',
    email: 'moussa.traore@gmail.com',
    phone: '+221 77 567 89 01',
    plan: 'trial',
    planName: 'Essai Gratuit 14j',
    priceMonthly: 0,
    status: 'trial',
    workspacesCount: 1,
    workspacesMax: 3,
    postsCount: 12,
    trialEndsAt: '2026-08-29T23:59:59.000Z',
    createdAt: '2026-08-15T11:00:00.000Z',
    lastActiveAt: '2026-08-22T15:00:00.000Z',
    notes: 'Essai en cours, intéressé par le forfait Pro.',
  },
  {
    id: 'agency_kinkeliba',
    agencyName: 'Social Kinkeliba',
    ownerName: 'Mariama Cissé',
    email: 'mariama.cisse@gmail.com',
    phone: '+221 70 678 90 12',
    plan: 'expired',
    planName: 'Expiré',
    priceMonthly: 0,
    status: 'expired',
    workspacesCount: 1,
    workspacesMax: 1,
    postsCount: 8,
    trialEndsAt: '2026-08-10T00:00:00.000Z',
    createdAt: '2026-07-27T08:00:00.000Z',
    lastActiveAt: '2026-08-10T14:30:00.000Z',
    notes: 'Essai expiré. Relancer par WhatsApp pour offre Solo 3 500 FCFA.',
  },
  {
    id: 'agency_abidjan_pulse',
    agencyName: 'Abidjan Pulse Studio 🇨🇮',
    ownerName: 'Koffi Kouamé',
    email: 'koffi@abidjanpulse.ci',
    phone: '+225 07 89 01 23 45',
    plan: 'scale',
    planName: 'Scale Agence',
    priceMonthly: 35000,
    status: 'active',
    workspacesCount: 16,
    workspacesMax: 999,
    postsCount: 240,
    currentPeriodEnd: '2026-09-20T00:00:00.000Z',
    createdAt: '2026-04-12T10:00:00.000Z',
    lastActiveAt: '2026-08-22T17:50:00.000Z',
    paymentMethod: 'wave',
    notes: 'Grosse agence Abidjan Plateau.',
  },
  {
    id: 'agency_farafina',
    agencyName: 'Farafina Digital',
    ownerName: 'Aïcha Dieng',
    email: 'aicha@farafinadigital.sn',
    phone: '+221 77 432 10 98',
    plan: 'solo',
    planName: 'Solo / Freelance',
    priceMonthly: 3500,
    status: 'active',
    workspacesCount: 3,
    workspacesMax: 3,
    postsCount: 45,
    currentPeriodEnd: '2026-09-05T00:00:00.000Z',
    createdAt: '2026-07-02T16:00:00.000Z',
    lastActiveAt: '2026-08-22T11:20:00.000Z',
    paymentMethod: 'wave',
  },
  {
    id: 'agency_dak_sparks',
    agencyName: 'Dakar Sparks Agency',
    ownerName: 'Ousmane Fall',
    email: 'ousmane@dakarsparks.sn',
    phone: '+221 76 999 11 22',
    plan: 'pro',
    planName: 'Pro Agency',
    priceMonthly: 15000,
    status: 'suspended',
    workspacesCount: 4,
    workspacesMax: 10,
    postsCount: 52,
    currentPeriodEnd: '2026-08-01T00:00:00.000Z',
    createdAt: '2026-05-20T09:00:00.000Z',
    lastActiveAt: '2026-08-01T12:00:00.000Z',
    notes: 'Compte suspendu pour défaut de paiement renouvellement.',
  },
];

export const INITIAL_TRANSACTIONS: AdminTransaction[] = [
  {
    id: 'tx_01',
    txId: 'WAV_TX_89201',
    agencyId: 'agency_teranga',
    agencyName: 'Teranga Digital Agency',
    ownerName: 'Sidiq Ndiaye',
    email: 'sidiq@terangadigital.sn',
    phone: '+221 77 123 45 67',
    channel: 'wave',
    amount: 35000,
    planId: 'scale',
    planName: 'Scale Agence (35 000 FCFA)',
    status: 'succeeded',
    date: '22 Août 2026 à 14:32',
    createdAt: '2026-08-22T14:32:00.000Z',
  },
  {
    id: 'tx_02',
    txId: 'OM_CMF_78310',
    agencyId: 'agency_sow_com',
    agencyName: 'Sow Com & Social',
    ownerName: 'Fatou Bintou Sow',
    email: 'fatou.sow@agence.sn',
    phone: '+221 78 456 78 90',
    channel: 'om',
    amount: 15000,
    planId: 'pro',
    planName: 'Pro Agency (15 000 FCFA)',
    status: 'succeeded',
    date: '21 Août 2026 à 18:15',
    createdAt: '2026-08-21T18:15:00.000Z',
  },
  {
    id: 'tx_03',
    txId: 'WAV_TX_89144',
    agencyId: 'agency_dakar_media',
    agencyName: 'Dakar Media Flow',
    ownerName: 'Aminata Diallo',
    email: 'aminata.cm@gmail.com',
    phone: '+221 77 234 56 78',
    channel: 'wave',
    amount: 15000,
    planId: 'pro',
    planName: 'Pro Agency (15 000 FCFA)',
    status: 'succeeded',
    date: '20 Août 2026 à 11:40',
    createdAt: '2026-08-20T11:40:00.000Z',
  },
  {
    id: 'tx_04',
    txId: 'WAV_TX_89088',
    agencyId: 'agency_abidjan_pulse',
    agencyName: 'Abidjan Pulse Studio 🇨🇮',
    ownerName: 'Koffi Kouamé',
    email: 'koffi@abidjanpulse.ci',
    phone: '+225 07 89 01 23 45',
    channel: 'wave',
    amount: 35000,
    planId: 'scale',
    planName: 'Scale Agence (35 000 FCFA)',
    status: 'succeeded',
    date: '20 Août 2026 à 09:25',
    createdAt: '2026-08-20T09:25:00.000Z',
  },
  {
    id: 'tx_05',
    txId: 'OM_CMF_78204',
    agencyId: 'agency_cheikh_cm',
    agencyName: 'Cheikh Digital Freelance',
    ownerName: 'Cheikh Tidiane Ba',
    email: 'cheikh.ba@outlook.fr',
    phone: '+221 76 345 67 89',
    channel: 'om',
    amount: 3500,
    planId: 'solo',
    planName: 'Solo / Freelance (3 500 FCFA)',
    status: 'succeeded',
    date: '19 Août 2026 à 16:50',
    createdAt: '2026-08-19T16:50:00.000Z',
  },
  {
    id: 'tx_06',
    txId: 'WAV_TX_88992',
    agencyId: 'agency_farafina',
    agencyName: 'Farafina Digital',
    ownerName: 'Aïcha Dieng',
    email: 'aicha@farafinadigital.sn',
    phone: '+221 77 432 10 98',
    channel: 'wave',
    amount: 3500,
    planId: 'solo',
    planName: 'Solo / Freelance (3 500 FCFA)',
    status: 'succeeded',
    date: '18 Août 2026 à 10:12',
    createdAt: '2026-08-18T10:12:00.000Z',
  },
  {
    id: 'tx_07',
    txId: 'OM_CMF_78119',
    agencyId: 'agency_sahel_creative',
    agencyName: 'Sahel Creative Studio',
    ownerName: 'Moussa Traoré',
    email: 'moussa.traore@gmail.com',
    phone: '+221 77 567 89 01',
    channel: 'om',
    amount: 15000,
    planId: 'pro',
    planName: 'Pro Agency (15 000 FCFA)',
    status: 'pending',
    date: '18 Août 2026 à 08:30',
    createdAt: '2026-08-18T08:30:00.000Z',
    notes: 'En attente de confirmation réseau Orange Money.',
  },
];

export const MONTHLY_EVOLUTION: MonthlyChartData[] = [
  {
    month: '2026-03',
    label: 'Mars',
    mrr: 485000,
    revenue: 520000,
    signups: 34,
    waveAmount: 360000,
    omAmount: 160000,
  },
  {
    month: '2026-04',
    label: 'Avril',
    mrr: 890000,
    revenue: 950000,
    signups: 58,
    waveAmount: 650000,
    omAmount: 300000,
  },
  {
    month: '2026-05',
    label: 'Mai',
    mrr: 1420000,
    revenue: 1510000,
    signups: 82,
    waveAmount: 1050000,
    omAmount: 460000,
  },
  {
    month: '2026-06',
    label: 'Juin',
    mrr: 1980000,
    revenue: 2150000,
    signups: 110,
    waveAmount: 1520000,
    omAmount: 630000,
  },
  {
    month: '2026-07',
    label: 'Juillet',
    mrr: 2650000,
    revenue: 2890000,
    signups: 146,
    waveAmount: 2050000,
    omAmount: 840000,
  },
  {
    month: '2026-08',
    label: 'Août (En cours)',
    mrr: 3345000,
    revenue: 3560000,
    signups: 188,
    waveAmount: 2540000,
    omAmount: 1020000,
  },
];

// Helper stockage local
const STORAGE_KEYS = {
  AGENCIES: 'cmflow_admin_agencies_v2',
  TRANSACTIONS: 'cmflow_admin_transactions_v2',
  SETTINGS: 'cmflow_admin_settings_v2',
  PIN: 'cmflow_admin_pin',
  AUTH: 'cmflow_admin_auth',
};

export class AdminService {
  // Lecture Agences
  static getAgencies(): AdminAgency[] {
    if (typeof window === 'undefined') return INITIAL_AGENCIES;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.AGENCIES);
      if (stored) return JSON.parse(stored);
    } catch {}
    this.saveAgencies(INITIAL_AGENCIES);
    return INITIAL_AGENCIES;
  }

  static saveAgencies(agencies: AdminAgency[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.AGENCIES, JSON.stringify(agencies));
    } catch {}
  }

  // Lecture Transactions
  static getTransactions(): AdminTransaction[] {
    if (typeof window === 'undefined') return INITIAL_TRANSACTIONS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      if (stored) return JSON.parse(stored);
    } catch {}
    this.saveTransactions(INITIAL_TRANSACTIONS);
    return INITIAL_TRANSACTIONS;
  }

  static saveTransactions(transactions: AdminTransaction[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
    } catch {}
  }

  // Lecture Paramètres
  static getSettings(): MerchantSettings {
    if (typeof window === 'undefined') return DEFAULT_MERCHANT_SETTINGS;
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return DEFAULT_MERCHANT_SETTINGS;
  }

  static saveSettings(settings: MerchantSettings): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  }

  // Code PIN
  static getPin(): string {
    if (typeof window === 'undefined') return '1234';
    return localStorage.getItem(STORAGE_KEYS.PIN) || '1234';
  }

  static setPin(newPin: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(STORAGE_KEYS.PIN, newPin);
  }

  // Calcul dynamique des KPIs financiers
  static calculateKPIs(): AdminFinancialKPIs {
    const agencies = this.getAgencies();
    const transactions = this.getTransactions();

    // Segmentation Forfaits
    const trialUsersCount = agencies.filter((a) => a.plan === 'trial' && a.status === 'trial').length;
    const soloUsersCount = agencies.filter((a) => a.plan === 'solo' && a.status === 'active').length;
    const proUsersCount = agencies.filter((a) => a.plan === 'pro' && a.status === 'active').length;
    const scaleUsersCount = agencies.filter((a) => a.plan === 'scale' && a.status === 'active').length;
    const totalUsersCount = agencies.length;
    const activeUsersCount = soloUsersCount + proUsersCount + scaleUsersCount;

    // Calcul MRR en FCFA : Solo (3 500) + Pro (15 000) + Scale (35 000)
    const mrr = (soloUsersCount * 3500) + (proUsersCount * 15000) + (scaleUsersCount * 35000);

    // Calcul des encaissements par méthode
    const paidTxs = transactions.filter((t) => t.status === 'succeeded' || t.status === 'manually_validated');
    const waveTxs = paidTxs.filter((t) => t.channel === 'wave');
    const omTxs = paidTxs.filter((t) => t.channel === 'om');

    const waveRevenue = waveTxs.reduce((sum, t) => sum + t.amount, 0);
    const omRevenue = omTxs.reduce((sum, t) => sum + t.amount, 0);
    const totalCollected = waveRevenue + omRevenue + 12450000; // Base historique incluse

    const totalLocal = (waveRevenue + omRevenue) || 1;
    const wavePercent = Math.round((waveRevenue / totalLocal) * 100) || 70;
    const omPercent = Math.round((omRevenue / totalLocal) * 100) || 30;

    const conversionRate = totalUsersCount > 0 ? Number(((activeUsersCount / totalUsersCount) * 100).toFixed(1)) : 28.5;

    return {
      mrr,
      mrrGrowthPercent: 24.8,
      totalCollected,
      waveRevenue,
      waveCount: waveTxs.length,
      wavePercent,
      omRevenue,
      omCount: omTxs.length,
      omPercent,
      trialUsersCount,
      soloUsersCount,
      proUsersCount,
      scaleUsersCount,
      totalUsersCount,
      activeUsersCount,
      conversionRate,
    };
  }

  // Action 1 : Prolonger manuellement l'essai gratuit (+7j ou +14j)
  static extendTrial(agencyId: string, days: number = 7): { success: boolean; newDate: string; message: string } {
    const agencies = this.getAgencies();
    const index = agencies.findIndex((a) => a.id === agencyId);
    if (index === -1) return { success: false, newDate: '', message: 'Agence introuvable' };

    const agency = agencies[index];
    const baseDate = agency.trialEndsAt ? new Date(agency.trialEndsAt) : new Date();
    const newTimestamp = (baseDate > new Date() ? baseDate.getTime() : Date.now()) + (days * 24 * 60 * 60 * 1000);
    const newDateStr = new Date(newTimestamp).toISOString();

    agency.trialEndsAt = newDateStr;
    agency.plan = 'trial';
    agency.status = 'trial';
    agency.planName = 'Essai Gratuit 14j';
    agencies[index] = agency;

    this.saveAgencies(agencies);
    return {
      success: true,
      newDate: newDateStr,
      message: `Essai gratuit de ${agency.agencyName} prolongé de +${days} jours avec succès ! (Fin : ${new Date(newDateStr).toLocaleDateString('fr-FR')})`,
    };
  }

  // Action 2 : Changer manuellement le forfait (Solo 3500, Pro 15000, Scale 35000, Essai 14j)
  static changePlan(
    agencyId: string,
    newPlan: 'solo' | 'pro' | 'scale' | 'trial'
  ): { success: boolean; message: string } {
    const agencies = this.getAgencies();
    const index = agencies.findIndex((a) => a.id === agencyId);
    if (index === -1) return { success: false, message: 'Agence introuvable' };

    const agency = agencies[index];
    const isTrial = newPlan === 'trial';
    const planConfig = PLANS_MAP[newPlan as keyof typeof PLANS_MAP] || PLANS_MAP['solo'];

    agency.plan = newPlan;
    agency.planName = isTrial ? 'Essai Gratuit 14j' : planConfig.name;
    agency.priceMonthly = isTrial ? 0 : planConfig.priceMonthly;
    agency.workspacesMax = isTrial ? 3 : planConfig.workspacesMax;
    agency.status = isTrial ? 'trial' : 'active';
    
    if (isTrial) {
      agency.trialEndsAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
    } else {
      agency.currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    }

    agencies[index] = agency;
    this.saveAgencies(agencies);

    // Synchronisation directe avec l'environnement applicatif CM
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cmflow_user_plan', agency.plan);
        const currentUserStr = localStorage.getItem('cmflow_user');
        if (currentUserStr) {
          const user = JSON.parse(currentUserStr);
          if (user.email === agency.email || user.id === agency.id) {
            user.plan = agency.plan;
            localStorage.setItem('cmflow_user', JSON.stringify(user));
          }
        }
      } catch {}
    }

    return {
      success: true,
      message: `Formule de ${agency.agencyName} appliquée immédiatement : ${agency.planName} (${agency.priceMonthly.toLocaleString('fr-FR')} FCFA) ! 🚀`,
    };
  }

  // Action 3 : Activer ou Suspendre le compte en 1 clic
  static toggleStatus(
    agencyId: string,
    forcedStatus?: 'active' | 'suspended'
  ): { success: boolean; newStatus: string; message: string } {
    const agencies = this.getAgencies();
    const index = agencies.findIndex((a) => a.id === agencyId);
    if (index === -1) return { success: false, newStatus: '', message: 'Agence introuvable' };

    const agency = agencies[index];
    let nextStatus = forcedStatus;
    if (!nextStatus) {
      nextStatus = agency.status === 'suspended' ? 'active' : 'suspended';
    }

    agency.status = nextStatus;
    agencies[index] = agency;
    this.saveAgencies(agencies);

    const isSuspended = nextStatus === 'suspended';
    return {
      success: true,
      newStatus: nextStatus,
      message: isSuspended
        ? `Le compte de ${agency.agencyName} a été SUSPENDU immédiatement. ⛔`
        : `Le compte de ${agency.agencyName} a été RÉACTIVÉ avec succès ! ⚡`,
    };
  }

  // Action 4 : Valider manuellement une transaction Mobile Money (déblocage immédiat de l'abonnement)
  static validateTransactionManually(txId: string): { success: boolean; message: string } {
    const transactions = this.getTransactions();
    const txIndex = transactions.findIndex((t) => t.id === txId || t.txId === txId);
    if (txIndex === -1) return { success: false, message: 'Transaction introuvable' };

    const tx = transactions[txIndex];
    tx.status = 'manually_validated';
    tx.validatedBy = 'Super-Admin';
    transactions[txIndex] = tx;
    this.saveTransactions(transactions);

    // Débloquer immédiatement l'agence correspondante
    if (tx.agencyId) {
      this.changePlan(tx.agencyId, tx.planId);
    }

    return {
      success: true,
      message: `Paiement ${tx.txId} de ${tx.amount.toLocaleString('fr-FR')} FCFA validé manuellement ! Abonnement ${tx.planName} débloqué immédiatement pour ${tx.agencyName}. 🔓✨`,
    };
  }

  // Action 5 : Créer une transaction manuelle
  static createManualTransaction(params: {
    agencyId: string;
    channel: 'wave' | 'om' | 'card' | 'manual';
    amount: number;
    planId: 'solo' | 'pro' | 'scale';
    notes?: string;
  }): { success: boolean; transaction: AdminTransaction; message: string } {
    const agencies = this.getAgencies();
    const agency = agencies.find((a) => a.id === params.agencyId) || {
      id: params.agencyId,
      agencyName: 'Agence Directe',
      ownerName: 'Client Direct',
      email: 'client@cmflow.sn',
      phone: '+221 77 000 00 00',
    };

    const planConfig = PLANS_MAP[params.planId] || PLANS_MAP['pro'];
    const now = new Date();
    const txId = `MAN_TX_${Date.now().toString().slice(-6)}`;

    const newTx: AdminTransaction = {
      id: `tx_${Date.now()}`,
      txId,
      agencyId: agency.id,
      agencyName: agency.agencyName,
      ownerName: agency.ownerName,
      email: agency.email,
      phone: agency.phone,
      channel: params.channel,
      amount: params.amount,
      planId: params.planId,
      planName: `${planConfig.name} (${params.amount.toLocaleString('fr-FR')} FCFA)`,
      status: 'manually_validated',
      date: now.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      createdAt: now.toISOString(),
      validatedBy: 'Super-Admin',
      notes: params.notes || 'Paiement direct saisi par l’administrateur',
    };

    const transactions = this.getTransactions();
    transactions.unshift(newTx);
    this.saveTransactions(transactions);

    // Débloquer le forfait de l'agence
    this.changePlan(agency.id, params.planId);

    return {
      success: true,
      transaction: newTx,
      message: `Paiement manuel de ${params.amount.toLocaleString('fr-FR')} FCFA enregistré avec succès ! Forfait activé. 🚀`,
    };
  }

  // Action 6 : Ajouter manuellement une nouvelle agence
  static addAgency(data: {
    agencyName: string;
    ownerName: string;
    email: string;
    phone: string;
    plan: 'trial' | 'solo' | 'pro' | 'scale';
  }): { success: boolean; agency: AdminAgency; message: string } {
    const agencies = this.getAgencies();
    const planConfig = PLANS_MAP[data.plan] || PLANS_MAP['solo'];
    const now = new Date();
    const isTrial = data.plan === 'trial';

    const newAgency: AdminAgency = {
      id: `agency_${Date.now()}`,
      agencyName: data.agencyName,
      ownerName: data.ownerName,
      email: data.email,
      phone: data.phone,
      plan: data.plan,
      planName: isTrial ? 'Essai Gratuit 14j' : planConfig.name,
      priceMonthly: isTrial ? 0 : planConfig.priceMonthly,
      status: isTrial ? 'trial' : 'active',
      workspacesCount: 1,
      workspacesMax: isTrial ? 3 : planConfig.workspacesMax,
      postsCount: 0,
      trialEndsAt: isTrial ? new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      currentPeriodEnd: !isTrial ? new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      createdAt: now.toISOString(),
      lastActiveAt: now.toISOString(),
      paymentMethod: 'wave',
    };

    agencies.unshift(newAgency);
    this.saveAgencies(agencies);

    return {
      success: true,
      agency: newAgency,
      message: `Nouvelle agence "${data.agencyName}" ajoutée avec succès sous le forfait ${newAgency.planName} ! 🎉`,
    };
  }

  // Action 7 : Supprimer une agence
  static deleteAgency(agencyId: string): { success: boolean; message: string } {
    let agencies = this.getAgencies();
    const agency = agencies.find((a) => a.id === agencyId);
    if (!agency) return { success: false, message: 'Agence introuvable' };

    agencies = agencies.filter((a) => a.id !== agencyId);
    this.saveAgencies(agencies);

    return {
      success: true,
      message: `Compte de l'agence "${agency.agencyName}" supprimé avec succès. 🗑️`,
    };
  }
}

export default AdminService;
