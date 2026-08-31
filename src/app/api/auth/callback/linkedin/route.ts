import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * CMFlow — Callback OAuth 2.0 LinkedIn
 * Route : GET /api/auth/callback/linkedin?code=...&state=...
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  let workspaceId = 'teranga-gourmet';
  let redirectPath = '/channels.html';

  if (stateParam) {
    try {
      const decoded = JSON.parse(decodeURIComponent(stateParam));
      if (decoded.workspaceId) workspaceId = decoded.workspaceId;
      if (decoded.redirectPath) redirectPath = decoded.redirectPath;
    } catch (e) {
      console.warn('Erreur décodage state LinkedIn:', e);
    }
  }

  // Base URL pour la redirection
  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  if (errorParam || !code) {
    console.error('Erreur retour OAuth LinkedIn:', errorParam, errorDescription);
    const targetUrl = new URL(redirectPath, appBaseUrl);
    targetUrl.searchParams.set('error', errorParam || 'missing_code');
    targetUrl.searchParams.set('provider', 'linkedin');
    return NextResponse.redirect(targetUrl);
  }

  try {
    const clientId = process.env.LINKEDIN_CLIENT_ID || '77589j7j2nnfkw';
    const clientSecret = process.env.LINKEDIN_CLIENT_SECRET || '';
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || `${appBaseUrl}/api/auth/callback/linkedin`;

    // 1. Échange du code contre le jeton d'accès OAuth 2.0
    const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Échec de récupération du token LinkedIn');
    }

    const accessToken = tokenData.access_token;
    const expiresIn = Number(tokenData.expires_in) || 5184000; // 60 jours par défaut

    // 2. Récupérer les informations de profil (OpenID userinfo)
    let userData: any = {};
    try {
      const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (userRes.ok) {
        userData = await userRes.json();
      }
    } catch (uErr) {
      console.warn('Erreur récupération profil userinfo LinkedIn:', uErr);
    }

    const accountId = userData.sub || `linkedin_${Date.now()}`;
    const accountName = userData.name || `${userData.given_name || ''} ${userData.family_name || ''}`.trim() || 'Compte LinkedIn';
    const channelId = `linkedin_${accountId}`;

    const channelPayload = {
      id: channelId,
      provider: 'linkedin',
      type: 'linkedin',
      name: accountName,
      username: userData.email || accountName,
      accountId: accountId,
      avatar: userData.picture || 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&h=200&fit=crop',
      email: userData.email || '',
      accessToken,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      status: 'connected',
      autoPublishEnabled: true,
      permissions: ['openid', 'profile', 'email', 'w_member_social'],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // 3. Enregistrer dans Firestore (workspaces/{workspaceId}/channels/{channelId} et socialAccounts)
    try {
      if (db) {
        await db.collection('workspaces').doc(workspaceId).collection('channels').doc(channelId).set(channelPayload, { merge: true });
        await db.collection('workspaces').doc(workspaceId).collection('socialAccounts').doc(channelId).set(channelPayload, { merge: true });
      }
    } catch (fsErr) {
      console.warn('Firestore non disponible pour enregistrement LinkedIn (mode résilient) :', fsErr);
    }

    // 4. Rediriger vers la page des canaux avec succès
    const targetUrl = new URL(redirectPath, appBaseUrl);
    targetUrl.searchParams.set('connected', 'linkedin');
    targetUrl.searchParams.set('status', 'success');
    targetUrl.searchParams.set('name', accountName);
    targetUrl.searchParams.set('provider', 'linkedin');

    return NextResponse.redirect(targetUrl);
  } catch (error: any) {
    console.error('Erreur LinkedIn Auth Callback:', error);
    const targetUrl = new URL(redirectPath, appBaseUrl);
    targetUrl.searchParams.set('error', 'linkedin_failed');
    targetUrl.searchParams.set('message', error.message || 'Erreur inconnue');
    return NextResponse.redirect(targetUrl);
  }
}
