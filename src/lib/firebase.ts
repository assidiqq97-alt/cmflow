import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';
import { getAuth, Auth } from 'firebase/auth';

/**
 * CMFlow — Configuration Firebase Client (Next.js App Router)
 * Utilise les variables d'environnement NEXT_PUBLIC_FIREBASE_*
 */
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyD3Bje7pVeHPCP41pF9PLgnXlBxXBok7Fc',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'cmflow-dc0d6.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cmflow-dc0d6',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'cmflow-dc0d6.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '133931483094',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:133931483094:web:e2678150c3b8155f06ae77',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-Z93LLXE0QK',
};

// Initialisation sécurisée en Singleton pour Next.js (SSR & Fast Refresh)
let app: FirebaseApp;
let db: Firestore;
let storage: FirebaseStorage;
let auth: Auth;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

db = getFirestore(app);
storage = getStorage(app);
auth = getAuth(app);

export { app, db, storage, auth, firebaseConfig };
export default app;
