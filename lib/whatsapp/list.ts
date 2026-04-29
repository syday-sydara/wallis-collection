// lib/whatsapp/list.ts

import { withSpan } from "@/lib/core/with-span";
import { log } from "@/lib/core/log";
import { metricsWithContext } from "@/lib/core/metrics-context";
import { serviceContext } from "@/lib/core/service-context";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";
import { normalizePhoneForWhatsApp } from "@/lib/utils/formatters/phone";
import { WhatsAppService } from "@/lib/whatsapp/service";

export async function sendWhatsAppList(payload: {
  to: string;
  header?: string;
  body: string;
  footer?: string;
  buttonText: string;
  sections: {
    title: string;
    rows: { id: string; title: string; description?: string }[];
  }[];
}) {
  return withSpan("whatsapp.send_list", async () => {
    const ctx = serviceContext.get();
    const normalized = normalizePhoneForWhatsApp(payload.to);

    metricsWithContext.increment("whatsapp.list.sent");

    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_LIST_SENT",
      message: `WhatsApp list sent to ${normalized}`,
      severity: "low",
      tags: ["whatsapp", "list"],
      metadata: { to: normalized, ...ctx },
      source: EventSource.WhatsAppAPI,
    });

    log.info("WhatsApp list sent", { to: normalized });

    return WhatsAppService.sendList({
      ...payload,
      to: normalized,
    });
  });
}
