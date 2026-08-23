/**
 * CMFlow — Serveur Local Node.js Ultra-Rapide (Zero Dépendance)
 * Permet de faire tourner le dashboard et tout le SaaS CMFlow en 1 clic.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const DEFAULT_PORT = 3000;
const CANDIDATE_PORTS = [3000, 3001, 8080, 8000, 5000, 4000];

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
};

const ROUTE_MAP = {
  '': 'index.html',
  'dashboard': 'dashboard.html',
  'admin': 'admin.html',
  'planning': 'planning.html',
  'billing': 'billing.html',
  'clients': 'clients.html',
  'analytics': 'analytics.html',
  'inbox': 'inbox.html',
  'settings': 'settings.html',
  'channels': 'channels.html',
  'settings/channels': 'channels.html',
  'dashboard/settings/channels': 'channels.html',
  'validation': 'validation.html',
  'startpage': 'startpage.html',
  'bio': 'startpage.html',
  'login': 'login.html',
  'register': 'register.html',
  'client-review': 'client-review.html',
  'media': 'media.html',
  'legal': 'legal.html',
  'onboarding': 'onboarding.html'
};

let activePort = DEFAULT_PORT;

function requestHandler(req, res) {
  // CORS Headers pour le dev local
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const parsedUrl = url.parse(req.url);
  let pathname = decodeURIComponent(parsedUrl.pathname).replace(/^\/+/, '');

  // Routes API Mocks locales
  if (pathname.startsWith('api/')) {
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    let jsonResp = { success: true, status: 'OK' };

    if (pathname.startsWith('api/auth/linkedin') || pathname.startsWith('api/social/linkedin/login')) {
      const q = url.parse(req.url, true).query;
      const workspaceId = q.workspaceId || 'teranga-gourmet';
      const redirectPath = q.redirectPath || '/channels.html';
      const redirectUri = `http://localhost:${activePort}/api/auth/callback/linkedin`;
      const clientId = process.env.LINKEDIN_CLIENT_ID || '77589j7j2nnfkw';
      const scope = 'openid profile email w_member_social';
      const state = encodeURIComponent(JSON.stringify({ workspaceId, redirectPath }));
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&state=${state}&scope=${encodeURIComponent(scope)}`;

      res.writeHead(302, { Location: authUrl });
      res.end();
      return;
    } else if (pathname.startsWith('api/auth/callback/linkedin') || pathname.startsWith('api/social/linkedin/callback')) {
      const q = url.parse(req.url, true).query;
      let target = '/channels.html';
      if (q.state) {
        try {
          const stateObj = JSON.parse(decodeURIComponent(q.state));
          if (stateObj.redirectPath) target = stateObj.redirectPath;
        } catch (e) {}
      }
      res.writeHead(302, { Location: `${target}?connected=linkedin&status=success&provider=linkedin` });
      res.end();
      return;
    } else if (pathname.startsWith('api/auth/facebook') || pathname.startsWith('api/social/meta/login') || pathname.startsWith('api/auth/meta/login')) {
      const q = url.parse(req.url, true).query;
      const workspaceId = q.workspaceId || 'teranga-gourmet';
      const redirectUri = `http://localhost:${activePort}/api/auth/callback/facebook`;
      const appId = process.env.META_APP_ID || process.env.META_CLIENT_ID || '916706431513072';
      const scopes = 'pages_show_list,pages_read_engagement,pages_manage_posts,instagram_basic,instagram_content_publish,instagram_manage_insights';
      const state = Buffer.from(JSON.stringify({ workspaceId, redirectPath: '/channels.html' })).toString('base64url');
      const authUrl = `https://www.facebook.com/v19.0/dialog/oauth?client_id=${appId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&response_type=code&state=${state}`;

      res.writeHead(302, { Location: authUrl });
      res.end();
      return;
    } else if (pathname.startsWith('api/auth/callback/facebook') || pathname.startsWith('api/social/meta/callback') || pathname.startsWith('api/auth/meta/callback')) {
      const q = url.parse(req.url, true).query;
      const stateObj = q.state ? JSON.parse(Buffer.from(q.state, 'base64url').toString('utf8')) : {};
      const target = stateObj.redirectPath || '/channels.html';
      res.writeHead(302, { Location: `${target}?status=success&connected_count=2&provider=meta` });
      res.end();
      return;
    } else if (pathname.startsWith('api/social/meta/accounts')) {
      jsonResp = {
        success: true,
        count: 2,
        accounts: [
          {
            id: 'ig_teranga_pro',
            accountId: '17841405822384910',
            workspaceId: 'teranga-gourmet',
            name: 'Teranga Gourmet Instagram Pro',
            username: '@terangagourmet.sn',
            avatar: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200&h=200&fit=crop',
            type: 'instagram',
            accessToken: 'EAAG_mock_token_60d',
            expiresAt: new Date(Date.now() + 60*24*60*60*1000).toISOString(),
            status: 'connected',
            followersCount: 14200,
            autoPublishEnabled: true,
            permissions: ['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          },
          {
            id: 'fb_teranga_page',
            accountId: '109283746592019',
            workspaceId: 'teranga-gourmet',
            name: 'Teranga Gourmet Facebook Page',
            avatar: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=200&h=200&fit=crop',
            type: 'facebook',
            accessToken: 'EAAG_page_token_60d',
            expiresAt: new Date(Date.now() + 60*24*60*60*1000).toISOString(),
            status: 'connected',
            category: 'Restaurant & Gastronomie',
            followersCount: 28500,
            autoPublishEnabled: true,
            permissions: ['pages_show_list', 'pages_read_engagement', 'pages_manage_posts'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }
        ]
      };
    } else if (pathname.startsWith('api/social/meta/disconnect')) {
      jsonResp = { success: true, message: 'Compte déconnecté avec succès' };
    } else if (pathname.startsWith('api/analytics/sync')) {
      jsonResp = {
        success: true,
        workspaceId: 'teranga-gourmet',
        accountInsights: {
          impressions: 148500,
          reach: 92400,
          profileViews: 12800,
          followerCount: 14200,
          followsCount: 340,
          mediaCount: 128,
          websiteClicks: 3420,
          engagementRate: 5.8,
          syncedAt: new Date().toISOString()
        },
        syncedPostsCount: 12,
        timestamp: new Date().toISOString()
      };
    } else if (pathname.startsWith('api/posts/publish')) {
      jsonResp = {
        success: true,
        postId: 'post_instant_' + Date.now(),
        status: 'PUBLISHED',
        publishedAt: new Date().toISOString(),
        externalPostIds: {
          instagram: '178414_' + Date.now(),
          facebook: '10928_' + Date.now()
        },
        results: [
          { platform: 'instagram', success: true, postId: '178414_' + Date.now(), permalink: 'https://www.instagram.com/p/mock_post/' },
          { platform: 'facebook', success: true, postId: '10928_' + Date.now(), permalink: 'https://www.facebook.com/mock_post' }
        ]
      };
    } else if (pathname.startsWith('api/billing/wave/checkout')) {
      jsonResp = {
        success: true,
        wave_launch_url: 'https://pay.wave.com/m/mock_checkout_cmflow',
        amount: 15000,
        currency: 'XOF'
      };
    } else if (pathname.startsWith('api/billing/om/confirm')) {
      jsonResp = {
        success: true,
        status: 'ACTIVE',
        message: 'Prélèvement Orange Money validé avec succès ! Votre compte est actif.',
        orderId: 'OM_CMF_LOCAL_CONFIRMED'
      };
    } else if (pathname.startsWith('api/billing/om/checkout')) {
      jsonResp = {
        success: true,
        payment_url: 'https://webpayment.orange-money.com/pay?token=om_ptk_mock_123',
        pay_token: 'om_ptk_mock_123',
        order_id: 'OM_CMF_LOCAL_123',
        currency: 'OUV',
        ussd_code: '#144#391#'
      };
    } else if (pathname.startsWith('api/cron/publish')) {
      jsonResp = {
        success: true,
        message: 'Publication automatique exécutée.',
        publishedCount: 2
      };
    } else if (pathname === 'api/health' || pathname === 'api/health/') {
      jsonResp = {
        status: 'HEALTHY',
        timestamp: new Date().toISOString(),
        executionTimeMs: 4,
        app: {
          name: 'CMFlow',
          version: '2.4.0',
          environment: 'development',
          publicUrl: 'http://localhost:' + activePort
        },
        checks: {
          environment: { status: 'OK', isProductionReady: true, configuredCount: 15, totalCount: 15 },
          firestore: { status: 'OK', mode: 'Admin SDK / Local Resilient', latencyMs: 2 },
          socialPublishing: {
            status: 'OPERATIONAL',
            modules: { instagramPublisher: 'READY', facebookPublisher: 'READY', metaAnalyticsService: 'READY' },
            metaApiConfigured: true,
            metaGraphVersion: 'v19.0'
          },
          billingGateways: {
            wave: { status: 'CONFIGURED', currency: 'XOF (FCFA)' },
            orangeMoney: { status: 'CONFIGURED', currency: 'XOF / OUV' }
          },
          securityAudit: {
            status: 'PASSED_SECURE',
            exposedSecretsCount: 0,
            thirdPartyCallsIsolatedOnServer: true
          }
        }
      };
    } else if (pathname.startsWith('api/health/env')) {
      jsonResp = {
        isValid: true,
        status: 'OK',
        configuredCount: 15,
        totalCount: 15
      };
    }

    res.writeHead(200);
    res.end(JSON.stringify(jsonResp));
    return;
  }

  // Rewrite URLs propres
  if (pathname.startsWith('v/') || pathname.startsWith('approve/')) {
    pathname = 'client-review.html';
  } else {
    const cleanPath = pathname.replace(/\/$/, '');
    if (ROUTE_MAP[cleanPath]) {
      pathname = ROUTE_MAP[cleanPath];
    }
  }

  // Résolution du fichier local
  const baseDir = __dirname;
  const filePath = path.join(baseDir, pathname);
  const normalizedPath = path.normalize(filePath);

  // Sécurité anti-traversal
  if (!normalizedPath.startsWith(baseDir)) {
    res.writeHead(403, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>403 Forbidden</h1>');
    return;
  }

  fs.stat(normalizedPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`
        <!DOCTYPE html>
        <html lang="fr">
        <head><meta charset="utf-8"><title>Page non trouvée · CMFlow</title>
        <style>body{font-family:sans-serif;background:#0F172A;color:white;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;}
        .box{text-align:center;padding:40px;background:rgba(255,255,255,0.05);border-radius:24px;border:1px solid rgba(255,255,255,0.1);}
        a{color:#F94F06;font-weight:bold;text-decoration:none;}</style></head>
        <body><div class="box">
          <h1>404 · Page Introuvable</h1>
          <p>La page demandée n'existe pas ou a été déplacée.</p>
          <p><a href="/dashboard.html">👉 Revenir au Dashboard</a></p>
        </div></body></html>
      `);
      return;
    }

    const ext = path.extname(normalizedPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'X-Content-Type-Options': 'nosniff'
    });

    const stream = fs.createReadStream(normalizedPath);
    stream.pipe(res);
  });
}

function startServer(portIndex = 0) {
  if (portIndex >= CANDIDATE_PORTS.length) {
    console.error('❌ Impossible de trouver un port libre pour le serveur CMFlow.');
    process.exit(1);
  }

  const port = CANDIDATE_PORTS[portIndex];
  const server = http.createServer(requestHandler);

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`⚠️ Port ${port} déjà utilisé, essai du port suivant...`);
      startServer(portIndex + 1);
    } else {
      console.error('Erreur serveur:', err);
    }
  });

  server.once('listening', () => {
    activePort = port;
    console.log('\n=================================================');
    console.log('🚀 CMFlow Serveur Local Opérationnel !');
    console.log(`👉 Accueil       : http://localhost:${port}/`);
    console.log(`👉 Dashboard     : http://localhost:${port}/dashboard.html`);
    console.log(`👉 Planning      : http://localhost:${port}/planning.html`);
    console.log(`👉 Admin Panel   : http://localhost:${port}/admin.html`);
    console.log(`👉 Facturation   : http://localhost:${port}/billing.html`);
    console.log('=================================================\n');
  });

  server.listen(port, '0.0.0.0');
}

startServer();
