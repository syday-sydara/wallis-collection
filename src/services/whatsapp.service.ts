// services/whatsapp.service.ts
import { whatsappTemplates } from "../templates/whatsapp.templates";
import { WhatsAppOutboundProducer } from "../producers/whatsapp.outbound.producer";

export interface WhatsAppSendTemplateInput {
  sessionId: string;
  to: string;
  template: string;   // template key (e.g. "order.confirmed")
  variables: any;     // raw payload passed to resolver
}

export class WhatsAppService {
  /**
   * Main entry point for sending WhatsApp template messages.
   * - Normalizes phone number
   * - Resolves template variables
   * - Enqueues outbound job
   */
  static async sendTemplate(input: WhatsAppSendTemplateInput) {
    const { sessionId, to, template, variables } = input;

    const normalizedPhone = this.normalizePhone(to);
    const tpl = whatsappTemplates[template];

    if (!tpl) {
      console.error("[WHATSAPP SERVICE] Unknown template:", template);
      return;
    }

    const resolvedVars = tpl.resolve(variables);

    await WhatsAppOutboundProducer.send(
      tpl.name,          // WhatsApp Cloud API template name
      normalizedPhone,   // normalized phone
      {
        sessionId,
        ...variables,
        resolvedVars,
      }
    );

    console.log("[WHATSAPP SERVICE] Enqueued outbound message:", {
      template: tpl.name,
      to: normalizedPhone,
    });
  }

  /**
   * Nigeria‑first phone normalization
   * - Accepts: 0803..., +234803..., 234803..., 803...
   * - Outputs: +234803xxxxxxx
   */
  static normalizePhone(phone: string): string {
    if (!phone) return phone;

    let p = phone.trim();

    // Remove spaces, hyphens, parentheses
    p = p.replace(/[\s\-()]/g, "");

    // Already in +234 format
    if (p.startsWith("+234")) return p;

    // 234803xxxxxxx → +234803xxxxxxx
    if (p.startsWith("234")) return `+${p}`;

    // 0803xxxxxxx → +234803xxxxxxx
    if (p.startsWith("0")) return `+234${p.slice(1)}`;

    // 803xxxxxxx → +234803xxxxxxx
    if (/^\d{10}$/.test(p)) return `+234${p}`;

    // Fallback: ensure + prefix
    if (!p.startsWith("+")) return `+${p}`;

    return p;
  }
}
