// providers/email.provider.ts
export const EmailProvider = {
  async send({ to, subject, html, text }) {
    // integrate with SendGrid, SES, Mailgun, etc.
    console.log("EMAIL →", to, subject);
  },
};
