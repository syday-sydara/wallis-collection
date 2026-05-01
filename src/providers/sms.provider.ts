// providers/sms.provider.ts
export const SmsProvider = {
  async send({ to, text }) {
    // integrate with Twilio, Termii, etc.
    console.log("SMS →", to, text);
  },
};
