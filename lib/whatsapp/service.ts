// lib/whatsapp/service.ts

import { normalizePhoneForWhatsApp } from "../utils/formatters/phone";
import { emitSecurityEvent, emitAlertEvent } from "@/lib/events/emitter";
import { EventSource } from "@/lib/events/types";
import { signRiderLink } from "../rider/sign";

const BASE_URL = "https://graph.facebook.com/v18.0";
const TIMEOUT_MS = 8000;
const MAX_ATTEMPTS = 2;

type WhatsAppResult =
  | { ok: true }
  | { ok: false; error: string; status?: number; raw?: any };

type MediaType = "image" | "document";

export class WhatsAppService {
  private static getTokenAndPhoneId() {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneId) {
      return null;
    }

    return { token, phoneId };
  }

  private static async callWhatsAppApi(
    to: string,
    body: any,
    meta: {
      operation: string;
      tags: string[];
      context?: string;
    }
  ): Promise<WhatsAppResult> {
    const creds = this.getTokenAndPhoneId();

    if (!creds) {
      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_MISSING_CREDENTIALS",
        message: "WhatsApp API credentials missing",
        severity: "high",
        tags: ["whatsapp", "credentials_missing", ...meta.tags],
        metadata: { operation: meta.operation },
        source: EventSource.WhatsAppAPI,
      });

      return { ok: false, error: "missing_credentials" };
    }

    const normalized = normalizePhoneForWhatsApp(to);

    if (!normalized) {
      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_INVALID_NUMBER",
        message: `Invalid WhatsApp number: ${to}`,
        severity: "medium",
        tags: ["whatsapp", "invalid_number", ...meta.tags],
        metadata: { raw: to, operation: meta.operation },
        source: EventSource.WhatsAppAPI,
      });

      return { ok: false, error: "invalid_number" };
    }

    const url = `${BASE_URL}/${creds.phoneId}/messages`;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

      try {
        const res = await fetch(url, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${creds.token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ...body, to: normalized }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (res.ok) {
          await emitSecurityEvent({
            kind: "security",
            type: "WHATSAPP_MESSAGE_SENT",
            message: `WhatsApp ${meta.operation} sent to ${normalized}`,
            severity: "low",
            tags: ["whatsapp", "sent", ...meta.tags],
            metadata: {
              to: normalized,
              operation: meta.operation,
              attempt,
            },
            source: EventSource.WhatsAppAPI,
          });

          return { ok: true };
        }

        let errorBody: any;
        try {
          errorBody = await res.json();
        } catch {
          errorBody = await res.text();
        }

        const status = res.status;

        await emitSecurityEvent({
          kind: "security",
          type: "WHATSAPP_MESSAGE_SEND_FAILED",
          message: `Failed to send WhatsApp ${meta.operation} to ${normalized}`,
          severity: status >= 500 ? "high" : "medium",
          tags: ["whatsapp", "send_failed", ...meta.tags],
          metadata: {
            to: normalized,
            status,
            error: errorBody,
            attempt,
            operation: meta.operation,
          },
          source: EventSource.WhatsAppAPI,
        });

        if (status === 429) {
          return { ok: false, error: "rate_limited", status, raw: errorBody };
        }

        if (status >= 500 && attempt < MAX_ATTEMPTS) {
          await new Promise((r) => setTimeout(r, 300 * attempt));
          continue;
        }

        if (attempt === MAX_ATTEMPTS) {
          await emitAlertEvent({
            kind: "alert",
            event: "ALERT_SYSTEM_FAILURE",
            severity: "high",
            metadata: {
              to: normalized,
              status,
              error: errorBody,
              operation: meta.operation,
            },
            source: EventSource.WhatsAppAPI,
          });
        }

        return { ok: false, error: "api_error", status, raw: errorBody };
      } catch (err: any) {
        clearTimeout(timeout);

        await emitSecurityEvent({
          kind: "security",
          type: "WHATSAPP_MESSAGE_NETWORK_ERROR",
          message: `Network error sending WhatsApp ${meta.operation} to ${normalized}`,
          severity: "high",
          tags: ["whatsapp", "network_error", ...meta.tags],
          metadata: {
            to: normalized,
            error: err?.message,
            attempt,
            operation: meta.operation,
          },
          source: EventSource.WhatsAppAPI,
        });

        if (attempt === MAX_ATTEMPTS) {
          await emitAlertEvent({
            kind: "alert",
            event: "ALERT_SYSTEM_FAILURE",
            severity: "high",
            metadata: {
              to: normalized,
              error: err?.message,
              operation: meta.operation,
            },
            source: EventSource.WhatsAppAPI,
          });

          return { ok: false, error: "network_error" };
        }

        await new Promise((r) => setTimeout(r, 300 * attempt));
      }
    }

    return { ok: false, error: "unknown" };
  }

  // ---------- Public API ----------

  static async sendText(to: string, message: string): Promise<WhatsAppResult> {
    return this.callWhatsAppApi(
      to,
      {
        messaging_product: "whatsapp",
        type: "text",
        text: { body: message },
      },
      {
        operation: "text",
        tags: ["text"],
      }
    );
  }

  static async sendButtons(payload: {
    to: string;
    message: string;
    buttons: { id: string; title: string }[];
  }): Promise<WhatsAppResult> {
    const { to, message, buttons } = payload;

    return this.callWhatsAppApi(
      to,
      {
        messaging_product: "whatsapp",
        type: "interactive",
        interactive: {
          type: "button",
          body: { text: message },
          action: {
            buttons: buttons.map((b) => ({
              type: "reply",
              reply: { id: b.id, title: b.title },
            })),
          },
        },
      },
      {
        operation: "buttons",
        tags: ["buttons"],
      }
    );
  }

  static async sendList(payload: {
    to: string;
    body: string;
    buttonText: string;
    header?: string;
    footer?: string;
    sections: {
      title: string;
      rows: { id: string; title: string; description?: string }[];
    }[];
  }): Promise<WhatsAppResult> {
    const { to, body, buttonText, header, footer, sections } = payload;

    const interactive: any = {
      type: "list",
      body: { text: body },
      action: {
        button: buttonText,
        sections: sections.map((section) => ({
          title: section.title,
          rows: section.rows.map((row) => ({
            id: row.id,
            title: row.title,
            description: row.description,
          })),
        })),
      },
    };

    if (header) {
      interactive.header = { type: "text", text: header };
    }

    if (footer) {
      interactive.footer = { text: footer };
    }

    return this.callWhatsAppApi(
      to,
      {
        messaging_product: "whatsapp",
        type: "interactive",
        interactive,
      },
      {
        operation: "list",
        tags: ["list"],
      }
    );
  }

  static async sendMedia(payload: {
    to: string;
    type: MediaType;
    mediaUrl: string;
    caption?: string;
    filename?: string;
  }): Promise<WhatsAppResult> {
    const { to, type, mediaUrl, caption, filename } = payload;

    const media: any = { link: mediaUrl };
    if (caption) media.caption = caption;
    if (filename && type === "document") media.filename = filename;

    return this.callWhatsAppApi(
      to,
      {
        messaging_product: "whatsapp",
        type,
        [type]: media,
      },
      {
        operation: `media_${type}`,
        tags: ["media", type],
      }
    );
  }

  static async sendTemplate(payload: {
    to: string;
    template: string;
    language?: string;
    variables?: string[];
  }): Promise<WhatsAppResult> {
    const { to, template, language = "en", variables = [] } = payload;

    const components =
      variables.length > 0
        ? [
            {
              type: "body",
              parameters: variables.map((v) => ({
                type: "text",
                text: v,
              })),
            },
          ]
        : [];

    return this.callWhatsAppApi(
      to,
      {
        messaging_product: "whatsapp",
        type: "template",
        template: {
          name: template,
          language: { code: language },
          components,
        },
      },
      {
        operation: "template",
        tags: ["template", template],
      }
    );
  }

  static async sendReceipt(order: any): Promise<WhatsAppResult> {
    const normalized = normalizePhoneForWhatsApp(order.phone) || order.phone;

    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_RECEIPT_GENERATED",
      message: `Receipt generated for order ${order.id}`,
      severity: "low",
      tags: ["whatsapp", "receipt_generated"],
      metadata: {
        orderId: order.id,
        phone: normalized,
        itemCount: order.items?.length ?? 0,
        paymentMethod: order.paymentMethod,
      },
      source: EventSource.WhatsAppAPI,
    });

    const items = (order.items ?? [])
      .map(
        (item: any) =>
          `• ${item.name} x${item.quantity} — ₦${item.unitPrice.toLocaleString()}`
      )
      .join("\n");

    const subtotal = `₦${order.subtotal?.toLocaleString() ?? "0"}`;
    const shipping = `₦${order.shippingCost?.toLocaleString() ?? "0"}`;
    const total = `₦${order.total?.toLocaleString() ?? "0"}`;

    const payment =
      order.paymentMethod === "CASH" ? "Cash on Delivery" : "Paid Online";

    const message = `
🧾 *Order Receipt*
Order #${order.id.slice(0, 8)}
Name: ${order.fullName || "Customer"}
Phone: ${normalized}

📦 *Items*
${items || "No items found"}

💰 *Subtotal:* ${subtotal}
🚚 *Shipping:* ${shipping}
🧮 *Total:* ${total}

💳 *Payment:* ${payment}

📍 *Delivery Notes*
${order.deliveryNotes || "None"}

🔗 *Track your order*
${process.env.NEXT_PUBLIC_APP_URL}/track/${order.trackingToken}
    `.trim();

    const result = await this.sendText(normalized, message);

    if (!result.ok) {
      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_RECEIPT_SEND_FAILED",
        message: `Failed to send receipt to ${normalized}`,
        severity: "high",
        tags: ["whatsapp", "receipt_failed"],
        metadata: {
          orderId: order.id,
          phone: normalized,
          error: result.error,
        },
        source: EventSource.WhatsAppAPI,
      });
    } else {
      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_RECEIPT_SENT",
        message: `Receipt sent to ${normalized}`,
        severity: "low",
        tags: ["whatsapp", "receipt_sent"],
        metadata: {
          orderId: order.id,
          phone: normalized,
        },
        source: EventSource.WhatsAppAPI,
      });
    }

    return result;
  }

  static async sendRiderLinks(fulfillment: any): Promise<WhatsAppResult> {
    const order = fulfillment?.order;
    const orderId = fulfillment?.orderId;

    if (!order || !order.phone) {
      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_RIDER_LINKS_MISSING_ORDER",
        message: `Missing order data for fulfillment ${fulfillment?.id}`,
        severity: "high",
        tags: ["whatsapp", "rider_links", "missing_order"],
        metadata: { fulfillmentId: fulfillment?.id },
        source: EventSource.WhatsAppAPI,
      });

      return { ok: false, error: "missing_order_data" };
    }

    const normalized = normalizePhoneForWhatsApp(order.phone) || order.phone;

    const delivered = signRiderLink(fulfillment.id, "DELIVERED");
    const failed = signRiderLink(fulfillment.id, "FAILED");

    const message = [
      `Rider Update Link for Order #${orderId}`,
      "",
      "Tap one option:",
      "",
      `✔️ Delivered:\n${delivered}`,
      "",
      `❌ Delivery Failed:\n${failed}`,
    ].join("\n");

    await emitSecurityEvent({
      kind: "security",
      type: "WHATSAPP_RIDER_LINKS_GENERATED",
      message: `Generated rider update links for fulfillment ${fulfillment.id}`,
      severity: "medium",
      tags: ["whatsapp", "rider_links", "generated"],
      metadata: {
        fulfillmentId: fulfillment.id,
        orderId,
        phone: normalized,
      },
      source: EventSource.WhatsAppAPI,
    });

    const result = await this.sendText(normalized, message);

    if (!result.ok) {
      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_RIDER_LINKS_SEND_FAILED",
        message: `Failed to send rider update links to ${normalized}`,
        severity: "high",
        tags: ["whatsapp", "rider_links", "failed"],
        metadata: {
          fulfillmentId: fulfillment.id,
          orderId,
          phone: normalized,
          error: result.error,
        },
        source: EventSource.WhatsAppAPI,
      });
    } else {
      await emitSecurityEvent({
        kind: "security",
        type: "WHATSAPP_RIDER_LINKS_SENT",
        message: `Rider update links sent to ${normalized}`,
        severity: "low",
        tags: ["whatsapp", "rider_links", "sent"],
        metadata: {
          fulfillmentId: fulfillment.id,
          orderId,
          phone: normalized,
        },
        source: EventSource.WhatsAppAPI,
      });
    }

    return result;
  }
}
