// lib/whatsapp/messages/list.ts

export interface WhatsAppListRow {
  id: string;
  title: string;
  description?: string;
}

export interface WhatsAppListSection {
  title: string;
  rows: WhatsAppListRow[];
}

export interface WhatsAppListMessage {
  messaging_product: "whatsapp";
  type: "interactive";
  interactive: {
    type: "list";
    header?: { type: "text"; text: string };
    body: { text: string };
    footer?: { text: string };
    action: {
      button: string;
      sections: WhatsAppListSection[];
    };
  };
}

export function buildListMessage(
  content: { header?: string; body: string; footer?: string },
  buttonText: string,
  sections: WhatsAppListSection[]
): WhatsAppListMessage {
  const interactive: WhatsAppListMessage["interactive"] = {
    type: "list",
    body: { text: content.body },
    action: {
      button: buttonText,
      sections: sections.map((section) => ({
        title: section.title,
        rows: section.rows.map((row) => ({
          id: row.id,
          title: row.title,
          ...(row.description ? { description: row.description } : {}),
        })),
      })),
    },
  };

  if (content.header) {
    interactive.header = { type: "text", text: content.header };
  }

  if (content.footer) {
    interactive.footer = { text: content.footer };
  }

  return {
    messaging_product: "whatsapp",
    type: "interactive",
    interactive,
  };
}
