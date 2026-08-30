import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

/**
 * CMFlow — Initialisation du flux OAuth 2.0 TikTok
 * Route : GET /api/auth/tiktok?workspaceId=...
 * Utilise PKCE (SHA-256) conformément aux exigences TikTok v2
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default-workspace';
    const redirectPath = searchParams.get('redirectPath') || '/channels.html';

    const clientKey = process.env.TIKTOK_CLIENT_KEY;
    const redirectUri = process.env.TIKTOK_REDIRECT_URI || `${new URL(request.url).origin}/api/auth/callback/tiktok`;

    if (!clientKey) {
      return NextResponse.json(
        { error: 'TIKTOK_CLIENT_KEY non configuré dans les variables d\'environnement' },
        { status: 500 }
      );
    }

    // PKCE — génération du code_verifier et code_challenge
    const codeVerifier = crypto.randomBytes(64).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    // Encodage du state (workspaceId + codeVerifier + redirectPath)
    const stateObj = { workspaceId, codeVerifier, redirectPath };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64url');

    const authUrl = new URL('https://www.tiktok.com/v2/auth/authorize/');
    authUrl.searchParams.set('client_key', clientKey);
    authUrl.searchParams.set('scope', 'user.info.basic,video.publish,video.upload');
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', state);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('❌ Erreur initialisation OAuth TikTok:', error);
    return NextResponse.json(
      { error: "Impossible d'initier la connexion TikTok", details: error.message },
      { status: 500 }
    );
  }
}
