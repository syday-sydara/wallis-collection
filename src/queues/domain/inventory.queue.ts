// workers/inventory.worker.ts
import { Worker } from "bullmq";
import { inventoryQueue } from "./inventory.queue";
import { connection } from "../../config/env";
import type { EventPayloads, EventName } from "../../events/payloads";
import { Events } from "../../events"; // ← FIXED

export const inventoryWorker = new Worker<EventPayloads[EventName]>(
  inventoryQueue.name,
  async job => {
    const event = job.name as EventName;
    const payload = job.data as EventPayloads[typeof event];

    switch (event) {
      case Events.STOCK_RESERVED: {
        const { quantity } = payload;
        // handle reserved
        break;
      }

      case Events.STOCK_RELEASED: {
        // handle released
        break;
      }

      case Events.STOCK_CONSUMED: {
        const { reservationId } = payload;
        // handle consumed
        break;
      }

      default:
        throw new Error(`Unhandled inventory event: ${event}`);
    }
  },
  { connection }
);
