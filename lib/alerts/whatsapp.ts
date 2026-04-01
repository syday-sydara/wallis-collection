// lib/alerts/whatsapp.ts

export async function sendWhatsAppAlert(payload: {
  to: string; // WhatsApp phone number in international format
  template: string; // WhatsApp template name
  variables?: string[];
  severity?: "low" | "medium" | "high";
}) {
  const { to, template, variables = [], severity = "low" } = payload;

  const token = process.env.WHATSAPP_ACCESS_TOKEN!;
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID!;

  const body = {
    messaging_product: "whatsapp",
    to,
    type: "template",
    template: {
      name: template,
      language: { code: "en_US" },
      components: variables.length
        ? [
            {
              type: "body",
              parameters: variables.map((v) => ({
                type: "text",
                text: v
              }))
            }
          ]
        : []
    }
  };

  await fetch(
    `https://graph.facebook.com/v18.0/${phoneId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    }
  );
}
