// providers/whatsapp.provider.ts
import axios from "axios";

export const WhatsAppProvider = {
  async send({ to, template, variables }) {
    const payload = {
      messaging_product: "whatsapp",
      to,
      type: "template",
      template: {
        name: template,
        language: { code: "en_US" },
        components: [
          {
            type: "body",
            parameters: variables.map(v => ({ type: "text", text: v })),
          },
        ],
      },
    };

    try {
      const res = await axios.post(
        `https://graph.facebook.com/v19.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
            "Content-Type": "application/json",
          },
          timeout: 8000,
        }
      );

      return res.data;
    } catch (err) {
      console.error("[WHATSAPP PROVIDER ERROR]", err.response?.data || err);
      throw err;
    }
  },
};
