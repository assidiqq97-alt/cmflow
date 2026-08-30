import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * CMFlow — Callback OAuth 2.0 TikTok
 * Route : GET /api/auth/callback/tiktok?code=...&state=...
 */
export async function GET(request: NextRequest) {
  const origin = new URL(request.url).origin;
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const rawState = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Décodage du state
  let workspaceId = 'default-workspace';
  let codeVerifier = '';
  let redirectPath = '/channels.html';

  if (rawState) {
    try {
      const decoded = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf-8'));
      workspaceId = decoded.workspaceId || workspaceId;
      codeVerifier = decoded.codeVerifier || '';
      redirectPath = decoded.redirectPath || redirectPath;
    } catch (e) {
      console.warn('⚠️ [TikTok Callback] Erreur décodage state:', e);
    }
  }

  const failUrl = new URL(redirectPath, origin);
  failUrl.searchParams.set('status', 'error');
  failUrl.searchParams.set('provider', 'tiktok');

  // Gestion des erreurs ou annulation utilisateur
  if (error || !code) {
    console.warn('⚠️ [TikTok Callback] Erreur ou annulation:', error, errorDescription);
    failUrl.searchParams.set('reason', errorDescription || error || 'user_cancelled');
    return NextResponse.redirect(failUrl.toString());
  }

  try {
    const clientKey = process.env.TIKTOK_CLIENT_KEY!;
    const clientSecret = process.env.TIKTOK_CLIENT_SECRET!;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${origin}/api/auth/callback/tiktok`;

    // 1. Échange du code contre un access_token
    const tokenRes = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_key: clientKey,
        client_secret: clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
        code_verifier: codeVerifier,
      }),
    });

    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.data?.access_token) {
      throw new Error(
        tokenData.error?.description ||
        tokenData.message ||
        'Token TikTok introuvable'
      );
    }

    const { access_token, open_id, expires_in, refresh_token, refresh_expires_in } = tokenData.data;

    // 2. Récupérer le profil utilisateur TikTok
    let userInfo: any = {};
    try {
      const profileRes = await fetch(
        'https://open.tiktokapis.com/v2/user/info/?fields=open_id,display_name,avatar_url,follower_count,following_count,likes_count',
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        userInfo = profileData.data?.user || {};
      }
    } catch (profileErr) {
      console.warn('⚠️ [TikTok] Impossible de récupérer le profil:', profileErr);
    }

    // 3. Construction du document compte
    const channelId = `tiktok_${open_id}`;
    const account = {
      id: channelId,
      accountId: open_id,
      workspaceId,
      name: userInfo.display_name || 'Compte TikTok',
      username: userInfo.display_name ? `@${userInfo.display_name}` : undefined,
      type: 'tiktok',
      provider: 'tiktok',
      accessToken: access_token,
      refreshToken: refresh_token || null,
      expiresAt: new Date(Date.now() + (expires_in || 86400) * 1000).toISOString(),
      refreshExpiresAt: refresh_expires_in
        ? new Date(Date.now() + refresh_expires_in * 1000).toISOString()
        : null,
      status: 'connected',
      followersCount: userInfo.follower_count || 0,
      followingCount: userInfo.following_count || 0,
      likesCount: userInfo.likes_count || 0,
      avatar: userInfo.avatar_url || '',
      autoPublishEnabled: true,
      permissions: ['user.info.basic', 'video.publish', 'video.upload'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // 4. Persistance dans Firestore
    try {
      if (db) {
        await db
          .collection('workspaces')
          .doc(workspaceId)
          .collection('socialAccounts')
          .doc(channelId)
          .set(account, { merge: true });

        await db
          .collection('workspaces')
          .doc(workspaceId)
          .collection('channels')
          .doc(channelId)
          .set(account, { merge: true });
      }
    } catch (dbErr) {
      console.warn('⚠️ [TikTok Callback] Firestore non disponible (mode résilient):', dbErr);
    }

    // 5. Redirection succès
    console.log(`✅ [TikTok OAuth] Compte ${account.name} connecté pour workspace ${workspaceId}`);
    const successUrl = new URL(redirectPath, origin);
    successUrl.searchParams.set('status', 'success');
    successUrl.searchParams.set('provider', 'tiktok');
    successUrl.searchParams.set('workspaceId', workspaceId);
    successUrl.searchParams.set('name', account.name);
    return NextResponse.redirect(successUrl.toString());
  } catch (err: any) {
    console.error('❌ [TikTok OAuth Callback Exception]:', err);
    failUrl.searchParams.set('reason', encodeURIComponent(err.message || 'Erreur inconnue TikTok'));
    return NextResponse.redirect(failUrl.toString());
  }
}
