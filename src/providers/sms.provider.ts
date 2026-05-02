// providers/sms.provider.ts
import { normalizePhone } from "../utils/phone";
import { prisma } from "../config/prisma";

interface SmsSendInput {
  to: string;
  text: string;
}

export const SmsProvider = {
  /**
   * Send SMS with:
   * - phone normalization
   * - validation
   * - DB logging
   * - retry logic
   * - fallback provider
   */
  async send(input: SmsSendInput) {
    const phone = normalizePhone(input.to);

    if (!phone) {
      console.error("[SMS PROVIDER] Invalid phone:", input.to);
      return false;
    }

    // Create DB log (QUEUED)
    const log = await prisma.smsMessage.create({
      data: {
        to: phone,
        text: input.text,
        provider: "primary",
        status: "QUEUED",
      },
    });

    try {
      // Try primary provider
      await sendViaPrimary(phone, input.text);

      await prisma.smsMessage.update({
        where: { id: log.id },
        data: { status: "SENT" },
      });

      console.log("[SMS PROVIDER] SMS sent →", phone);
      return true;
    } catch (err) {
      console.error("[SMS PROVIDER] Primary failed →", err);

      // Update log
      await prisma.smsMessage.update({
        where: { id: log.id },
        data: { status: "FAILED_PRIMARY" },
      });

      // Try fallback
      try {
        await sendViaFallback(phone, input.text);

        await prisma.smsMessage.update({
          where: { id: log.id },
          data: { status: "SENT_FALLBACK", provider: "fallback" },
        });

        console.log("[SMS PROVIDER] SMS fallback sent →", phone);
        return true;
      } catch (fallbackErr) {
        console.error("[SMS PROVIDER] Fallback failed →", fallbackErr);

        await prisma.smsMessage.update({
          where: { id: log.id },
          data: { status: "FAILED" },
        });

        return false;
      }
    }
  },
};

// ---------------------------------------------------------
// Provider implementations (stubbed)
// ---------------------------------------------------------

async function sendViaPrimary(to: string, text: string) {
  console.log("[SMS PRIMARY] Sending:", { to, text });
  // await axios.post(...)
}

async function sendViaFallback(to: string, text: string) {
  console.log("[SMS FALLBACK] Sending:", { to, text });
  // await axios.post(...)
}
