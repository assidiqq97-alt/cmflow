// ===============================================================
// CMFlow — Service Publication LinkedIn (UGC Posts API v2)
// Publie au nom d'un membre ou d'une organisation LinkedIn
// ===============================================================

const LINKEDIN_API_BASE = 'https://api.linkedin.com/v2';

export interface LinkedInPostParams {
  accessToken: string;
  /** URN du membre : "urn:li:person:XXXX" ou de l'organisation : "urn:li:organization:XXXX" */
  authorUrn: string;
  text: string;
  /** URL d'une image à joindre (optionnel) */
  imageUrl?: string;
  /** Titre du lien partagé (optionnel) */
  linkTitle?: string;
  /** URL du lien partagé (optionnel) */
  linkUrl?: string;
}

export interface LinkedInPostResult {
  postId: string;
  url: string;
}

export class LinkedInPublisher {
  /**
   * Récupère le profil de l'utilisateur connecté (sub → URN LinkedIn)
   */
  static async getProfile(accessToken: string): Promise<{ urn: string; name: string; sub: string }> {
    const res = await fetch(`${LINKEDIN_API_BASE}/userinfo`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      throw new Error(`Impossible de récupérer le profil LinkedIn: ${res.status}`);
    }

    const data = await res.json();
    return {
      sub: data.sub,
      urn: `urn:li:person:${data.sub}`,
      name: data.name || `${data.given_name || ''} ${data.family_name || ''}`.trim(),
    };
  }

  /**
   * Publie un post texte (ou avec lien) sur LinkedIn
   */
  static async publishPost(params: LinkedInPostParams): Promise<LinkedInPostResult> {
    const { accessToken, authorUrn, text, linkUrl, linkTitle } = params;

    const shareContent: any = {
      shareCommentary: { text },
      shareMediaCategory: linkUrl ? 'ARTICLE' : 'NONE',
    };

    if (linkUrl) {
      shareContent.media = [
        {
          status: 'READY',
          originalUrl: linkUrl,
          title: { text: linkTitle || linkUrl },
        },
      ];
    }

    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': shareContent,
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const res = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Échec publication LinkedIn (${res.status}): ${errText}`);
    }

    // LinkedIn retourne l'ID du post dans le header X-RestLi-Id
    const postId = res.headers.get('x-restli-id') || `li_post_${Date.now()}`;
    const postUrl = `https://www.linkedin.com/feed/update/${postId}`;

    console.log(`✅ [LinkedIn Publisher] Post publié : ${postUrl}`);
    return { postId, url: postUrl };
  }

  /**
   * Publie un post avec image uploadée sur LinkedIn
   * (processus en 3 étapes : register → upload → publish)
   */
  static async publishPostWithImage(params: LinkedInPostParams & { imageBuffer: Buffer; mimeType?: string }): Promise<LinkedInPostResult> {
    const { accessToken, authorUrn, text, imageBuffer, mimeType = 'image/jpeg' } = params;

    // Étape 1 — Enregistrer l'upload
    const registerRes = await fetch(`${LINKEDIN_API_BASE}/assets?action=registerUpload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify({
        registerUploadRequest: {
          recipes: ['urn:li:digitalmediaRecipe:feedshare-image'],
          owner: authorUrn,
          serviceRelationships: [
            { relationshipType: 'OWNER', identifier: 'urn:li:userGeneratedContent' },
          ],
        },
      }),
    });

    if (!registerRes.ok) throw new Error(`Erreur enregistrement image LinkedIn: ${registerRes.status}`);
    const registerData = await registerRes.json();
    const uploadUrl = registerData.value?.uploadMechanism?.['com.linkedin.digitalmedia.uploading.MediaUploadHttpRequest']?.uploadUrl;
    const asset = registerData.value?.asset;

    if (!uploadUrl || !asset) throw new Error('Upload URL ou asset LinkedIn introuvable');

    // Étape 2 — Upload de l'image
    await fetch(uploadUrl, {
      method: 'PUT',
      headers: { 'Content-Type': mimeType },
      body: imageBuffer,
    });

    // Étape 3 — Publier avec l'image
    const body = {
      author: authorUrn,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: { text },
          shareMediaCategory: 'IMAGE',
          media: [{ status: 'READY', media: asset }],
        },
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC',
      },
    };

    const postRes = await fetch(`${LINKEDIN_API_BASE}/ugcPosts`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'X-Restli-Protocol-Version': '2.0.0',
      },
      body: JSON.stringify(body),
    });

    if (!postRes.ok) {
      const errText = await postRes.text();
      throw new Error(`Échec publication LinkedIn avec image (${postRes.status}): ${errText}`);
    }

    const postId = postRes.headers.get('x-restli-id') || `li_post_${Date.now()}`;
    return { postId, url: `https://www.linkedin.com/feed/update/${postId}` };
  }
}

export default LinkedInPublisher;
