import { sendWhatsAppButtons } from "./buttons";

export async function sendTrackingButtons(to: string, orderId: string) {
  return sendWhatsAppButtons({
    to,
    message: `What would you like to do next for order ${orderId}?`,
    buttons: [
      { id: "track_again", title: "Track Again" },
      { id: "talk_support", title: "Talk to Support" },
      { id: "view_timeline", title: "View Timeline" },
    ],
  });
}
