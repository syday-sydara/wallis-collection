// services/timeline/identity-resolver.ts

export interface TimelineIdentity {
  customerId?: string;
  phone?: string;
  sessionId?: string;
}

/**
 * Identity resolution rules:
 *
 * 1. If customerId is provided → highest priority
 * 2. Else if phone is provided → normalize and use
 * 3. Else if sessionId is provided → fallback identity
 * 4. Else → no identity (empty timeline)
 */
export class TimelineIdentityResolver {
  static async resolve(input: {
    customerId?: string;
    phone?: string;
    sessionId?: string;
  }): Promise<TimelineIdentity | null> {
    // 1. Customer ID wins
    if (input.customerId) {
      return { customerId: input.customerId };
    }

    // 2. Phone number normalization
    if (input.phone) {
      const normalized = TimelineIdentityResolver.normalizePhone(input.phone);
      return { phone: normalized };
    }

    // 3. WhatsApp session fallback
    if (input.sessionId) {
      return { sessionId: input.sessionId };
    }

    // 4. No identity → no timeline
    return null;
  }

  /**
   * Nigeria-first phone normalization:
   * - Remove spaces
   * - Remove leading "+"
   * - Convert 080 → +23480
   */
  private static normalizePhone(phone: string): string {
    let p = phone.trim().replace(/\s+/g, "");

    if (p.startsWith("+")) p = p.slice(1);

    // Convert 080 → 23480
    if (p.startsWith("0")) {
      p = "234" + p.slice(1);
    }

    return p;
  }
}
