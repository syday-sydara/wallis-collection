// providers/whatsapp.provider.ts
export const WhatsAppProvider = {
  async send({ to, text }) {
    // integrate with WhatsApp Cloud API
    console.log("WHATSAPP →", to, text);
  },
};
