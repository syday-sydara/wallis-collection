import { TimelineEntry } from "../../../domain/timeline";

export class SmsEnricher {
  static enrich(s): TimelineEntry {
    return {
      id: s.id,
      type: "sms_message",
      timestamp: s.createdAt,
      phoneNormalized: s.to,
      title: "SMS sent",
      description: s.text,
      icon: "📱",
      data: s,
    };
  }
}
