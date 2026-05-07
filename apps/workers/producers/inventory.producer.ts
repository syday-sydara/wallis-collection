// producers/inventory.producer.ts
import { BaseEventProducer } from "./base.producer";
import { Events } from "../events";

export class InventoryProducer extends BaseEventProducer {
  reserved = (payload: EventPayloads["stock.reserved.v1"]) =>
    this.emit(Events.Inventory.Reserved, payload);

  released = (payload: EventPayloads["stock.released.v1"]) =>
    this.emit(Events.Inventory.Released, payload);

  consumed = (payload: EventPayloads["stock.consumed.v1"]) =>
    this.emit(Events.Inventory.Consumed, payload);

  expired = (payload: EventPayloads["stock.expired.v1"]) =>
    this.emit(Events.Inventory.Expired, payload);
}
