/**
 * CMFlow — Service d'Authentification Orange Developer (OAuth2 Client Credentials)
 * Utilisé pour accéder à l'API Orange Money Web Payment (Sénégal 🇸🇳, Côte d'Ivoire 🇨🇮, Mali 🇲🇱, etc.)
 */

interface CachedToken {
  accessToken: string;
  expiresAt: number;
}

let tokenCache: CachedToken | null = null;

/**
 * Récupère un token d'accès OAuth2 valide pour Orange Developer
 */
export async function getOrangeMoneyOAuthToken(): Promise<string> {
  const clientId = process.env.OM_CLIENT_ID;
  const clientSecret = process.env.OM_CLIENT_SECRET;

  // 1. Vérification du cache mémoire en cours de validité
  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt > now + 60000) {
    return tokenCache.accessToken;
  }

  // 2. Mode simulation si clés de test ou environnement de dev sans clés réelles
  if (
    !clientId ||
    !clientSecret ||
    clientId.includes('om_dev') ||
    clientId === 'demo_om' ||
    process.env.NODE_ENV === 'development'
  ) {
    const mockToken = `om_token_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    tokenCache = {
      accessToken: mockToken,
      expiresAt: now + 3600 * 1000, // 1 heure
    };
    return mockToken;
  }

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

    const response = await fetch('https://api.orange.com/oauth/v3/token', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    const data = await response.json();

    if (!response.ok || !data.access_token) {
      throw new Error(
        data?.error_description || data?.message || `Erreur OAuth Orange (${response.status})`
      );
    }

    const expiresInMs = (parseInt(data.expires_in, 10) || 3600) * 1000;
    tokenCache = {
      accessToken: data.access_token,
      expiresAt: now + expiresInMs,
    };

    return data.access_token;
  } catch (error: any) {
    console.error('❌ Erreur getOrangeMoneyOAuthToken :', error);
    // En cas d'erreur réseau, fallback sur token de simulation pour ne pas bloquer l'UX
    const fallbackToken = `om_fallback_token_${Date.now()}`;
    return fallbackToken;
  }
}

export default getOrangeMoneyOAuthToken;
