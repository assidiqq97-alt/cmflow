import { NextRequest, NextResponse } from 'next/server';
import MetaOAuthService from '@/lib/metaOAuth';

export const dynamic = 'force-dynamic';

/**
 * Route d'Initiation OAuth2 Officielle Meta (Instagram Business & Facebook Pages)
 * Endpoint : GET /api/social/meta/login?workspaceId=[workspaceId]&redirectPath=[path]
 */
export async function GET(request: NextRequest) {
  try {
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const { searchParams } = new URL(request.url);

    const workspaceId = searchParams.get('workspaceId') || 'teranga-gourmet';
    const redirectPath = searchParams.get('redirectPath') || '/dashboard/settings/channels';

    // Construction de l'URL d'autorisation officielle Meta Dialog
    const authUrl = MetaOAuthService.buildAuthorizationUrl({
      workspaceId,
      origin,
      redirectPath,
    });

    console.log(`🔗 [Meta OAuth] Redirection vers Meta Dialog pour le workspace : ${workspaceId}`);
    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('❌ [Meta OAuth Login Error] :', error);
    const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
    const errorRedirect = new URL('/dashboard/settings/channels', origin);
    errorRedirect.searchParams.set('error', 'meta_login_failed');
    errorRedirect.searchParams.set('message', error?.message || 'Impossible d’initier la connexion Meta');
    return NextResponse.redirect(errorRedirect.toString());
  }
}
