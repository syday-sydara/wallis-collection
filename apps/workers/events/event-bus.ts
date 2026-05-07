// events/event-bus.ts
import { Queue } from "bullmq";
import {
  OrderProducer,
  PaymentProducer,
  InventoryProducer,
  WhatsAppProducer,
  SystemProducer,
} from "../producers";

export function createEventBus(queues: {
  orderQueue: Queue;
  paymentQueue: Queue;
  inventoryQueue: Queue;
  whatsappQueue: Queue;
  systemQueue: Queue;
}) {
  return {
    order: new OrderProducer(queues.orderQueue),
    payment: new PaymentProducer(queues.paymentQueue),
    inventory: new InventoryProducer(queues.inventoryQueue),
    whatsapp: new WhatsAppProducer(queues.whatsappQueue),
    system: new SystemProducer(queues.systemQueue),
  };
}
