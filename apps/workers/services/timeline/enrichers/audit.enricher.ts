import { TimelineEntry } from "../../../domain/timeline";

export class AuditEnricher {
  static enrich(a): TimelineEntry {
    return {
      id: a.id,
      type: "audit_log",
      timestamp: a.createdAt,
      title: `Audit: ${a.action}`,
      description: a.metadata ? JSON.stringify(a.metadata) : undefined,
      icon: "📝",
      data: a,
    };
  }
}
