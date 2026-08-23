/**
 * CMFlow — Validation des Variables d'Environnement de Production
 * Empêche les pannes silencieuses et valide l'intégrité des clés d'API (Firebase, Meta, Wave, OM).
 */

export interface EnvValidationResult {
  isValid: boolean;
  isProductionReady: boolean;
  missingRequired: string[];
  missingRecommended: string[];
  configuredCount: number;
  totalCount: number;
  report: {
    category: string;
    items: {
      key: string;
      status: 'OK' | 'MISSING' | 'WARN_MOCK';
      description: string;
    }[];
  }[];
}

const ENV_SPECS = [
  {
    category: '🌐 Application & Sécurité de Base',
    vars: [
      { key: 'NEXT_PUBLIC_APP_URL', required: true, description: 'URL publique du SaaS' },
      { key: 'CRON_SECRET', required: true, description: 'Clé secrète du Cron Job Auto-Publish' },
    ],
  },
  {
    category: '🔥 Firebase Client SDK',
    vars: [
      { key: 'NEXT_PUBLIC_FIREBASE_API_KEY', required: true, description: 'Clé API Firebase Web' },
      { key: 'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN', required: true, description: 'Domaine d\'authentification' },
      { key: 'NEXT_PUBLIC_FIREBASE_PROJECT_ID', required: true, description: 'ID du projet Firebase' },
      { key: 'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET', required: true, description: 'Bucket Firebase Storage' },
      { key: 'NEXT_PUBLIC_FIREBASE_APP_ID', required: true, description: 'App ID Firebase' },
    ],
  },
  {
    category: '⚙️ Firebase Admin SDK (Serveur / API Routes)',
    vars: [
      { key: 'FIREBASE_PROJECT_ID', required: false, description: 'Projet Firebase Admin' },
      { key: 'FIREBASE_CLIENT_EMAIL', required: false, description: 'Compte de service Firebase' },
      { key: 'FIREBASE_PRIVATE_KEY', required: false, description: 'Clé privée RSA Firebase Admin' },
    ],
  },
  {
    category: '📱 Meta Graph API (Instagram & Facebook)',
    vars: [
      { key: 'META_CLIENT_ID', required: false, description: 'Meta App ID' },
      { key: 'META_CLIENT_SECRET', required: false, description: 'Secret d\'application Meta' },
    ],
  },
  {
    category: '🌊 Passerelle Mobile Money Wave Business',
    vars: [
      { key: 'WAVE_API_KEY', required: false, description: 'Clé secrète Wave API' },
      { key: 'WAVE_WEBHOOK_SECRET', required: false, description: 'Secret de signature Webhook Wave' },
    ],
  },
  {
    category: '🍊 Passerelle Orange Money Web Payment',
    vars: [
      { key: 'OM_CLIENT_ID', required: false, description: 'Orange Developer Client ID' },
      { key: 'OM_CLIENT_SECRET', required: false, description: 'Orange Developer Secret' },
      { key: 'OM_MERCHANT_KEY', required: false, description: 'Clé Marchand Orange Money' },
    ],
  },
];

/**
 * Valide l'ensemble des variables d'environnement actives
 */
export function validateEnvironment(): EnvValidationResult {
  const missingRequired: string[] = [];
  const missingRecommended: string[] = [];
  let configuredCount = 0;
  let totalCount = 0;

  const report = ENV_SPECS.map((group) => {
    const items = group.vars.map((v) => {
      totalCount++;
      const val = process.env[v.key];

      let status: 'OK' | 'MISSING' | 'WARN_MOCK' = 'OK';

      if (!val || val.trim() === '') {
        status = 'MISSING';
        if (v.required) {
          missingRequired.push(v.key);
        } else {
          missingRecommended.push(v.key);
        }
      } else if (
        val.includes('your_') ||
        val.includes('test_sec') ||
        val.includes('om_dev')
      ) {
        status = 'WARN_MOCK';
        configuredCount++;
      } else {
        configuredCount++;
      }

      return {
        key: v.key,
        status,
        description: v.description,
      };
    });

    return {
      category: group.category,
      items,
    };
  });

  const isProductionReady = missingRequired.length === 0;

  return {
    isValid: isProductionReady,
    isProductionReady,
    missingRequired,
    missingRecommended,
    configuredCount,
    totalCount,
    report,
  };
}

/**
 * Affiche un rapport visuel dans les logs du serveur
 */
export function printEnvCheckReport(): void {
  const res = validateEnvironment();

  console.log('\n======================================================');
  console.log('🚀 CMFlow — Rapport de Conformité des Variables Vercel');
  console.log('======================================================');

  res.report.forEach((group) => {
    console.log(`\n${group.category} :`);
    group.items.forEach((item) => {
      const icon =
        item.status === 'OK'
          ? '  ✅'
          : item.status === 'WARN_MOCK'
          ? '  ⚠️ (Dev/Test)'
          : '  ❌ MANQUANT';
      console.log(`${icon} ${item.key.padEnd(36)} — ${item.description}`);
    });
  });

  console.log('\n------------------------------------------------------');
  console.log(`Score de configuration : ${res.configuredCount}/${res.totalCount} variables`);
  if (res.isProductionReady) {
    console.log('✨ Statut : Prêt pour le déploiement Vercel');
  } else {
    console.warn(`⚠️ Attention : ${res.missingRequired.length} variable(s) obligatoire(s) manquante(s) !`);
  }
  console.log('======================================================\n');
}

// Exécution directe si exécuté via CLI (ex: node src/lib/envCheck.js)
if (typeof process !== 'undefined' && process.argv && process.argv[1]?.includes('envCheck')) {
  printEnvCheckReport();
}

export default validateEnvironment;
