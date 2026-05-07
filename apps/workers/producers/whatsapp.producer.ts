// producers/whatsapp.producer.ts
import { BaseEventProducer } from "./base.producer";
import { EventPayloads, Events } from "../events";

export class WhatsAppProducer extends BaseEventProducer {
  sessionStarted = (payload: EventPayloads["whatsapp.session.started.v1"]) =>
    this.emit(Events.WhatsApp.SessionStarted, payload);

  sessionUpdated = (payload: EventPayloads["whatsapp.session.updated.v1"]) =>
    this.emit(Events.WhatsApp.SessionUpdated, payload);

  sessionEnded = (payload: EventPayloads["whatsapp.session.ended.v1"]) =>
    this.emit(Events.WhatsApp.SessionEnded, payload);

  messageReceived = (payload: EventPayloads["whatsapp.message.received.v1"]) =>
    this.emit(Events.WhatsApp.MessageReceived, payload);

  messageSent = (payload: EventPayloads["whatsapp.message.sent.v1"]) =>
    this.emit(Events.WhatsApp.MessageSent, payload);
}
