/**
 * Service d'Alerte et de Notification en Temps Réel pour les Community Managers
 * CMFlow — Notification Engine
 */

export interface NotifyCMParams {
  workspaceId?: string;
  workspaceName: string;
  postCaption: string;
  action: 'APPROVED' | 'CHANGES_REQUESTED';
  comment?: string;
  agencyWhatsapp?: string;
  token?: string;
  postId?: string;
}

export interface NotifyResult {
  success: boolean;
  messageText: string;
  whatsappUrl?: string;
  webhookDelivered?: boolean;
  timestamp: string;
}

/**
 * Envoie une alerte automatique au Community Manager lors d'une décision client
 * Supporte : WhatsApp (Twilio / Meta API / Direct URL) et Webhooks (Discord, Slack, n8n, Zapier)
 */
export async function notifyCMOnDecision({
  workspaceId = 'default',
  workspaceName = 'Client',
  postCaption = '',
  action,
  comment = '',
  agencyWhatsapp = '+221778421902',
  token,
  postId,
}: NotifyCMParams): Promise<NotifyResult> {
  // 1. Nettoyage de l'extrait de légende (max 80 caractères)
  const captionExcerpt = postCaption.trim()
    ? postCaption.trim().length > 70
      ? `${postCaption.trim().slice(0, 70)}...`
      : postCaption.trim()
    : 'Publication programmée';

  // 2. Construction du Message Texte WhatsApp
  let messageText = '';
  if (action === 'APPROVED') {
    messageText = `✅ [${workspaceName}] a validé la publication : "${captionExcerpt}".`;
  } else {
    const cleanComment = comment.trim() || 'Aucun détail fourni';
    messageText = `⚠️ [${workspaceName}] demande une retouche sur "${captionExcerpt}" : "${cleanComment}".`;
  }

  const cleanPhone = (agencyWhatsapp || '221778421902').replace(/[^0-9]/g, '');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(messageText)}`;

  let webhookDelivered = false;

  // 3. Envoi vers Webhook Externe (Discord / Slack / n8n) si configuré
  const webhookEndpoint =
    process.env.AGENCY_NOTIFICATION_WEBHOOK ||
    process.env.DISCORD_WEBHOOK_URL ||
    process.env.SLACK_WEBHOOK_URL;

  if (webhookEndpoint) {
    try {
      const isDiscord = webhookEndpoint.includes('discord.com');
      const isSlack = webhookEndpoint.includes('slack.com');

      let payload: any = {
        text: messageText,
        workspaceName,
        action,
        comment,
        postCaption: captionExcerpt,
        token,
        timestamp: new Date().toISOString(),
      };

      if (isDiscord) {
        payload = {
          username: 'CMFlow Notifications',
          avatar_url: 'https://cmflow.sn/favicon.svg',
          embeds: [
            {
              title: action === 'APPROVED' ? '🎉 Publication Validée !' : '⚠️ Demande de Retouche Client',
              description: messageText,
              color: action === 'APPROVED' ? 0x10b981 : 0xf94f06,
              fields: [
                { name: 'Marque / Espace', value: workspaceName, inline: true },
                { name: 'Statut', value: action === 'APPROVED' ? 'Validé ✓' : 'À modifier ✏️', inline: true },
                ...(comment ? [{ name: 'Remarque Client', value: comment }] : []),
              ],
              footer: { text: 'CMFlow WhatsApp Approval Engine' },
              timestamp: new Date().toISOString(),
            },
          ],
        };
      } else if (isSlack) {
        payload = {
          text: messageText,
          blocks: [
            {
              type: 'section',
              text: {
                type: 'mrkdwn',
                text: `*${action === 'APPROVED' ? '✅ Publication Validée' : '⚠️ Demande de Retouche'}* pour *${workspaceName}*\n${messageText}`,
              },
            },
          ],
        };
      }

      const res = await fetch(webhookEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      webhookDelivered = res.ok;
    } catch (whError) {
      console.warn('⚠️ Échec de livraison webhook notification CM :', whError);
    }
  }

  // 4. Envoi via Meta Cloud API / Twilio WhatsApp si clés d'API présentes
  if (process.env.WHATSAPP_API_TOKEN && process.env.WHATSAPP_PHONE_NUMBER_ID) {
    try {
      await fetch(
        `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: { body: messageText },
          }),
        }
      );
    } catch (metaErr) {
      console.warn('⚠️ Échec Meta Cloud WhatsApp API :', metaErr);
    }
  }

  return {
    success: true,
    messageText,
    whatsappUrl,
    webhookDelivered,
    timestamp: new Date().toISOString(),
  };
}

export default notifyCMOnDecision;
