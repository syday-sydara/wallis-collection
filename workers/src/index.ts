import { orderWorker } from "./workers/order.worker";
import { paymentWorker } from "./workers/payment.worker";
import { inventoryReserveWorker } from "./workers/inventory.reserve.worker";
import { notificationWorker } from "./workers/notification.worker";

const workers = [
  orderWorker,
  paymentWorker,
  inventoryReserveWorker,
  notificationWorker,
];

console.log("🚀 BullMQ Worker System Running");

// Attach error listeners
for (const w of workers) {
  w.on("error", (err) => {
    console.error(`❌ Worker error [${w.name}]`, err);
  });

  w.on("failed", (job, err) => {
    console.error(`❌ Job failed [${w.name}]`, job.name, err);
  });

  w.on("completed", (job) => {
    console.log(`✅ Job completed [${w.name}]`, job.name);
  });
}

// Graceful shutdown
async function shutdown() {
  console.log("🛑 Shutting down workers...");

  for (const w of workers) {
    try {
      await w.close();
      await w.disconnect();
      console.log(`🔌 Worker closed [${w.name}]`);
    } catch (err) {
      console.error(`⚠️ Error closing worker [${w.name}]`, err);
    }
  }

  process.exit(0);
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
