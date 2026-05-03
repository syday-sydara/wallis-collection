// services/timeline/identity-resolver.ts
import { prisma } from "../../lib/prisma";
import { normalizePhone } from "../../utils/phone";

export class TimelineIdentityResolver {
  static async resolve(input: {
    customerId?: string;
    phone?: string;
    sessionId?: string;
  }) {
    let customerId = input.customerId ?? null;
    let phoneNormalized = input.phone ? normalizePhone(input.phone) : null;
    let sessionId = input.sessionId ?? null;

    // ------------------------------------------------------
    // 1. Resolve via sessionId
    // ------------------------------------------------------
    if (sessionId) {
      const session = await prisma.whatsAppSession.findUnique({
        where: { id: sessionId },
      });

      if (session) {
        customerId = session.customerId ?? customerId;
        phoneNormalized = session.phoneNormalized ?? phoneNormalized;
      }
    }

    // ------------------------------------------------------
    // 2. Resolve via phone
    // ------------------------------------------------------
    if (phoneNormalized && !customerId) {
      const customer = await prisma.customer.findUnique({
        where: { phone: phoneNormalized },
      });

      if (customer) {
        customerId = customer.id;
      }
    }

    // ------------------------------------------------------
    // 3. Resolve sessionId via phone or customer
    // ------------------------------------------------------
    if (!sessionId) {
      if (phoneNormalized) {
        const session = await prisma.whatsAppSession.findUnique({
          where: { phoneNormalized },
        });
        if (session) sessionId = session.id;
      }

      if (!sessionId && customerId) {
        const session = await prisma.whatsAppSession.findFirst({
          where: { customerId },
          orderBy: { lastInboundAt: "desc" },
        });
        if (session) sessionId = session.id;
      }
    }

    return { customerId, phoneNormalized, sessionId };
  }
}
