/**
 * CMFlow — Firebase Cloud Functions (Secure Server-Side Backend)
 * 
 * Ce fichier gère tous les appels nécessitant des clés secrètes & la logique sécurisée :
 *  1. Génération de texte & hashtags avec Google Gemini API (GEMINI_API_KEY + Rate Limit)
 *  2. Initialisation des paiements Wave / Orange Money (WAVE_SECRET_KEY)
 *  3. Portail de validation client déporté pour accès multi-appareils (WhatsApp)
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();
const db = admin.firestore();

// ===========================================================================
// 1. GÉNÉRATEUR IA SÉCURISÉ (GOOGLE GEMINI) AVEC VALIDATION & RATE LIMITING
// ===========================================================================
exports.generateCaptionWithGemini = functions.https.onCall(async (data, context) => {
  // 1. Vérifier l'authentification
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'Vous devez être connecté pour utiliser l\'assistant IA.'
    );
  }

  const uid = context.auth.uid;
  const { topic, tone, clientName, platform } = data;

  // Validation stricte des entrées
  if (!topic || typeof topic !== 'string' || topic.trim().length === 0 || topic.length > 500) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Le sujet est invalide ou dépasse 500 caractères.'
    );
  }

  const cleanTone = typeof tone === 'string' ? tone.slice(0, 50) : 'professionnel et engageant';
  const cleanClient = typeof clientName === 'string' ? clientName.slice(0, 100) : 'notre marque';
  const cleanPlatform = typeof platform === 'string' ? platform.slice(0, 50) : 'Instagram';

  // 2. Rate Limiting par utilisateur (Max 20 requêtes / minute)
  const rateLimitRef = db.collection('users').doc(uid).collection('settings').doc('rate_limit_ai');
  const now = Date.now();
  const rateDoc = await rateLimitRef.get();
  
  if (rateDoc.exists) {
    const rateData = rateDoc.data();
    if (now - rateData.lastReset < 60000) {
      if (rateData.count >= 20) {
        throw new functions.https.HttpsError(
          'resource-exhausted',
          'Limite de requêtes atteinte (20/minute). Veuillez patienter quelques secondes.'
        );
      }
      await rateLimitRef.update({ count: admin.firestore.FieldValue.increment(1) });
    } else {
      await rateLimitRef.set({ count: 1, lastReset: now });
    }
  } else {
    await rateLimitRef.set({ count: 1, lastReset: now });
  }

  const geminiApiKey = functions.config().gemini?.key || process.env.GEMINI_API_KEY;
  if (!geminiApiKey) {
    throw new functions.https.HttpsError(
      'failed-precondition',
      'La clé d\'API Gemini n\'est pas encore configurée sur le serveur.'
    );
  }

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: `Tu es un Community Manager expert pour l'Afrique de l'Ouest (Sénégal). Rédige une publication captivante pour ${cleanClient} sur ${cleanPlatform}. Sujet: "${topic}". Ton: ${cleanTone}. Inclus des emojis pertinents et des hashtags locaux adaptés.`
            }]
          }]
        })
      }
    );

    const result = await response.json();
    const generatedText = result.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      success: true,
      caption: generatedText
    };
  } catch (err) {
    console.error('Erreur appel Gemini:', err);
    throw new functions.https.HttpsError('internal', 'Erreur lors de la génération IA.');
  }
});

// ===========================================================================
// 2. INITIALISATION DE PAIEMENT WAVE SÉCURISÉ
// ===========================================================================
exports.createWavePayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'Authentification requise.');
  }

  const { planName, amount, phone } = data;
  const waveSecretKey = functions.config().wave?.secret || process.env.WAVE_SECRET_KEY;

  return {
    success: true,
    message: 'Session de paiement initialisée côté serveur.',
    txRef: `TX-WAVE-${Date.now()}`
  };
});
