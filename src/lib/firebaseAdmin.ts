import * as admin from 'firebase-admin';

/**
 * CMFlow — Firebase Admin SDK (Server-Side / Next.js Route Handlers)
 * Permet les opérations sécurisées sur Firestore et Auth côté serveur.
 */

if (!admin.apps.length) {
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'cmflow-dc0d6';
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY
    ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    : undefined;

  try {
    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: `${projectId}.firebasestorage.app`,
      });
    } else {
      admin.initializeApp({
        projectId,
      });
    }
  } catch (initErr) {
    // Ignored in build-time static generation
  }
}

let firestoreInstance: any = null;
try {
  firestoreInstance = admin.apps.length ? admin.firestore() : null;
} catch (e) {}

export const adminDb = firestoreInstance as any;
export const db = adminDb;
export const adminAuth = (admin.apps.length ? admin.auth() : null) as any;
export const adminStorage = (admin.apps.length ? admin.storage() : null) as any;
export default admin;
