// producers/order.producer.ts
import { BaseEventProducer } from "./base.producer";
import { EventPayloads, Events } from "../events";

export class OrderProducer extends BaseEventProducer {
  created = (payload: EventPayloads["order.created.v1"]) =>
    this.emit(Events.Order.Created, payload);

  confirmed = (payload: EventPayloads["order.confirmed.v1"]) =>
    this.emit(Events.Order.Confirmed, payload);

  processing = (payload: EventPayloads["order.processing.v1"]) =>
    this.emit(Events.Order.Processing, payload);

  shipped = (payload: EventPayloads["order.shipped.v1"]) =>
    this.emit(Events.Order.Shipped, payload);

  delivered = (payload: EventPayloads["order.delivered.v1"]) =>
    this.emit(Events.Order.Delivered, payload);

  failedDelivery = (payload: EventPayloads["order.failed_delivery.v1"]) =>
    this.emit(Events.Order.FailedDelivery, payload);

  returned = (payload: EventPayloads["order.returned.v1"]) =>
    this.emit(Events.Order.Returned, payload);

  cancelled = (payload: EventPayloads["order.cancelled.v1"]) =>
    this.emit(Events.Order.Cancelled, payload);

  statusUpdated = (payload: EventPayloads["order.status.updated.v1"]) =>
    this.emit(Events.Order.StatusUpdated, payload);
}
