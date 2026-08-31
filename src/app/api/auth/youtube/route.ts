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
    const clientId = (
      process.env.YOUTUBE_CLIENT_ID ||
      process.env.GOOGLE_CLIENT_ID ||
      process.env.NEXT_PUBLIC_YOUTUBE_CLIENT_ID ||
      ''
    ).trim();
    const redirectUri = `${origin}/api/auth/callback/youtube`;

    if (!clientId) {
      console.warn('⚠️ [YouTube OAuth] YOUTUBE_CLIENT_ID est manquant.');
      return new Response(
        `<!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Configuration YouTube requise — CMFlow</title>
          <script src="https://cdn.tailwindcss.com"></script>
        </head>
        <body class="bg-slate-900 text-slate-100 flex items-center justify-center min-h-screen p-4 font-sans antialiased">
          <div class="max-w-md w-full bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center">
            <div class="w-14 h-14 rounded-2xl bg-red-500/20 text-red-500 border border-red-500/30 flex items-center justify-center mx-auto text-2xl font-black">
              🎬
            </div>
            <div>
              <h1 class="text-xl font-black text-white">Clé YouTube en attente</h1>
              <p class="text-xs text-slate-400 mt-2 leading-relaxed">
                La variable <code class="bg-slate-900 px-2 py-0.5 rounded text-amber-400 font-mono">YOUTUBE_CLIENT_ID</code> n'a pas encore été rechargée par Vercel.
              </p>
            </div>
            <div class="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/60 text-left space-y-2 text-xs">
              <div class="font-bold text-slate-300">Vérification rapide :</div>
              <ul class="list-disc list-inside text-slate-400 space-y-1 text-[11px]">
                <li>Sur Vercel &gt; Settings &gt; Environment Variables : le nom doit être exactement <b class="text-white font-mono">YOUTUBE_CLIENT_ID</b>.</li>
                <li>Vérifiez que les cases <b>Production</b> et <b>Preview</b> sont cochées.</li>
                <li>Cliquez sur <b>Redeploy</b> sur Vercel pour activer immédiatement la clé.</li>
              </ul>
            </div>
            <a href="/dashboard/settings/channels" class="block w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#F94F06] to-amber-500 hover:opacity-90 text-white text-xs font-extrabold shadow-lg transition">
              ← Retour aux Réseaux Connectés
            </a>
          </div>
        </body>
        </html>`,
        {
          status: 200,
          headers: { 'Content-Type': 'text/html; charset=utf-8' },
        }
      );
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
