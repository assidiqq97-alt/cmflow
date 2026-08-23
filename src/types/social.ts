// ===============================================================
// CMFlow — Types & Interfaces Comptes Réseaux Sociaux & Meta API
// Instagram Business & Facebook Pages OAuth2
// ===============================================================

export type SocialPlatformType = 'instagram' | 'facebook' | 'linkedin' | 'tiktok' | 'twitter' | 'youtube';
export type SocialConnectionStatus = 'connected' | 'expired' | 'revoked' | 'error';

export interface SocialAccount {
  id: string; // Document ID ou accountId
  accountId: string; // ID Meta Graph (ex: ID Page ou ID Instagram Business) ou ID LinkedIn
  workspaceId: string; // ID du workspace propriétaire
  name: string; // Nom de la page ou du compte
  username?: string; // @handle Instagram, LinkedIn ou slug Facebook
  email?: string;
  avatar?: string; // URL photo de profil / logo
  type: SocialPlatformType;
  provider?: SocialPlatformType;
  accessToken: string; // Long-Lived Token (60 jours) ou Page Token
  expiresAt: string; // Date ISO d'expiration du token
  status: SocialConnectionStatus;
  
  // Métadonnées Facebook / Instagram
  pageId?: string; // ID de la Page Facebook parente (pour Instagram)
  pageName?: string;
  category?: string;
  followersCount?: number;
  
  // Configuration de publication
  autoPublishEnabled: boolean;
  permissions: string[];
  
  // Audit
  createdAt: string;
  updatedAt: string;
  connectedBy?: string;
}

export interface MetaOAuthState {
  workspaceId: string;
  userId?: string;
  timestamp: number;
  csrfToken: string;
  redirectPath?: string;
}
