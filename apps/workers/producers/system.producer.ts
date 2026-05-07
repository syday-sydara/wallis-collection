// producers/system.producer.ts
import { BaseEventProducer } from "./base.producer";
import { Events } from "../events";

export class SystemProducer extends BaseEventProducer {
  auditLogCreated = (payload: EventPayloads["audit.created.v1"]) =>
    this.emit(Events.System.AuditLogCreated, payload);

  heartbeat = (payload: EventPayloads["system.heartbeat.v1"]) =>
    this.emit(Events.System.Heartbeat, payload);
}
