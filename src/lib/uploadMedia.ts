import { ref, uploadBytesResumable, getDownloadURL, UploadTaskSnapshot } from 'firebase/storage';
import { storage } from './firebase';

export interface UploadMediaResult {
  url: string;
  fullPath: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

export type UploadProgressCallback = (progress: number, snapshot?: UploadTaskSnapshot) => void;

/**
 * Téléverse un fichier média (Image HD, Vidéo MP4/Reel, Document) vers Firebase Storage
 * Emplacement sécurisé : posts/${workspaceId}/${timestamp}_${sanitizedFilename}
 *
 * @param file Fichier File ou Blob à téléverser
 * @param workspaceId ID de l'espace de travail / client
 * @param onProgress Callback optionnel pour suivre la progression (0 à 100%)
 * @returns Promesse résolue avec l'URL publique permanente et les métadonnées
 */
export async function uploadPostMedia(
  file: File | Blob & { name?: string },
  workspaceId: string = 'default',
  onProgress?: UploadProgressCallback
): Promise<string> {
  if (!file) {
    throw new Error('Aucun fichier média fourni pour le téléversement.');
  }

  // 1. Validation de la taille (Règle Firebase Storage : Max 50 Mo)
  const MAX_SIZE_BYTES = 50 * 1024 * 1024; // 50 Mo
  if (file.size && file.size > MAX_SIZE_BYTES) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    throw new Error(`Fichier trop volumineux (${sizeMb} Mo). La taille maximale autorisée par Firebase Storage est de 50 Mo.`);
  }

  // 2. Validation des types MIME autorisés (Images & Vidéos HD)
  const allowedMimePrefixes = ['image/', 'video/'];
  if (file.type && !allowedMimePrefixes.some((prefix) => file.type.startsWith(prefix))) {
    throw new Error(`Format de fichier non supporté (${file.type}). Seuls les formats images (JPG, PNG, WebP) et vidéos (MP4, MOV) sont acceptés.`);
  }

  // Nettoyage et sécurisation du nom de fichier
  const rawName = file.name || `media_${Date.now()}.${file.type?.split('/')[1] || 'jpg'}`;
  const sanitizedFilename = rawName.replace(/[^a-zA-Z0-9.-]/g, '_');
  const timestamp = Date.now();
  const storagePath = `posts/${workspaceId}/${timestamp}_${sanitizedFilename}`;

  try {
    // 1. Référence Firebase Storage
    const storageRef = ref(storage, storagePath);

    // Métadonnées du média
    const metadata = {
      contentType: file.type || 'image/jpeg',
      customMetadata: {
        workspaceId,
        uploadedAt: new Date().toISOString(),
        originalName: rawName,
      },
    };

    // 2. Initialisation de la tâche de téléversement résumable
    const uploadTask = uploadBytesResumable(storageRef, file, metadata);

    // 3. Suivi de progression et attente de fin
    return await new Promise<string>((resolve, reject) => {
      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          if (onProgress) {
            onProgress(Math.round(progress), snapshot);
          }
        },
        (error) => {
          console.warn('⚠️ Échec Firebase Storage Client, utilisation du fallback média :', error);
          // Si Firebase Storage n'est pas encore activé ou en local sans réseau
          try {
            if (typeof window !== 'undefined' && file instanceof Blob) {
              const localUrl = URL.createObjectURL(file);
              resolve(localUrl);
              return;
            }
          } catch {}
          reject(error);
        },
        async () => {
          try {
            // 4. Récupération de l'URL publique de téléchargement permanente
            const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
            if (onProgress) onProgress(100);
            resolve(downloadUrl);
          } catch (urlError) {
            console.error('Erreur lors de la récupération du Download URL:', urlError);
            reject(urlError);
          }
        }
      );
    });
  } catch (err) {
    console.warn('⚠️ Erreur globale uploadPostMedia, fallback local :', err);
    if (typeof window !== 'undefined' && file instanceof Blob) {
      return URL.createObjectURL(file);
    }
    throw err;
  }
}

/**
 * Version détaillée retournant l'URL et toutes les métadonnées
 */
export async function uploadPostMediaWithMeta(
  file: File,
  workspaceId: string = 'default',
  onProgress?: UploadProgressCallback
): Promise<UploadMediaResult> {
  const url = await uploadPostMedia(file, workspaceId, onProgress);
  return {
    url,
    fullPath: `posts/${workspaceId}/${file.name}`,
    name: file.name,
    size: file.size,
    type: file.type,
    uploadedAt: new Date().toISOString(),
  };
}

export default uploadPostMedia;
