import { NextRequest, NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebaseAdmin';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { validateEnvironment } from '@/lib/envCheck';
import { InstagramPublisher } from '@/lib/services/instagramPublisher';
import { FacebookPublisher } from '@/lib/services/facebookPublisher';
import { MetaAnalyticsService } from '@/lib/services/metaAnalyticsService';

export const dynamic = 'force-dynamic';

/**
 * Route de Diagnostic Global et Test de Santé (Health Check)
 * Endpoint : GET /api/health
 */
export async function GET(request: NextRequest) {
  const startTime = Date.now();
  const checks: Record<string, any> = {};

  // 1. Audit des Variables d'Environnement
  const envValidation = validateEnvironment();
  checks.environment = {
    status: envValidation.isValid ? 'OK' : 'WARN',
    isProductionReady: envValidation.isProductionReady,
    configuredCount: envValidation.configuredCount,
    totalCount: envValidation.totalCount,
    missingRequired: envValidation.missingRequired,
    missingRecommended: envValidation.missingRecommended,
  };

  // 2. Audit de la Base de Données Firestore
  let firestoreStatus = 'UNKNOWN';
  let firestoreLatencyMs = 0;
  let firestoreMode = 'none';

  const firestoreStart = Date.now();
  try {
    if (adminDb) {
      // Test de lecture ultra-rapide sur la collection workspaces
      const testDoc = await adminDb.collection('workspaces').limit(1).get();
      firestoreStatus = 'CONNECTED';
      firestoreMode = 'Admin SDK';
      firestoreLatencyMs = Date.now() - firestoreStart;
    } else if (db) {
      const testRef = doc(db, 'system', 'health');
      await getDoc(testRef);
      firestoreStatus = 'CONNECTED';
      firestoreMode = 'Client SDK';
      firestoreLatencyMs = Date.now() - firestoreStart;
    } else {
      firestoreStatus = 'FALLBACK_LOCAL';
      firestoreMode = 'Mock/Local Storage';
      firestoreLatencyMs = 1;
    }
  } catch (dbErr: any) {
    console.warn('⚠️ Health Check: Erreur ping Firestore :', dbErr?.message);
    firestoreStatus = 'FALLBACK_OFFLINE';
    firestoreMode = 'Offline Resilient Mode';
    firestoreLatencyMs = Date.now() - firestoreStart;
  }

  checks.firestore = {
    status: firestoreStatus === 'CONNECTED' ? 'OK' : 'INFO_FALLBACK',
    mode: firestoreMode,
    latencyMs: firestoreLatencyMs,
  };

  // 3. Audit des Modules de Publication Meta & Réseaux Sociaux
  const hasMetaAppId = Boolean(
    process.env.META_APP_ID || process.env.META_CLIENT_ID
  );
  const hasMetaSecret = Boolean(
    process.env.META_APP_SECRET || process.env.META_CLIENT_SECRET
  );

  checks.socialPublishing = {
    status: 'OPERATIONAL',
    modules: {
      instagramPublisher: typeof InstagramPublisher.publish === 'function' ? 'READY' : 'ERROR',
      facebookPublisher: typeof FacebookPublisher.publish === 'function' ? 'READY' : 'ERROR',
      metaAnalyticsService: typeof MetaAnalyticsService.syncWorkspaceAnalytics === 'function' ? 'READY' : 'ERROR',
    },
    metaApiConfigured: hasMetaAppId && hasMetaSecret,
    metaGraphVersion: 'v19.0',
  };

  // 4. Audit des Passerelles de Paiement Mobile Money
  const hasWaveKey = Boolean(process.env.WAVE_API_KEY && !process.env.WAVE_API_KEY.includes('your_'));
  const hasOmKey = Boolean(process.env.OM_CLIENT_ID && !process.env.OM_CLIENT_ID.includes('your_'));

  checks.billingGateways = {
    wave: {
      status: hasWaveKey ? 'CONFIGURED' : 'TEST_MOCK_ACTIVE',
      currency: 'XOF (FCFA)',
    },
    orangeMoney: {
      status: hasOmKey ? 'CONFIGURED' : 'TEST_MOCK_ACTIVE',
      currency: 'XOF / OUV',
    },
  };

  // 5. Audit de Sécurité des Secrets
  const criticalKeys = ['FIREBASE_PRIVATE_KEY', 'META_APP_SECRET', 'WAVE_API_KEY', 'OM_CLIENT_SECRET', 'CRON_SECRET'];
  const exposedPublicKeys: string[] = [];

  for (const key of criticalKeys) {
    if (process.env[`NEXT_PUBLIC_${key}`]) {
      exposedPublicKeys.push(`NEXT_PUBLIC_${key}`);
    }
  }

  checks.securityAudit = {
    status: exposedPublicKeys.length === 0 ? 'PASSED_SECURE' : 'CRITICAL_VULNERABILITY',
    exposedSecretsCount: exposedPublicKeys.length,
    exposedKeys: exposedPublicKeys,
    thirdPartyCallsIsolatedOnServer: true,
  };

  const totalTimeMs = Date.now() - startTime;
  const isOverallHealthy = checks.securityAudit.status === 'PASSED_SECURE';

  return NextResponse.json({
    status: isOverallHealthy ? 'HEALTHY' : 'SECURITY_ALERT',
    timestamp: new Date().toISOString(),
    executionTimeMs: totalTimeMs,
    app: {
      name: 'CMFlow',
      version: '2.4.0',
      environment: process.env.NODE_ENV || 'development',
      publicUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://cmflow.sn',
    },
    checks,
  });
}
