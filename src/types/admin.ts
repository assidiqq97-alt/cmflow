// ===============================================================
// CMFlow — Types & Interfaces Super-Administrateur
// Grille Tarifaire : Solo (3 500 FCFA), Pro (15 000 FCFA), Scale (35 000 FCFA)
// ===============================================================

export type AdminPlanType = 'trial' | 'solo' | 'pro' | 'scale' | 'expired';
export type AdminAccountStatus = 'trial' | 'active' | 'expired' | 'suspended';
export type PaymentChannel = 'wave' | 'om' | 'card' | 'manual';
export type TransactionStatus = 'succeeded' | 'pending' | 'failed' | 'manually_validated';

export interface AdminAgency {
  id: string;
  agencyName: string;
  ownerName: string;
  email: string;
  phone: string; // Numéro WhatsApp
  plan: AdminPlanType;
  planName: string;
  priceMonthly: number;
  status: AdminAccountStatus;
  workspacesCount: number;
  workspacesMax: number;
  postsCount: number;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  createdAt: string;
  lastActiveAt: string;
  paymentMethod?: PaymentChannel;
  notes?: string;
}

export interface AdminTransaction {
  id: string;
  txId: string;
  agencyId: string;
  agencyName: string;
  ownerName: string;
  email: string;
  phone: string;
  channel: PaymentChannel;
  amount: number; // Montant en FCFA
  planId: 'solo' | 'pro' | 'scale';
  planName: string;
  status: TransactionStatus;
  date: string;
  createdAt: string;
  validatedBy?: string;
  notes?: string;
}

export interface MonthlyChartData {
  month: string;
  label: string;
  mrr: number;
  revenue: number;
  signups: number;
  waveAmount: number;
  omAmount: number;
}

export interface AdminFinancialKPIs {
  mrr: number; // Revenu Mensuel Récurrent en FCFA
  mrrGrowthPercent: number;
  totalCollected: number; // Total encaissé depuis lancement
  
  // Répartition des canaux
  waveRevenue: number;
  waveCount: number;
  wavePercent: number;
  omRevenue: number;
  omCount: number;
  omPercent: number;
  
  // Segmentation Forfaits
  trialUsersCount: number;
  soloUsersCount: number;
  proUsersCount: number;
  scaleUsersCount: number;
  
  // Métriques globales
  totalUsersCount: number;
  activeUsersCount: number;
  conversionRate: number;
}

export interface MerchantSettings {
  waveMerchantNumber: string;
  omMerchantNumber: string;
  adminEmail: string;
  adminPhone: string;
  autoLockDelayMinutes: number;
  simulationMode: boolean;
}
