/**
 * CMFlow — Firebase Configuration & Initialization
 * Ce fichier initialise Firebase App, Auth et Firestore.
 * 
 * IMPORTANT : Remplacez les valeurs ci-dessous par celles de votre projet Firebase.
 * Pour obtenir votre configuration :
 *   1. Allez sur https://console.firebase.google.com
 *   2. Créez un nouveau projet (ou utilisez un existant)
 *   3. Ajoutez une application Web
 *   4. Copiez les valeurs firebaseConfig
 */

'use strict';

// ========================================================================
// CONFIGURATION FIREBASE — À REMPLACER AVEC VOS PROPRES VALEURS
// ========================================================================
const firebaseConfig = {
  apiKey: "AIzaSyD3Bje7pVeHPCP41pF9PLgnXlBxXBok7Fc",
  authDomain: "cmflow-dc0d6.firebaseapp.com",
  projectId: "cmflow-dc0d6",
  storageBucket: "cmflow-dc0d6.firebasestorage.app",
  messagingSenderId: "133931483094",
  appId: "1:133931483094:web:e2678150c3b8155f06ae77",
  measurementId: "G-Z93LLXE0QK"
};

// ========================================================================
// CONFIGURATION OFFICIELLE DES APIS RÉSEAUX SOCIAUX
// ========================================================================
const CMFlowSocialConfig = {
  linkedin: {
    clientId: "77589j7j2nnfkw",
    clientSecret: "", // Conservé côté serveur sécurisé (OAuth backend)
    scope: "w_member_social openid profile email",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization"
  },
  meta: {
    appId: "4528780004104334",
    version: "v19.0"
  }
};

// ========================================================================
// INITIALISATION FIREBASE
// ========================================================================
let cmfireApp = null;
let cmfireDb = null;
let cmfireAuth = null;
let cmfireReady = false;

try {
  // Vérifier que les SDK Firebase sont chargés
  if (typeof firebase === 'undefined') {
    console.warn('⚠️ Firebase SDK non chargé. CMFlow fonctionnera en mode localStorage uniquement.');
  } else {
    // Ne pas ré-initialiser si déjà fait
    if (!firebase.apps || firebase.apps.length === 0) {
      // Vérifier que la config est renseignée
      if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'VOTRE_API_KEY') {
        cmfireApp = firebase.initializeApp(firebaseConfig);
        cmfireAuth = firebase.auth();
        cmfireDb = firebase.firestore();

        // Activer la persistance hors-ligne Firestore (cache local)
        cmfireDb.enablePersistence({ synchronizeTabs: true }).catch((err) => {
          if (err.code === 'failed-precondition') {
            console.warn('⚠️ Persistance Firestore : plusieurs onglets ouverts, seul un onglet peut activer la persistance.');
          } else if (err.code === 'unimplemented') {
            console.warn('⚠️ Persistance Firestore non supportée par ce navigateur.');
          }
        });

        cmfireReady = true;
        console.log('✅ Firebase initialisé avec succès (Firestore + Auth)');
      } else {
        console.warn('⚠️ Configuration Firebase non renseignée. Éditez js/firebase-config.js avec vos clés.');
        console.warn('   → Créez un projet sur https://console.firebase.google.com');
      }
    } else {
      cmfireApp = firebase.app();
      cmfireAuth = firebase.auth();
      cmfireDb = firebase.firestore();
      cmfireReady = true;
    }
  }
} catch (err) {
  console.error('❌ Erreur initialisation Firebase:', err);
  console.warn('CMFlow fonctionnera en mode localStorage uniquement.');
}

// ========================================================================
// HELPERS FIRESTORE (utilisés par CMFlowStore et CMFlowBackend)
// ========================================================================

/**
 * Retourne l'UID de l'utilisateur connecté via Firebase Auth, ou null.
 */
function cmfireGetUid() {
  if (!cmfireReady || !cmfireAuth) return null;
  const user = cmfireAuth.currentUser;
  return user ? user.uid : null;
}

/**
 * Vérifie si Firebase est prêt et qu'un utilisateur est connecté.
 */
function cmfireIsOnline() {
  return cmfireReady && cmfireAuth && cmfireAuth.currentUser !== null;
}

/**
 * Retourne la référence au document utilisateur principal.
 */
function cmfireUserDocRef(uid) {
  if (!cmfireDb || !uid) return null;
  return cmfireDb.collection('users').doc(uid);
}

/**
 * Retourne la référence à une sous-collection de l'utilisateur.
 */
function cmfireUserCollectionRef(uid, subcollection) {
  const userDoc = cmfireUserDocRef(uid);
  if (!userDoc) return null;
  return userDoc.collection(subcollection);
}
