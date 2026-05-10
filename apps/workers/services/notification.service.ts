// services/notification.service.ts
import { prisma } from "@/lib/prisma";
import { normalizePhone } from "@/utils/phone";
import { Messaging } from "@/services/messaging.service";
import { WhatsAppService } from "@/services/whatsapp.service";
import {
  NotificationTemplates,
  NotificationMessage,
} from "@/templates/notification.templates";
import { logger } from "@/lib/logger";
import { Correlation } from "@/lib/correlation";

export const NotificationService = {
  /**
   * Main entry point for all notifications.
   * Accepts eventName + eventPayload from NotificationWorker.
   *
   * Strategy:
   * - Build typed notification message from template
   * - Resolve identity (email / phone / sessionId)
   * - If sessionId → WhatsApp session template
   * - Else → Messaging fallback (WhatsApp → SMS → Email) using best identity
   */
  async send(event: string, payload: any) {
    const ctx = Correlation.get();
    const templateFn = NotificationTemplates[event];

    if (!templateFn) {
      logger.warn("[NOTIFICATION] No template found for event", {
        ...ctx,
        event,
      });
      return;
    }

    const message: NotificationMessage = templateFn(payload);

    const email = await this.resolveEmail(payload);
    const phone = this.resolvePhone(payload);
    const sessionId = payload.sessionId as string | undefined;

    // 1. If we have a WhatsApp session, use session-based template
    if (sessionId) {
      await this.sendWhatsAppSession(message, payload, sessionId);
      return;
    }

    // 2. Otherwise, use Messaging fallback with best identity
    const target = email ?? phone;
    if (!target) {
      logger.warn("[NOTIFICATION] No reachable identity (email/phone) for notification", {
        ...ctx,
        event,
        payload,
      });
      return;
    }

    await Messaging.send({
      to: target,
      text: message.bodyText,
      subject: message.subject,
      html: message.bodyHtml,
      metadata: {
        event,
        customerId: payload.customerId,
        orderId: payload.orderId,
      },
    });
  },

  // ------------------------------------------------------
  // Identity resolution
  // ------------------------------------------------------
  async resolveEmail(payload: any): Promise<string | null> {
    if (payload.email) return payload.email;

    if (payload.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: payload.customerId },
      });
      return customer?.email ?? null;
    }

    return null;
  },

  resolvePhone(payload: any): string | null {
    if (payload.customerPhone) {
      return normalizePhone(payload.customerPhone);
    }
    if (payload.phone) {
      return normalizePhone(payload.phone);
    }
    return null;
  },

  // ------------------------------------------------------
  // WhatsApp (session-based)
  // ------------------------------------------------------
  async sendWhatsAppSession(
    message: NotificationMessage,
    payload: any,
    sessionId: string
  ) {
    const ctx = Correlation.get();

    try {
      await WhatsAppService.sendTemplate({
        sessionId,
        event: message.event,
        payload,
      });

      logger.info("[NOTIFICATION] WhatsApp session notification enqueued", {
        ...ctx,
        sessionId,
        event: message.event,
      });
    } catch (err: any) {
      logger.error("[NOTIFICATION] WhatsApp session enqueue failed", {
        ...ctx,
        sessionId,
        error: err.message,
      });
    }
  },

  // ------------------------------------------------------
  // Convenience wrappers
  // ------------------------------------------------------
  sendOrderConfirmed(payload: any) {
    return this.send("order.confirmed", payload);
  },

  sendOrderShipped(payload: any) {
    return this.send("order.shipped", payload);
  },

  sendOrderDelivered(payload: any) {
    return this.send("order.delivered", payload);
  },

  sendPaymentSuccess(payload: any) {
    return this.send("payment.success", payload);
  },

  sendPaymentFailed(payload: any) {
    return this.send("payment.failed", payload);
  },

  sendShipmentCreated(payload: any) {
    return this.send("shipment.created", payload);
  },

  sendFailedDelivery(payload: any) {
    return this.send("shipment.failed_delivery", payload);
  },
};
