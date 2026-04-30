// lib/whatsapp/messages/text.ts

export interface WhatsAppTextMessage {
  messaging_product: "whatsapp";
  type: "text";
  text: {
    body: string;
    preview_url?: boolean;
  };
}

export function buildTextMessage(
  body: string,
  previewUrl: boolean = false,
): WhatsAppTextMessage {
  return {
    messaging_product: "whatsapp",
    type: "text",
    text: {
      body,
      ...(previewUrl ? { preview_url: true } : {}),
    },
  };
}
