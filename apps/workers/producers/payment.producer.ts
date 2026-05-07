// producers/payment.producer.ts
import { BaseEventProducer } from "./base.producer";
import { EventPayloads, EventPayloads, Events } from "../events";

export class PaymentProducer extends BaseEventProducer {
  initiated = (payload: EventPayloads["payment.initiated.v1"]) =>
    this.emit(Events.Payment.Initiated, payload);

  success = (payload: EventPayloads["payment.success.v1"]) =>
    this.emit(Events.Payment.Success, payload);

  failed = (payload: EventPayloads["payment.failed.v1"]) =>
    this.emit(Events.Payment.Failed, payload);

  confirmed = (payload: EventPayloads["payment.confirmed.v1"]) =>
    this.emit(Events.Payment.Confirmed, payload);

  refunded = (payload: EventPayloads["payment.refunded.v1"]) =>
    this.emit(Events.Payment.Refunded, payload);
}
