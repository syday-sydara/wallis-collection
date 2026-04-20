import { Resend } from "resend";
import { z } from "zod";
import { logAuditEvent } from "@/lib/audit/log";

export const resend = new Resend(process.env.RESEND_API_KEY);

const MAX_EMAIL_SIZE = 200_000; // ~200 KB safety cap

const EmailSchema = z.object({
  to: z.string().email(),
  subject: z.string().min(1).max(200),
  html: z.string().min(1),
  text: z.string().optional(),
  replyTo: z.string().email().optional(),
  from: z.string().optional(),
  cc: z.array(z.string().email()).optional(),
  bcc: z.array(z.string().email()).optional(),
});

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

function limitMetadataSize(obj: any, maxBytes = 5000) {
  try {
    const json = JSON.stringify(obj);
    const bytes = new TextEncoder().encode(json).length;

    if (bytes > maxBytes) {
      return {
        truncated: true,
        preview: json.slice(0, 2000),
        originalBytes: bytes,
      };
    }

    return obj;
  } catch {
    return { error: "metadata_serialization_failed" };
  }
}

export async function sendOrderEmail(input: z.infer<typeof EmailSchema>) {
  const parsed = EmailSchema.safeParse(input);

  if (!parsed.success) {
    return {
      ok: false,
      errors: parsed.error.flatten().fieldErrors,
    };
  }

  const { to, subject, html, text, replyTo, from, cc, bcc } = parsed.data;

  // Prevent oversized HTML payload attacks
  if (html.length > MAX_EMAIL_SIZE) {
    await logAuditEvent({
      action: "EMAIL_REJECTED_OVERSIZED",
      actorType: "SYSTEM",
      metadata: limitMetadataSize({ to, subject, size: html.length }),
    });

    return {
      ok: false,
      errors: { html: ["Email HTML body too large"] },
    };
  }

  const safeFrom =
    from ??
    `Wallis Collection <orders@${process.env.EMAIL_DOMAIN}>`;

  try {
    const result = await resend.emails.send({
      from: safeFrom,
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
      metadata: limitMetadataSize({ to, subject }),
    });

    return { ok: true, result };
  } catch (err: any) {
    const message = err?.message ?? "Email failed to send";

    await logAuditEvent({
      action: "EMAIL_SEND_FAILED",
      actorType: "SYSTEM",
      metadata: limitMetadataSize({ to, subject, error: message }),
    });

    return {
      ok: false,
      errors: { _form: [message] },
    };
  }
}
