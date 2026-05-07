// services/timeline/timeline-aggregator.ts

import { TimelineIdentityResolver } from "./identity-resolver";
import { TimelinePagination } from "./pagination";

// Repos
import { OrderTimelineRepo } from "./repositories/order.repo";
import { PaymentTimelineRepo } from "./repositories/payment.repo";
import { WhatsAppTimelineRepo } from "./repositories/whatsapp.repo";
import { SmsTimelineRepo } from "./repositories/sms.repo";
import { ReservationTimelineRepo } from "./repositories/reservation.repo";
import { AuditTimelineRepo } from "./repositories/audit.repo";

// Enrichers
import { OrderEnricher } from "./enrichers/order.enricher";
import { PaymentEnricher } from "./enrichers/payment.enricher";
import { WhatsAppEnricher } from "./enrichers/whatsapp.enricher";
import { SmsEnricher } from "./enrichers/sms.enricher";
import { ReservationEnricher } from "./enrichers/reservation.enricher";
import { AuditEnricher } from "./enrichers/audit.enricher";

export class TimelineAggregator {
  static async getTimeline(input: {
    identity: {
      customerId?: string;
      phone?: string;
      sessionId?: string;
    };
    cursor?: string | null;
    reverseCursor?: string | null;
    limit: number;
  }) {
    // ------------------------------------------------------
    // 1. Identity is already resolved by TimelineService
    // ------------------------------------------------------
    const identity = input.identity;

    // ------------------------------------------------------
    // 2. Fetch all domain events in parallel
    // ------------------------------------------------------
    const [
      orders,
      payments,
      whatsapp,
      sms,
      reservations,
      audits,
    ] = await Promise.all([
      OrderTimelineRepo.fetch(identity),
      PaymentTimelineRepo.fetch(identity),
      WhatsAppTimelineRepo.fetch(identity),
      SmsTimelineRepo.fetch(identity),
      ReservationTimelineRepo.fetch(identity),
      AuditTimelineRepo.fetch(identity),
    ]);

    // ------------------------------------------------------
    // 3. Normalize + enrich each domain event
    // ------------------------------------------------------
    const timeline = [
      ...orders.map(OrderEnricher.enrich),
      ...payments.map(PaymentEnricher.enrich),
      ...whatsapp.map(WhatsAppEnricher.enrich),
      ...sms.map(SmsEnricher.enrich),
      ...reservations.map(ReservationEnricher.enrich),
      ...audits.map(AuditEnricher.enrich),
    ];

    // ------------------------------------------------------
    // 4. Sort descending (newest first)
    // ------------------------------------------------------
    timeline.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    // ------------------------------------------------------
    // 5. Cursor-based pagination
    // ------------------------------------------------------
    return TimelinePagination.paginate(timeline, {
      cursor: input.cursor ?? null,
      reverseCursor: input.reverseCursor ?? null,
      limit: input.limit,
    });
  }
}
