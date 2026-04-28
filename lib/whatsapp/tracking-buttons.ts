// lib/whatsapp/tracking-buttons.ts

import { WhatsAppService } from "@/lib/whatsapp/service";
import { emitSecurityEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";

export async function sendTrackingButtons(to: string, orderId: string) {
  await emitSecurityEvent({
    kind: "security",
    type: "WHATSAPP_TRACKING_BUTTONS_SENT",
    message: `Tracking buttons sent to ${to} for order ${orderId}`,
    severity: "low",
    tags: ["whatsapp", "tracking_buttons"],
    metadata: { to, orderId },
    source: EventSource.WhatsAppAPI,
  });

  return WhatsAppService.sendButtons({
    to,
    message: `What would you like to do next for order ${orderId}?`,
    buttons: [
      { id: "track_again", title: "Track Again" },
      { id: "talk_support", title: "Talk to Support" },
      { id: "view_timeline", title: "View Timeline" },
    ],
  });
}
