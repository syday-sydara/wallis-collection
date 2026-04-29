// lib/whatsapp/messages/template.ts

export type TemplateComponent =
  | {
      type: "header";
      parameters: TemplateParameter[];
    }
  | {
      type: "body";
      parameters: TemplateParameter[];
    }
  | {
      type: "button";
      sub_type: "quick_reply" | "url";
      index: number;
      parameters: TemplateParameter[];
    };

export type TemplateParameter =
  | { type: "text"; text: string }
  | { type: "currency"; currency: { fallback_value: string; code: string; amount_1000: number } }
  | { type: "date_time"; date_time: { fallback_value: string } }
  | { type: "image"; image: { link: string } }
  | { type: "document"; document: { link: string; filename: string } }
  | { type: "video"; video: { link: string } };

export interface WhatsAppTemplateMessage {
  messaging_product: "whatsapp";
  type: "template";
  template: {
    name: string;
    language: { code: string };
    components?: TemplateComponent[];
  };
}

export function buildTemplateMessage(
  name: string,
  language: string,
  components?: TemplateComponent[]
): WhatsAppTemplateMessage {
  return {
    messaging_product: "whatsapp",
    type: "template",
    template: {
      name,
      language: { code: language.toLowerCase() },
      components: components && components.length > 0 ? components : undefined,
    },
  };
}
