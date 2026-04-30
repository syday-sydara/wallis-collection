// lib/whatsapp/messages/media.ts

export type WhatsAppMediaType = "image" | "video" | "audio" | "document";

export interface WhatsAppMediaMessageBase {
  messaging_product: "whatsapp";
  type: WhatsAppMediaType;
}

export interface WhatsAppImageMessage extends WhatsAppMediaMessageBase {
  type: "image";
  image: { link: string; caption?: string };
}

export interface WhatsAppVideoMessage extends WhatsAppMediaMessageBase {
  type: "video";
  video: { link: string; caption?: string };
}

export interface WhatsAppAudioMessage extends WhatsAppMediaMessageBase {
  type: "audio";
  audio: { link: string };
}

export interface WhatsAppDocumentMessage extends WhatsAppMediaMessageBase {
  type: "document";
  document: { link: string; filename?: string; caption?: string };
}

export type WhatsAppMediaMessage =
  | WhatsAppImageMessage
  | WhatsAppVideoMessage
  | WhatsAppAudioMessage
  | WhatsAppDocumentMessage;

// ---------------------------------------------------------------------------
// Builders
// ---------------------------------------------------------------------------

export function buildImageMessage(
  url: string,
  caption?: string,
): WhatsAppImageMessage {
  return {
    messaging_product: "whatsapp",
    type: "image",
    image: {
      link: url,
      ...(caption ? { caption } : {}),
    },
  };
}

export function buildVideoMessage(
  url: string,
  caption?: string,
): WhatsAppVideoMessage {
  return {
    messaging_product: "whatsapp",
    type: "video",
    video: {
      link: url,
      ...(caption ? { caption } : {}),
    },
  };
}

export function buildAudioMessage(url: string): WhatsAppAudioMessage {
  return {
    messaging_product: "whatsapp",
    type: "audio",
    audio: { link: url },
  };
}

export function buildDocumentMessage(
  url: string,
  filename?: string,
  caption?: string,
): WhatsAppDocumentMessage {
  return {
    messaging_product: "whatsapp",
    type: "document",
    document: {
      link: url,
      ...(filename ? { filename } : {}),
      ...(caption ? { caption } : {}),
    },
  };
}
