import { NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * CMFlow — Callback OAuth 2.0 Google / YouTube
 * Route : GET /api/auth/callback/youtube?code=...&state=...
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const stateParam = searchParams.get('state');
  const errorParam = searchParams.get('error');

  let workspaceId = 'teranga-gourmet';
  let redirectPath = '/dashboard/settings/channels';

  if (stateParam) {
    try {
      const decoded = JSON.parse(decodeURIComponent(stateParam));
      if (decoded.workspaceId) workspaceId = decoded.workspaceId;
      if (decoded.redirectPath) redirectPath = decoded.redirectPath;
    } catch (e) {
      console.warn('Erreur décodage state YouTube:', e);
    }
  }

  const appBaseUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

  if (errorParam || !code) {
    console.error('Erreur retour OAuth YouTube:', errorParam);
    const targetUrl = new URL(redirectPath, appBaseUrl);
    targetUrl.searchParams.set('error', errorParam || 'missing_code');
    targetUrl.searchParams.set('provider', 'youtube');
    return NextResponse.redirect(targetUrl);
  }

  try {
    const clientId = process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
    const clientSecret = process.env.YOUTUBE_CLIENT_SECRET || process.env.GOOGLE_CLIENT_SECRET || '';
    const redirectUri = `${appBaseUrl}/api/auth/callback/youtube`;

    // 1. Échange du code d'autorisation contre les tokens d'accès
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.access_token) {
      throw new Error(tokenData.error_description || tokenData.error || 'Échec de récupération du token YouTube');
    }

    const accessToken = tokenData.access_token;
    const refreshToken = tokenData.refresh_token;
    const expiresIn = Number(tokenData.expires_in) || 3600;

    // 2. Récupérer les informations de la chaîne YouTube
    let channelInfo: any = null;
    try {
      const ytRes = await fetch(
        'https://www.googleapis.com/youtube/v3/channels?part=snippet,statistics&mine=true',
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      if (ytRes.ok) {
        const ytData = await ytRes.json();
        if (ytData.items && ytData.items.length > 0) {
          channelInfo = ytData.items[0];
        }
      }
    } catch (ytErr) {
      console.warn('⚠️ Erreur récupération chaîne YouTube:', ytErr);
    }

    const accountId = channelInfo?.id || `yt_${Date.now()}`;
    const accountName = channelInfo?.snippet?.title || 'Chaîne YouTube';
    const avatar = channelInfo?.snippet?.thumbnails?.default?.url || 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=200&h=200&fit=crop';
    const subscriberCount = channelInfo?.statistics?.subscriberCount || 0;

    const channelPayload = {
      id: `youtube_${accountId}`,
      provider: 'youtube',
      type: 'youtube',
      name: accountName,
      username: channelInfo?.snippet?.customUrl || accountName,
      accountId,
      avatar,
      accessToken,
      refreshToken: refreshToken || null,
      expiresAt: new Date(Date.now() + expiresIn * 1000).toISOString(),
      status: 'connected',
      autoPublishEnabled: true,
      subscribers: Number(subscriberCount),
      permissions: ['youtube.upload', 'youtube.readonly'],
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    // 3. Sauvegarde dans Firestore
    if (db) {
      try {
        await db
          .collection('workspaces')
          .doc(workspaceId)
          .collection('social_accounts')
          .doc(`youtube_${accountId}`)
          .set(channelPayload, { merge: true });
        console.log(`✅ [YouTube OAuth] Chaîne "${accountName}" enregistrée pour workspace: ${workspaceId}`);
      } catch (dbErr) {
        console.warn('⚠️ Erreur sauvegarde Firestore Admin:', dbErr);
      }
    }

    const successUrl = new URL(redirectPath, appBaseUrl);
    successUrl.searchParams.set('success', 'youtube_connected');
    successUrl.searchParams.set('channel', accountName);
    return NextResponse.redirect(successUrl);
  } catch (err: any) {
    console.error('❌ Erreur générale callback YouTube:', err);
    const targetUrl = new URL(redirectPath, appBaseUrl);
    targetUrl.searchParams.set('error', 'token_exchange_failed');
    targetUrl.searchParams.set('details', encodeURIComponent(err?.message || 'Inconnu'));
    return NextResponse.redirect(targetUrl);
  }
}
