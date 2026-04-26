// lib/whatsapp/onboarding/phones.ts

import { prisma } from "@/lib/prisma";
import { sendWhatsAppList } from "../list";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { normalizePhoneForWhatsApp } from "@/lib/utils/formatters/phone";

export async function sendPhoneSelection(to: string) {
  const phone = normalizePhoneForWhatsApp(to);

  const phones = await prisma.order.findMany({
    where: { whatsapp: phone },
    select: { phone: true },
    distinct: ["phone"],
  });

  if (!phones.length) {
    return sendWhatsAppList({
      to: phone,
      body: "I couldn't find any phone numbers linked to your WhatsApp.",
      buttonText: "Try Again",
      sections: [
        {
          title: "Options",
          rows: [{ id: "onboard_retry", title: "Restart" }],
        },
      ],
    });
  }

  await emitSecurityEvent({
    type: "WHATSAPP_ONBOARDING_PHONE_LIST",
    message: `Sent phone selection list to ${phone}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "onboarding", "phone_list"],
    metadata: { to: phone, count: phones.length },
  });

  return sendWhatsAppList({
    to: phone,
    body: "Which phone number did you use when placing your order?",
    buttonText: "Select Number",
    sections: [
      {
        title: "Your Phone Numbers",
        rows: phones.map((p) => ({
          id: `phone_${p.phone}`,
          title: p.phone,
        })),
      },
    ],
  });
}
