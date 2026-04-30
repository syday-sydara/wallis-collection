// lib/whatsapp/router.ts

import { sendOnboardingMenu } from "@/lib/whatsapp/onboarding/buttons";
import { sendPhoneSelection } from "@/lib/whatsapp/onboarding/phone";
import { sendOrderSelection } from "@/lib/whatsapp/onboarding/orders";
import { sendTrackingLink } from "@/lib/whatsapp/onboarding/track";
import { WhatsAppService } from "@/lib/whatsapp/service";

import {
  trackWhatsAppMessage,
  trackWhatsAppNotFound,
  isUserInCooldown,
} from "@/lib/whatsapp/abuse";

export async function handleWhatsAppInteraction(event: any) {
  const from = event.from;

  /* -------------------------------------------------- */
  /* Abuse: Cooldown check                               */
  /* -------------------------------------------------- */
  if (await isUserInCooldown(from)) {
    return WhatsAppService.sendText(
      from,
      "You're sending too many messages. Please wait a moment before trying again.",
    );
  }

  /* -------------------------------------------------- */
  /* Abuse: Track message frequency                      */
  /* -------------------------------------------------- */
  const { isHighFrequency } = await trackWhatsAppMessage(from);

  if (isHighFrequency) {
    return WhatsAppService.sendText(
      from,
      "You're messaging too quickly. Please slow down.",
    );
  }

  const button = event.interactive?.button_reply?.id;
  const list = event.interactive?.list_reply?.id;

  /* -------------------------------------------------- */
  /* No interactive input → onboarding menu              */
  /* -------------------------------------------------- */
  if (!button && !list) {
    return sendOnboardingMenu(from);
  }

  /* -------------------------------------------------- */
  /* Button actions                                      */
  /* -------------------------------------------------- */
  if (button === "onboard_track_order") {
    return sendPhoneSelection(from);
  }

  if (button === "onboard_support") {
    return WhatsAppService.sendText(from, "Connecting you to support...");
  }

  if (button === "onboard_faq") {
    return WhatsAppService.sendText(
      from,
      "Visit our FAQ page:\nhttps://example.com/faq",
    );
  }

  /* -------------------------------------------------- */
  /* List selections                                     */
  /* -------------------------------------------------- */
  if (list?.startsWith("phone_")) {
    const phone = list.replace("phone_", "");
    return sendOrderSelection(from, phone);
  }

  if (list?.startsWith("order_")) {
    const orderId = list.replace("order_", "");
    return sendTrackingLink(from, orderId);
  }

  /* -------------------------------------------------- */
  /* Unknown command → track as suspicious               */
  /* -------------------------------------------------- */
  const { isSuspicious } = await trackWhatsAppNotFound(from);

  if (isSuspicious) {
    return WhatsAppService.sendText(
      from,
      "I'm having trouble understanding your messages. Please use the menu options.",
    );
  }

  return WhatsAppService.sendText(
    from,
    "I didn't understand that. Please choose an option from the menu.",
  );
}
