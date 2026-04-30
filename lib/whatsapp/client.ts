// lib/whatsapp/client.ts

import { sendWhatsApp } from "./gateway";
import {
  buildTextMessage,
  buildButtonMessage,
  buildListMessage,
  buildImageMessage,
  buildDocumentMessage,
} from "./messages";

export class WhatsAppClient {
  constructor(
    private readonly to: string,
    private readonly baseTags: string[] = [],
  ) {}

  text(message: string, previewUrl = false, tags: string[] = []) {
    return sendWhatsApp({
      to: this.to,
      operation: "text",
      tags: ["text", ...this.baseTags, ...tags],
      buildBody: () => buildTextMessage(message, previewUrl),
    });
  }

  buttons(
    message: string,
    buttons: { id: string; title: string }[],
    tags: string[] = [],
  ) {
    return sendWhatsApp({
      to: this.to,
      operation: "buttons",
      tags: ["buttons", ...this.baseTags, ...tags],
      buildBody: () => buildButtonMessage(message, buttons),
    });
  }

  list(
    content: { header?: string; body: string; footer?: string },
    buttonText: string,
    sections: {
      title: string;
      rows: { id: string; title: string; description?: string }[];
    }[],
    tags: string[] = [],
  ) {
    return sendWhatsApp({
      to: this.to,
      operation: "list",
      tags: ["list", ...this.baseTags, ...tags],
      buildBody: () => buildListMessage(content, buttonText, sections),
    });
  }

  image(url: string, caption?: string, tags: string[] = []) {
    return sendWhatsApp({
      to: this.to,
      operation: "media_image",
      tags: ["media", "image", ...this.baseTags, ...tags],
      buildBody: () => buildImageMessage(url, caption),
    });
  }

  document(
    url: string,
    filename: string,
    caption?: string,
    tags: string[] = [],
  ) {
    return sendWhatsApp({
      to: this.to,
      operation: "media_document",
      tags: ["media", "document", ...this.baseTags, ...tags],
      buildBody: () => buildDocumentMessage(url, filename, caption),
    });
  }
}
