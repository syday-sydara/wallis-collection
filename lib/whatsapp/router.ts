// lib/whatsapp/router.ts

import { sendOnboardingMenu } from "@/lib/whatsapp/onboarding/buttons";
import { sendPhoneSelection } from "@/lib/whatsapp/onboarding/phone";
import { sendOrderSelection } from "./onboarding/orders";
import { sendTrackingLink } from "./onboarding/track";

export async function handleWhatsAppInteraction(event: any) {
  const from = event.from;
  const button = event.interactive?.button_reply?.id;
  const list = event.interactive?.list_reply?.id;

  // 1. User says "Hi"
  if (!button && !list) {
    return sendOnboardingMenu(from);
  }

  // 2. Button actions
  if (button === "onboard_track_order") {
    return sendPhoneSelection(from);
  }

  if (button === "onboard_support") {
    return sendWhatsAppMessage(from, "Connecting you to support...");
  }

  if (button === "onboard_faq") {
    return sendWhatsAppMessage(from, "Visit our FAQ page:\nhttps://example.com/faq");
  }

  // 3. List selections
  if (list?.startsWith("phone_")) {
    const phone = list.replace("phone_", "");
    return sendOrderSelection(from, phone);
  }

  if (list?.startsWith("order_")) {
    const orderId = list.replace("order_", "");
    return sendTrackingLink(from, orderId);
  }
}
