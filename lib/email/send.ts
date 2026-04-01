import { Resend } from "resend";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit/log";

export const resend = new Resend(process.env.RESEND_API_KEY);

const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1),
  html: z.string().min(1),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
  from: z.string().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

export async function sendOrderEmail(input: z.infer<typeof EmailSchema>) {
  const parsed = EmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { to, subject, html, text, replyTo, from, cc, bcc } = parsed.data;

  try {
    const result = await resend.emails.send({
      from: from ?? `Wallis Collection <orders@${process.env.EMAIL_DOMAIN}>`,
      to,
      cc,
      bcc,
      subject,
      html,
      text: text ?? stripHtml(html),
      reply_to: replyTo,
    });

    await logAuditEvent({
      action: "EMAIL_SENT",
      actorType: "SYSTEM",
      metadata: { to, subject },
    });

    return { ok: true, result };
  } catch (err: any) {
    await logAuditEvent({
      action: "EMAIL_SEND_FAILED",
      actorType: "SYSTEM",
      metadata: { to, subject, error: err?.message },
    });

    return {
      ok: false,
      errors: { _form: [err?.message ?? "Email failed to send"] },
    };
  }
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").trim();
}