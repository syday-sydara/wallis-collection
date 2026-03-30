import { Resend } from "resend";
import { z } from "zod";

export const resend = new Resend(process.env.RESEND_API_KEY);

// Schema for safety
const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
});

// Generic email sender
export async function sendOrderEmail(input: z.infer<typeof EmailSchema>) {
  const parsed = EmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { to, subject, html, text, replyTo } = parsed.data;

  try {
    const result = await resend.emails.send({
      from: `Wallis Collection <orders@${process.env.EMAIL_DOMAIN}>`,
      to,
      subject,
      html,
      text: text ?? stripHtml(html),
      reply_to: replyTo,
    });

    return { ok: true, result };
  } catch (err: any) {
    console.error("Email send failed:", err);

    return {
      ok: false,
      errors: { _form: [err?.message ?? "Email failed to send"] },
    };
  }
}

// Simple HTML → text fallback
function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}
