// lib/whatsapp/onboarding/buttons.ts

import { WhatsAppService } from "@/lib/whatsapp/service";

export async function sendWhatsAppButtons(payload: {
  to: string;
  message: string;
  buttons: { id: string; title: string }[];
}) {
  return WhatsAppService.sendButtons(payload);
}

/**
 * The main onboarding menu shown when a user first messages us.
 */
export async function sendOnboardingMenu(to: string) {
  return WhatsAppService.sendButtons({
    to,
    message: "Welcome! How can I help you today?",
    buttons: [
      { id: "onboard_track_order", title: "Track My Order" },
      { id: "onboard_support", title: "Talk to Support" },
      { id: "onboard_faq", title: "FAQ" },
    ],
  });
}
