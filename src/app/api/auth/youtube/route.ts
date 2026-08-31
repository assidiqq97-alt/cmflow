import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * CMFlow — Initialisation du flux OAuth 2.0 Google / YouTube
 * Route : GET /api/auth/youtube?workspaceId=...&redirectPath=...
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'teranga-gourmet';
    const redirectPath = searchParams.get('redirectPath') || '/dashboard/settings/channels';

    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;
    const clientId = (process.env.YOUTUBE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '').trim();
    const redirectUri = `${origin}/api/auth/callback/youtube`;

    if (!clientId) {
      console.error('❌ [YouTube OAuth] YOUTUBE_CLIENT_ID est manquant dans les variables d\'environnement.');
      const errUrl = new URL(redirectPath, origin);
      errUrl.searchParams.set('error', 'missing_youtube_client_id');
      errUrl.searchParams.set('message', 'YOUTUBE_CLIENT_ID non détecté sur Vercel. Veuillez redéployer le projet sur Vercel.');
      return NextResponse.redirect(errUrl);
    }

    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ].join(' ');

    const stateObj = { workspaceId, redirectPath };
    const state = encodeURIComponent(JSON.stringify(stateObj));

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scopes);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', state);

    return NextResponse.redirect(authUrl.toString());
  } catch (error: any) {
    console.error('Erreur initialisation OAuth YouTube:', error);
    return NextResponse.json(
      { error: 'Impossible d\'initier la connexion YouTube', details: error.message },
      { status: 500 }
    );
  }
}
