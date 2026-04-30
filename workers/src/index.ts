import "./workers/order.worker";
import "./workers/payment.worker";
import "./workers/inventory.worker";
import "./workers/notification.worker";

process.on("SIGTERM", () => {
  console.log("🛑 Shutting down workers");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 Shutting down workers");
  process.exit(0);
});

console.log("🚀 BullMQ Worker System Running");
