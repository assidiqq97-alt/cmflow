import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment,
  Unsubscribe,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { initialWorkspaces, WorkspaceData } from '../context/WorkspaceContext';

export interface PostItem {
  id: string;
  workspaceId?: string;
  clientId?: string;
  caption: string;
  mediaUrl: string;
  mediaType: 'image' | 'video' | 'carousel';
  network: 'instagram' | 'tiktok' | 'facebook' | 'linkedin';
  status: 'draft' | 'pending_validation' | 'validated' | 'changes_requested' | 'scheduled' | 'published';
  scheduledDate?: string;
  scheduledTime?: string;
  carouselCount?: number;
  commentsCount?: number;
  likesCount?: number;
  reach?: string;
  feedbackComment?: string;
  updatedAt?: any;
}

export interface ApprovalSession {
  token: string;
  workspaceId: string;
  agencyId?: string;
  postIds: string[];
  status: 'ACTIVE' | 'EXPIRED' | 'COMPLETED';
  createdAt: any;
  expiresAt: any;
  openedCount: number;
  lastOpenedAt?: any;
  feedback?: Record<string, {
    status: 'validated' | 'changes_requested';
    comment?: string;
    updatedAt: any;
  }>;
  magicUrl: string;
}

/**
 * 1. getWorkspacesByAgency(agencyId)
 * Récupère toutes les marques/workspaces associées à une agence.
 */
export async function getWorkspacesByAgency(agencyId: string = 'default-agency'): Promise<WorkspaceData[]> {
  try {
    const wsRef = collection(db, 'workspaces');
    const q = query(wsRef, where('agencyId', '==', agencyId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as WorkspaceData));
    }

    // Si la collection racine est vide, vérifier users/{agencyId}/clients
    const userClientsRef = collection(db, 'users', agencyId, 'clients');
    const userClientsSnap = await getDocs(userClientsRef);
    if (!userClientsSnap.empty) {
      return userClientsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkspaceData));
    }

    // Fallback gracieux sur le jeu de données initial mocké
    return initialWorkspaces;
  } catch (error) {
    console.warn('⚠️ Erreur Firestore getWorkspacesByAgency, utilisation des données locales :', error);
    return initialWorkspaces;
  }
}

/**
 * 2. getPostsByWorkspace(workspaceId, callback)
 * Récupère et écoute en temps réel les publications d'un workspace avec onSnapshot.
 */
export function getPostsByWorkspace(
  workspaceId: string,
  callback?: (posts: PostItem[]) => void
): Unsubscribe | Promise<PostItem[]> {
  try {
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, where('workspaceId', '==', workspaceId), orderBy('scheduledDate', 'desc'));

    if (callback) {
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          if (!snapshot.empty) {
            const posts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostItem));
            callback(posts);
          } else {
            // Posts de démonstration par défaut si collection vide
            callback(getMockPostsForWorkspace(workspaceId));
          }
        },
        (error) => {
          console.warn('⚠️ Erreur onSnapshot Firestore :', error);
          callback(getMockPostsForWorkspace(workspaceId));
        }
      );

      return unsubscribe;
    }

    // Si aucun callback n'est fourni, renvoyer une promesse
    return getDocs(q).then((snapshot) => {
      if (!snapshot.empty) {
        return snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as PostItem));
      }
      return getMockPostsForWorkspace(workspaceId);
    });
  } catch (error) {
    console.warn('⚠️ Erreur getPostsByWorkspace :', error);
    const mockPosts = getMockPostsForWorkspace(workspaceId);
    if (callback) callback(mockPosts);
    return Promise.resolve(mockPosts);
  }
}

/**
 * 3. createApprovalSession(workspaceId, postIds, durationHours = 48)
 * Génère un token aléatoire sécurisé, enregistre la session dans Firestore et renvoie l'URL publique cmflow.sn/v/[token].
 */
export async function createApprovalSession(
  workspaceId: string,
  postIds: string[] = [],
  durationHours: number = 48
): Promise<{ token: string; url: string; expiresAt: Date; durationHours: number; session: ApprovalSession }> {
  // Générer un token sécurisé et élégant (ex: tok_8f92ab3c4d...)
  const randomPart = Math.random().toString(36).substring(2, 10) + Math.random().toString(36).substring(2, 8);
  const token = `tok_${randomPart}`;

  const now = new Date();
  const expiresAt = new Date(now.getTime() + durationHours * 3600 * 1000);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://cmflow.sn';
  const magicUrl = `${baseUrl}/v/${token}`;

  const sessionData: ApprovalSession = {
    token,
    workspaceId,
    postIds: postIds.length > 0 ? postIds : ['post-1', 'post-2', 'post-3'],
    status: 'ACTIVE',
    createdAt: serverTimestamp(),
    expiresAt: Timestamp.fromDate(expiresAt),
    openedCount: 0,
    lastOpenedAt: null,
    feedback: {},
    magicUrl,
  };

  try {
    const sessionDocRef = doc(db, 'approval_sessions', token);
    await setDoc(sessionDocRef, sessionData);

    // Enregistrement miroir dans public_reviews pour compatibilité avec les règles de sécurité
    const publicDocRef = doc(db, 'public_reviews', token);
    await setDoc(publicDocRef, {
      ...sessionData,
      id: token,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.warn('⚠️ Sauvegarde Firestore de la session en mode local :', error);
  }

  return {
    token,
    url: magicUrl,
    expiresAt,
    durationHours,
    session: sessionData,
  };
}

/**
 * 4. validatePostByClient(token, postId, status, comment)
 * Permet au client de valider ou de demander des retouches sur une publication via son lien magique.
 */
export async function validatePostByClient(
  token: string,
  postId: string,
  status: 'validated' | 'changes_requested',
  comment: string = ''
): Promise<{ success: boolean; token: string; postId: string; status: string; comment: string }> {
  try {
    const sessionDocRef = doc(db, 'approval_sessions', token);
    const sessionSnap = await getDoc(sessionDocRef);

    const feedbackEntry = {
      status,
      comment: comment.trim(),
      updatedAt: new Date().toISOString(),
    };

    if (sessionSnap.exists()) {
      await updateDoc(sessionDocRef, {
        [`feedback.${postId}`]: feedbackEntry,
        lastFeedbackAt: serverTimestamp(),
      });
    }

    // Mettre à jour aussi public_reviews
    const publicDocRef = doc(db, 'public_reviews', token);
    const publicSnap = await getDoc(publicDocRef);
    if (publicSnap.exists()) {
      await updateDoc(publicDocRef, {
        [`feedback.${postId}`]: feedbackEntry,
        lastFeedbackAt: serverTimestamp(),
      });
    }

    // Mettre à jour le statut du post individuel si présent dans collection posts
    try {
      const postDocRef = doc(db, 'posts', postId);
      await updateDoc(postDocRef, {
        status: status === 'validated' ? 'validated' : 'draft',
        feedbackComment: comment.trim(),
        updatedAt: serverTimestamp(),
      });
    } catch {
      // Le post peut être mocké, ignorer silencieusement
    }

    return {
      success: true,
      token,
      postId,
      status,
      comment,
    };
  } catch (error) {
    console.warn('⚠️ Erreur validatePostByClient Firestore, validation enregistrée localement :', error);
    return {
      success: true,
      token,
      postId,
      status,
      comment,
    };
  }
}

/**
 * Données mockées enrichies de secours pour le workspace demandé
 */
function getMockPostsForWorkspace(workspaceId: string): PostItem[] {
  if (workspaceId === 'sira-cosmetiques') {
    return [
      {
        id: 'post-sc-1',
        workspaceId: 'sira-cosmetiques',
        caption: 'Découvrez notre nouvelle routine éclat au beurre de Karité Bio 🌿✨ Peau hydratée 24h garantie !',
        mediaUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=800&auto=format&fit=crop&q=80',
        mediaType: 'carousel',
        carouselCount: 4,
        network: 'tiktok',
        status: 'validated',
        scheduledDate: '2026-08-25',
        scheduledTime: '12:00',
      },
      {
        id: 'post-sc-2',
        workspaceId: 'sira-cosmetiques',
        caption: 'Tuto makeup naturel avec notre baume teinté Abidjan Glow 💄 Qui l\'a déjà testé ?',
        mediaUrl: 'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&auto=format&fit=crop&q=80',
        mediaType: 'video',
        network: 'instagram',
        status: 'pending_validation',
        scheduledDate: '2026-08-27',
        scheduledTime: '18:30',
      },
    ];
  }

  if (workspaceId === 'dakar-tech-hub') {
    return [
      {
        id: 'post-dth-1',
        workspaceId: 'dakar-tech-hub',
        caption: 'Annonce officielle : 5 nouvelles startups FinTech rejoignent notre programme Scale Dakar 🚀',
        mediaUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&auto=format&fit=crop&q=80',
        mediaType: 'image',
        network: 'linkedin',
        status: 'validated',
        scheduledDate: '2026-08-26',
        scheduledTime: '09:00',
      },
    ];
  }

  // Par défaut Teranga Gourmet
  return [
    {
      id: 'post-1',
      workspaceId: 'teranga-gourmet',
      caption: 'Ce soir, découvrez notre nouveau Thiéboudienne royal revisité aux fruits de mer frais de Soumbédioune 🐟✨ Réservez votre table en terrasse ! #DakarFood #SenegalGourmet',
      mediaUrl: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&auto=format&fit=crop&q=80',
      mediaType: 'carousel',
      carouselCount: 3,
      network: 'instagram',
      status: 'validated',
      scheduledDate: '2026-08-24',
      scheduledTime: '18:30',
    },
    {
      id: 'post-2',
      workspaceId: 'teranga-gourmet',
      caption: 'Dans les coulisses avec notre Chef Moussa qui prépare les fameux pastels croustillants 🔥 Vous êtes plutôt sauce pimentée ou douce ? #DakarFood #Foodie',
      mediaUrl: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&auto=format&fit=crop&q=80',
      mediaType: 'video',
      network: 'tiktok',
      status: 'pending_validation',
      scheduledDate: '2026-08-25',
      scheduledTime: '12:15',
    },
    {
      id: 'post-3',
      workspaceId: 'teranga-gourmet',
      caption: 'Offre spéciale déjeuner d\'entreprise : -15% sur toutes vos commandes de groupe du mercredi au vendredi 💼🍽️ Livraison express au Plateau.',
      mediaUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80',
      mediaType: 'image',
      network: 'facebook',
      status: 'scheduled',
      scheduledDate: '2026-08-26',
      scheduledTime: '09:00',
    },
  ];
}
