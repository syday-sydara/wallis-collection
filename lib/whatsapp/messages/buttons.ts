// lib/whatsapp/messages/buttons.ts

export interface WhatsAppButton {
  id: string;
  title: string;
}

export interface WhatsAppButtonMessage {
  messaging_product: "whatsapp";
  type: "interactive";
  interactive: {
    type: "button";
    body: { text: string };
    action: {
      buttons: Array<{
        type: "reply";
        reply: { id: string; title: string };
      }>;
    };
  };
}

export function buildButtonMessage(
  body: string,
  buttons: WhatsAppButton[]
): WhatsAppButtonMessage {
  return {
    messaging_product: "whatsapp",
    type: "interactive",
    interactive: {
      type: "button",
      body: { text: body },
      action: {
        buttons: buttons.map((b) => ({
          type: "reply",
          reply: { id: b.id, title: b.title },
        })),
      },
    },
  };
}
