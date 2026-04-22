// lib/whatsapp/tracking-buttons.ts

import { sendWhatsAppButtons } from "./buttons";
import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent } from "@/lib/events/emitter";

export async function sendTrackingButtons(to: string, orderId: string) {
  const normalized = normalizePhoneForWhatsApp(to) || to;

  /* -------------------------------------------------- */
  /* Log event for observability                         */
  /* -------------------------------------------------- */
  await emitSecurityEvent({
    type: "WHATSAPP_TRACKING_BUTTONS_SENT",
    message: `Tracking buttons sent to ${normalized} for order ${orderId}`,
    severity: "low",
    context: "whatsapp",
    operation: "send",
    category: "whatsapp",
    tags: ["whatsapp", "tracking_buttons"],
    metadata: {
      to: normalized,
      orderId,
    },
    source: "whatsapp_api",
  });

  /* -------------------------------------------------- */
  /* Send interactive buttons                            */
  /* -------------------------------------------------- */
  return sendWhatsAppButtons({
    to: normalized,
    message: `What would you like to do next for order ${orderId}?`,
    buttons: [
      { id: "track_again", title: "Track Again" },
      { id: "talk_support", title: "Talk to Support" },
      { id: "view_timeline", title: "View Timeline" },
    ],
  });
}
