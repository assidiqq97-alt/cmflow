import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * CMFlow — Initialisation du flux OAuth 2.0 LinkedIn
 * Route : GET /api/auth/linkedin?workspaceId=...&redirectPath=...
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const workspaceId = searchParams.get('workspaceId') || 'teranga-gourmet';
    const redirectPath = searchParams.get('redirectPath') || '/dashboard/settings/channels';

    const clientId = process.env.LINKEDIN_CLIENT_ID || '77589j7j2nnfkw';
    const redirectUri = process.env.LINKEDIN_REDIRECT_URI || 'http://localhost:3000/api/auth/callback/linkedin';
    const scope = 'openid profile email w_member_social';

    // On encode le workspaceId et le redirectPath dans le state pour lier le compte
    const stateObj = { workspaceId, redirectPath };
    const state = encodeURIComponent(JSON.stringify(stateObj));

    const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('Erreur initialisation OAuth LinkedIn:', error);
    return NextResponse.json(
      { error: 'Impossible d\'initier la connexion LinkedIn', details: error.message },
      { status: 500 }
    );
  }
}
