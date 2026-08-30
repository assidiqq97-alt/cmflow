import { NextRequest, NextResponse } from 'next/server';
import MetaOAuthService from '@/lib/metaOAuth';

export const dynamic = 'force-dynamic';

/**
 * CMFlow — Initialisation du flux OAuth 2.0 Meta (Facebook + Instagram)
 * Route : GET /api/auth/meta?workspaceId=...&redirectPath=...
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const workspaceId = searchParams.get('workspaceId') || 'default-workspace';
    const redirectPath = searchParams.get('redirectPath') || '/channels.html';
    const origin = new URL(request.url).origin;

    const authUrl = MetaOAuthService.buildAuthorizationUrl({
      workspaceId,
      origin,
      redirectPath,
    });

    return NextResponse.redirect(authUrl);
  } catch (error: any) {
    console.error('❌ Erreur initialisation OAuth Meta:', error);
    return NextResponse.json(
      { error: "Impossible d'initier la connexion Meta", details: error.message },
      { status: 500 }
    );
  }
}
