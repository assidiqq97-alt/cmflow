// ===============================================================
// CMFlow — Service Publication TikTok (Content Posting API v2)
// Publie des vidéos via URL publique ou upload direct
// Note : TikTok impose une vidéo — pas de posts texte seul
// ===============================================================

const TIKTOK_API_BASE = 'https://open.tiktokapis.com/v2';

export interface TikTokVideoParams {
  accessToken: string;
  /** URL publique HTTPS de la vidéo (MP4, durée 3s–10min, max 4GB) */
  videoUrl: string;
  /** Légende / description du post (max 2200 caractères) */
  caption: string;
  privacyLevel?: 'PUBLIC_TO_EVERYONE' | 'MUTUAL_FOLLOW_FRIENDS' | 'FOLLOWER_OF_CREATOR' | 'SELF_ONLY';
  disableDuet?: boolean;
  disableComment?: boolean;
  disableStitch?: boolean;
}

export interface TikTokPublishResult {
  publishId: string;
  status: 'PROCESSING' | 'PUBLISHED' | 'FAILED';
}

export class TikTokPublisher {
  /**
   * Publie une vidéo TikTok via une URL publique (méthode PULL_FROM_URL)
   * La vidéo doit être accessible publiquement en HTTPS
   */
  static async publishVideo(params: TikTokVideoParams): Promise<TikTokPublishResult> {
    const {
      accessToken,
      videoUrl,
      caption,
      privacyLevel = 'PUBLIC_TO_EVERYONE',
      disableDuet = false,
      disableComment = false,
      disableStitch = false,
    } = params;

    const res = await fetch(`${TIKTOK_API_BASE}/post/publish/video/init/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({
        post_info: {
          title: caption.substring(0, 2200),
          privacy_level: privacyLevel,
          disable_duet: disableDuet,
          disable_comment: disableComment,
          disable_stitch: disableStitch,
          video_cover_timestamp_ms: 1000,
        },
        source_info: {
          source: 'PULL_FROM_URL',
          video_url: videoUrl,
        },
      }),
    });

    const data = await res.json();

    if (!res.ok || data.error?.code !== 'ok') {
      throw new Error(
        data.error?.message ||
        `Erreur publication TikTok (${res.status})`
      );
    }

    const publishId = data.data?.publish_id;
    console.log(`✅ [TikTok Publisher] Vidéo en cours de traitement. publish_id: ${publishId}`);

    return {
      publishId,
      status: 'PROCESSING',
    };
  }

  /**
   * Vérifie le statut d'une publication TikTok
   */
  static async checkPublishStatus(
    accessToken: string,
    publishId: string
  ): Promise<{ status: string; publicationId?: string; failReason?: string }> {
    const res = await fetch(`${TIKTOK_API_BASE}/post/publish/status/fetch/`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify({ publish_id: publishId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(`Erreur vérification statut TikTok: ${res.status}`);

    return {
      status: data.data?.status || 'PROCESSING',
      publicationId: data.data?.publicaly_available_post_id?.[0],
      failReason: data.data?.fail_reason,
    };
  }

  /**
   * Récupère le profil de l'utilisateur TikTok connecté
   */
  static async getUserInfo(accessToken: string): Promise<{
    openId: string;
    displayName: string;
    avatarUrl: string;
    followerCount: number;
  }> {
    const res = await fetch(
      `${TIKTOK_API_BASE}/user/info/?fields=open_id,display_name,avatar_url,follower_count`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!res.ok) throw new Error(`Erreur récupération profil TikTok: ${res.status}`);
    const data = await res.json();
    const user = data.data?.user || {};

    return {
      openId: user.open_id || '',
      displayName: user.display_name || 'Compte TikTok',
      avatarUrl: user.avatar_url || '',
      followerCount: user.follower_count || 0,
    };
  }
}

export default TikTokPublisher;
