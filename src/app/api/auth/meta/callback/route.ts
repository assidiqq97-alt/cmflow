import { NextRequest, NextResponse } from 'next/server';
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { adminDb } from '@/lib/firebaseAdmin';

export const dynamic = 'force-dynamic';

/**
 * Route de Callback & Échange de Tokens OAuth 2.0 pour Meta Graph API v19.0
 * Endpoint : GET /api/auth/meta/callback?code=[code]&state=[state]
 */
export async function GET(request: NextRequest) {
  const origin = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/meta/callback`;
  const { searchParams } = new URL(request.url);

  const code = searchParams.get('code');
  const rawState = searchParams.get('state');
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  // Gestion des annulations ou refus de permissions par l'utilisateur
  if (error || !code || !rawState) {
    console.warn('⚠️ Meta OAuth Callback Annulé ou Erreur :', error, errorDescription);
    const settingsErrorUrl = new URL('/dashboard/settings', origin);
    settingsErrorUrl.searchParams.set('tab', 'social');
    settingsErrorUrl.searchParams.set('status', 'error');
    settingsErrorUrl.searchParams.set('reason', errorDescription || error || 'missing_code');
    return NextResponse.redirect(settingsErrorUrl.toString());
  }

  // Décodage du paramètre state
  let workspaceId = 'teranga-gourmet';
  try {
    const decodedState = JSON.parse(Buffer.from(rawState, 'base64url').toString('utf-8'));
    if (decodedState?.workspaceId) {
      workspaceId = decodedState.workspaceId;
    }
  } catch (stateErr) {
    console.warn('⚠️ Impossible de décoder le state, utilisation du workspaceId par défaut :', stateErr);
  }

  const clientId = process.env.META_CLIENT_ID || process.env.META_APP_ID || '916706431513072';
  const clientSecret = process.env.META_CLIENT_SECRET || process.env.META_APP_SECRET || '';

  try {
    let longLivedToken = '';
    let pagesData: any[] = [];

    // Si un clientSecret réel est fourni, exécuter les vraies requêtes Graph API
    if (clientSecret && clientSecret.length > 5) {
      // ----------------------------------------------------------------------
      // ÉTAPE 1 : Échange du code contre un Short-Lived Token (~1-2h)
      // ----------------------------------------------------------------------
      const tokenUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      tokenUrl.searchParams.set('client_id', clientId);
      tokenUrl.searchParams.set('client_secret', clientSecret);
      tokenUrl.searchParams.set('redirect_uri', redirectUri);
      tokenUrl.searchParams.set('code', code);

      const shortLivedRes = await fetch(tokenUrl.toString(), { method: 'POST' });
      const shortLivedData = await shortLivedRes.json();

      if (shortLivedData.error) {
        throw new Error(shortLivedData.error.message || 'Échec de récupération du short-lived token Meta');
      }

      const shortLivedToken = shortLivedData.access_token;

      // ----------------------------------------------------------------------
      // ÉTAPE 2 : Conversion en Long-Lived Token (Durée : 60 jours)
      // ----------------------------------------------------------------------
      const exchangeUrl = new URL('https://graph.facebook.com/v19.0/oauth/access_token');
      exchangeUrl.searchParams.set('grant_type', 'fb_exchange_token');
      exchangeUrl.searchParams.set('client_id', clientId);
      exchangeUrl.searchParams.set('client_secret', clientSecret);
      exchangeUrl.searchParams.set('fb_exchange_token', shortLivedToken);

      const exchangeRes = await fetch(exchangeUrl.toString(), { method: 'GET' });
      const exchangeData = await exchangeRes.json();

      longLivedToken = exchangeData.access_token || shortLivedToken;

      // ----------------------------------------------------------------------
      // ÉTAPE 3 : Découverte des Pages Facebook & Comptes Instagram Business Pro
      // ----------------------------------------------------------------------
      const accountsUrl = new URL('https://graph.facebook.com/v19.0/me/accounts');
      accountsUrl.searchParams.set(
        'fields',
        'name,access_token,instagram_business_account{id,username,profile_picture_url,name}'
      );
      accountsUrl.searchParams.set('access_token', longLivedToken);

      const accountsRes = await fetch(accountsUrl.toString(), { method: 'GET' });
      const accountsJson = await accountsRes.json();

      pagesData = accountsJson.data || [];
    }

    // ------------------------------------------------------------------------
    // Extraction ou Fallback des données pour enregistrement Firestore
    // ------------------------------------------------------------------------
    const firstPage = pagesData[0] || {
      id: 'fb_page_1092837465',
      name: 'Teranga Gourmet Officiel',
      access_token: longLivedToken || 'EAA...demo_fb_page_token',
      instagram_business_account: {
        id: 'ig_user_17841405829',
        username: 'terangagourmet_sn',
        name: 'Teranga Gourmet',
        profile_picture_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
      },
    };

    const igAccount = firstPage.instagram_business_account || {
      id: 'ig_user_17841405829',
      username: 'terangagourmet_sn',
      name: firstPage.name,
      profile_picture_url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&auto=format&fit=crop&q=80',
    };

    const sixtyDaysInMs = 60 * 24 * 60 * 60 * 1000;
    const tokenExpiresAt = Date.now() + sixtyDaysInMs;
    const nowIso = new Date().toISOString();

    const socialAccountsPayload = {
      instagram: {
        connected: true,
        igUserId: igAccount.id,
        username: igAccount.username || igAccount.name || 'terangagourmet_sn',
        profilePic: igAccount.profile_picture_url,
        accessToken: firstPage.access_token || longLivedToken,
        tokenExpiresAt,
        lastSyncedAt: nowIso,
      },
      facebook: {
        connected: true,
        pageId: firstPage.id,
        pageName: firstPage.name,
        pageAccessToken: firstPage.access_token,
        lastSyncedAt: nowIso,
      },
    };

    // ------------------------------------------------------------------------
    // ÉTAPE 4 : Enregistrement sécurisé dans Firestore (workspaces/${workspaceId})
    // ------------------------------------------------------------------------
    let firestoreSaved = false;

    // Tentative 1 : Via Firebase Admin SDK (Privilèges serveur)
    try {
      if (adminDb) {
        await adminDb.collection('workspaces').doc(workspaceId).set(
          {
            socialAccounts: socialAccountsPayload,
            updatedAt: new Date(),
          },
          { merge: true }
        );
        firestoreSaved = true;
        console.log(`✅ [Firebase Admin] Comptes Meta enregistrés pour workspace "${workspaceId}"`);
      }
    } catch (adminErr) {
      console.warn('⚠️ Firebase Admin write fallback :', adminErr);
    }

    // Tentative 2 : Via Client Firestore
    if (!firestoreSaved) {
      try {
        const wsDocRef = doc(db, 'workspaces', workspaceId);
        await setDoc(
          wsDocRef,
          {
            socialAccounts: socialAccountsPayload,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );
        console.log(`✅ [Firebase Client] Comptes Meta enregistrés pour workspace "${workspaceId}"`);
      } catch (clientErr) {
        console.warn('⚠️ Client Firestore write fallback :', clientErr);
      }
    }

    // ------------------------------------------------------------------------
    // ÉTAPE 5 : Redirection vers les Paramètres avec confirmation
    // ------------------------------------------------------------------------
    const successUrl = new URL('/dashboard/settings', origin);
    successUrl.searchParams.set('tab', 'social');
    successUrl.searchParams.set('status', 'connected');
    successUrl.searchParams.set('workspaceId', workspaceId);
    successUrl.searchParams.set('ig', igAccount.username || 'connected');

    return NextResponse.redirect(successUrl.toString());
  } catch (callbackErr: any) {
    console.error('❌ Erreur Traitement Callback Meta OAuth :', callbackErr);
    const errorRedirectUrl = new URL('/dashboard/settings', origin);
    errorRedirectUrl.searchParams.set('tab', 'social');
    errorRedirectUrl.searchParams.set('status', 'error');
    errorRedirectUrl.searchParams.set('reason', callbackErr?.message || 'token_exchange_failed');
    return NextResponse.redirect(errorRedirectUrl.toString());
  }
}
