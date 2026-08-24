import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * Route d'Initialisation OAuth 2.0 pour Meta Graph API (Instagram Pro & Facebook Pages)
 * Endpoint : GET /api/auth/meta/login?workspaceId=[workspaceId]
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId');

    // 1. Validation de la présence du workspaceId
    if (!workspaceId) {
      return NextResponse.json(
        {
          error: 'MISSING_WORKSPACE_ID',
          message: 'Le paramètre workspaceId est obligatoire pour initialiser la connexion Meta.',
        },
        { status: 400 }
      );
    }

    const clientId = process.env.META_CLIENT_ID || process.env.META_APP_ID || '916706431513072';
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const redirectUri = process.env.META_REDIRECT_URI || `${origin}/api/auth/callback/facebook`;

    // 2. Scopes requis pour publier, programmer et lire les statistiques Instagram Pro & Facebook Pages
    const scopes = [
      'pages_show_list',
      'pages_read_engagement',
      'pages_manage_posts',
      'instagram_basic',
      'instagram_content_publish',
      'instagram_manage_insights',
      'public_profile',
    ].join(',');

    // 3. Construction d'un paramètre state sécurisé avec Nonce CSRF et Horodatage
    const statePayload = {
      workspaceId,
      nonce: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
    };

    const state = Buffer.from(JSON.stringify(statePayload)).toString('base64url');

    // 4. Construction de l'URL d'autorisation officielle Meta Dialog OAuth v19.0
    const metaAuthUrl = new URL('https://www.facebook.com/v19.0/dialog/oauth');
    metaAuthUrl.searchParams.set('client_id', clientId);
    metaAuthUrl.searchParams.set('redirect_uri', redirectUri);
    metaAuthUrl.searchParams.set('scope', scopes);
    metaAuthUrl.searchParams.set('state', state);
    metaAuthUrl.searchParams.set('response_type', 'code');

    // 5. Redirection de l'utilisateur vers Meta pour accord des permissions
    return NextResponse.redirect(metaAuthUrl.toString());
  } catch (error: any) {
    console.error('❌ Erreur lors de l\'initialisation Meta OAuth :', error);
    return NextResponse.json(
      {
        error: 'META_AUTH_INIT_ERROR',
        message: error?.message || 'Impossible d\'initialiser la connexion Meta.',
      },
      { status: 500 }
    );
  }
}
