// ===============================================================
// CMFlow — Service Officiel Meta OAuth2 & Graph API v19.0
// Instagram Business & Facebook Pages Integration
// ===============================================================

import { SocialAccount, MetaOAuthState } from '../types/social';

export const META_REQUIRED_SCOPES = [
  'pages_show_list',
  'pages_read_engagement',
  'pages_manage_posts',
  'instagram_basic',
  'instagram_content_publish',
  'instagram_manage_insights',
];

export const META_GRAPH_VERSION = 'v19.0';
export const META_GRAPH_BASE_URL = `https://graph.facebook.com/${META_GRAPH_VERSION}`;

export class MetaOAuthService {
  /**
   * Récupère l'App ID et l'App Secret configurés dans les variables d'environnement
   */
  static getCredentials(): { appId: string; appSecret: string; appUrl: string; redirectUri: string } {
    const appId =
      process.env.META_APP_ID ||
      process.env.META_CLIENT_ID ||
      '916706431513072';
    const appSecret =
      process.env.META_APP_SECRET ||
      process.env.META_CLIENT_SECRET ||
      '';
    const appUrl =
      process.env.NEXT_PUBLIC_APP_URL ||
      'https://cmflow.sn';
    const redirectUri =
      process.env.META_REDIRECT_URI ||
      'http://localhost:3000/api/auth/callback/facebook';

    return { appId, appSecret, appUrl, redirectUri };
  }

  /**
   * Construit l'URL d'autorisation officielle Meta Dialog OAuth2
   */
  static buildAuthorizationUrl(params: {
    workspaceId: string;
    userId?: string;
    origin?: string;
    redirectPath?: string;
  }): string {
    const { appId, appUrl, redirectUri: configuredRedirectUri } = this.getCredentials();
    const baseOrigin = params.origin || appUrl;
    const redirectUri = configuredRedirectUri || `${baseOrigin}/api/auth/callback/facebook`;

    const stateObj: MetaOAuthState = {
      workspaceId: params.workspaceId || 'default-workspace',
      userId: params.userId,
      timestamp: Date.now(),
      csrfToken: Math.random().toString(36).substring(2) + Date.now().toString(36),
      redirectPath: params.redirectPath || '/channels.html',
    };

    const encodedState = Buffer.from(JSON.stringify(stateObj)).toString('base64url');

    const authUrl = new URL(`https://www.facebook.com/${META_GRAPH_VERSION}/dialog/oauth`);
    authUrl.searchParams.set('client_id', appId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('scope', META_REQUIRED_SCOPES.join(','));
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('state', encodedState);
    authUrl.searchParams.set('auth_type', 'rerequest');

    return authUrl.toString();
  }

  /**
   * Décode le paramètre state retourné par Meta
   */
  static decodeState(rawState: string | null): MetaOAuthState | null {
    if (!rawState) return null;
    try {
      return JSON.parse(Buffer.from(rawState, 'base64url').toString('utf-8'));
    } catch {
      return null;
    }
  }

  /**
   * Échange le code d'autorisation contre un Token Court (1-2h),
   * puis l'échange automatiquement contre un Long-Lived Token (60 jours)
   */
  static async exchangeCodeForLongLivedToken(
    code: string,
    redirectUri: string
  ): Promise<{ accessToken: string; expiresIn: number }> {
    const { appId, appSecret } = this.getCredentials();

    // 1. Échange Code → Short-Lived User Token
    const shortTokenUrl = new URL(`${META_GRAPH_BASE_URL}/oauth/access_token`);
    shortTokenUrl.searchParams.set('client_id', appId);
    shortTokenUrl.searchParams.set('client_secret', appSecret);
    shortTokenUrl.searchParams.set('redirect_uri', redirectUri);
    shortTokenUrl.searchParams.set('code', code);

    const shortRes = await fetch(shortTokenUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const shortData = await shortRes.json();
    if (!shortRes.ok || !shortData.access_token) {
      throw new Error(
        shortData?.error?.message || 'Échec d’obtention du token court Meta'
      );
    }

    const shortLivedToken = shortData.access_token;

    // 2. Échange Short-Lived → Long-Lived User Token (60 jours)
    const longTokenUrl = new URL(`${META_GRAPH_BASE_URL}/oauth/access_token`);
    longTokenUrl.searchParams.set('grant_type', 'fb_exchange_token');
    longTokenUrl.searchParams.set('client_id', appId);
    longTokenUrl.searchParams.set('client_secret', appSecret);
    longTokenUrl.searchParams.set('fb_exchange_token', shortLivedToken);

    const longRes = await fetch(longTokenUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const longData = await longRes.json();
    const finalToken = longData?.access_token || shortLivedToken;
    const expiresIn = longData?.expires_in || 60 * 24 * 60 * 60; // 60 jours en secondes

    return {
      accessToken: finalToken,
      expiresIn,
    };
  }

  /**
   * Découvre et extrait les Pages Facebook et Comptes Instagram Pro associés au compte
   */
  static async fetchConnectedAccounts(
    userLongLivedToken: string,
    workspaceId: string
  ): Promise<SocialAccount[]> {
    const accountsUrl = new URL(`${META_GRAPH_BASE_URL}/me/accounts`);
    accountsUrl.searchParams.set(
      'fields',
      'id,name,access_token,category,picture.type(large),instagram_business_account{id,username,name,profile_picture_url,followers_count}'
    );
    accountsUrl.searchParams.set('access_token', userLongLivedToken);

    const res = await fetch(accountsUrl.toString(), {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
    });

    const data = await res.json();
    if (!res.ok || !data?.data) {
      throw new Error(
        data?.error?.message || 'Impossible de récupérer les Pages et Comptes Instagram Meta'
      );
    }

    const discoveredAccounts: SocialAccount[] = [];
    const now = new Date();
    const expiresDate = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000).toISOString();

    for (const page of data.data) {
      const pageToken = page.access_token || userLongLivedToken;
      const pageAvatar = page.picture?.data?.url || `https://ui-avatars.com/api/?name=${encodeURIComponent(page.name)}&background=1877F2&color=fff`;

      // 1. Enregistrement de la Page Facebook
      const fbAccount: SocialAccount = {
        id: `fb_${page.id}`,
        accountId: page.id,
        workspaceId,
        name: page.name,
        type: 'facebook',
        provider: 'facebook',
        accessToken: pageToken,
        expiresAt: expiresDate,
        status: 'connected',
        pageId: page.id,
        pageName: page.name,
        category: page.category || 'Page Professionnelle',
        avatar: pageAvatar,
        autoPublishEnabled: true,
        permissions: META_REQUIRED_SCOPES,
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      };
      discoveredAccounts.push(fbAccount);

      // 2. Si un compte Instagram Business est relié à cette Page
      if (page.instagram_business_account) {
        const ig = page.instagram_business_account;
        const igAvatar = ig.profile_picture_url || pageAvatar;

        const igAccount: SocialAccount = {
          id: `ig_${ig.id}`,
          accountId: ig.id,
          workspaceId,
          name: ig.name || ig.username || page.name,
          username: ig.username ? `@${ig.username.replace('@', '')}` : undefined,
          type: 'instagram',
          provider: 'instagram',
          accessToken: pageToken, // Les tokens de page permettent la publication Instagram Graph API
          expiresAt: expiresDate,
          status: 'connected',
          pageId: page.id,
          pageName: page.name,
          followersCount: ig.followers_count,
          avatar: igAvatar,
          autoPublishEnabled: true,
          permissions: META_REQUIRED_SCOPES,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
        };
        discoveredAccounts.push(igAccount);
      }
    }

    return discoveredAccounts;
  }
}

export default MetaOAuthService;
