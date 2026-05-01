import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  const [
    users,
    products,
    variants,
    images,
    orders,
    orderItems,
    payments,
    shipments,
    reservations,
    auditLogs,
    statusHistory
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.productVariant.count(),
    prisma.productImage.count(),
    prisma.order.count(),
    prisma.orderItem.count(),
    prisma.payment.count(),
    prisma.shipment.count(),
    prisma.stockReservation.count(),
    prisma.auditLog.count(),
    prisma.orderStatusHistory.count(),
  ]);

  console.log("📊 DATABASE SUMMARY");
  console.log("------------------------");
  console.log("Users:", users);
  console.log("Products:", products);
  console.log("Variants:", variants);
  console.log("Product Images:", images);
  console.log("Orders:", orders);
  console.log("Order Items:", orderItems);
  console.log("Payments:", payments);
  console.log("Shipments:", shipments);
  console.log("Stock Reservations:", reservations);
  console.log("Audit Logs:", auditLogs);
  console.log("Order Status History:", statusHistory);
  console.log("------------------------");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
