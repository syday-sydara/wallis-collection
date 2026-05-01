import { PrismaClient, OrderStatus, PaymentStatus, ShipmentStatus, ReservationStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("📊 OPERATIONAL DASHBOARD");
  console.log("========================\n");

  // -----------------------------
  // ORDER PIPELINE
  // -----------------------------
  const ordersByStatus = await prisma.order.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  console.log("🧾 ORDER PIPELINE");
  ordersByStatus.forEach((s) => {
    console.log(`  ${s.status}: ${s._count.status}`);
  });
  console.log("");

  // -----------------------------
  // PAYMENT PIPELINE
  // -----------------------------
  const paymentsByStatus = await prisma.payment.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  console.log("💰 PAYMENT PIPELINE");
  paymentsByStatus.forEach((p) => {
    console.log(`  ${p.status}: ${p._count.status}`);
  });
  console.log("");

  // -----------------------------
  // SHIPMENT PIPELINE
  // -----------------------------
  const shipmentsByStatus = await prisma.shipment.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  console.log("🚚 SHIPMENT PIPELINE");
  shipmentsByStatus.forEach((s) => {
    console.log(`  ${s.status}: ${s._count.status}`);
  });
  console.log("");

  // -----------------------------
  // INVENTORY HEALTH
  // -----------------------------
  const lowStock = await prisma.productVariant.findMany({
    where: { stockQty: { lt: 5 } },
    select: { id: true, name: true, stockQty: true },
  });

  const activeReservations = await prisma.stockReservation.count({
    where: { status: ReservationStatus.ACTIVE },
  });

  const expiredReservations = await prisma.stockReservation.count({
    where: {
      status: ReservationStatus.ACTIVE,
      expiresAt: { lt: new Date() },
    },
  });

  console.log("📦 INVENTORY HEALTH");
  console.log(`  Active reservations: ${activeReservations}`);
  console.log(`  Expired reservations: ${expiredReservations}`);
  console.log(`  Low-stock variants (<5 units): ${lowStock.length}`);
  console.log("");

  // -----------------------------
  // WHATSAPP ACTIVITY
  // -----------------------------
  const whatsappOrders = await prisma.order.count({
    where: { channel: "WHATSAPP" },
  });

  const whatsappActive = await prisma.order.count({
    where: {
      channel: "WHATSAPP",
      lastMessageAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) }, // last 24h
    },
  });

  console.log("💬 WHATSAPP ACTIVITY");
  console.log(`  Total WhatsApp orders: ${whatsappOrders}`);
  console.log(`  Active in last 24h: ${whatsappActive}`);
  console.log("");

  // -----------------------------
  // CUSTOMER ACTIVITY
  // -----------------------------
  const customers = await prisma.customer.count();
  const returningCustomers = await prisma.customer.count({
    where: {
      orders: { some: {} },
    },
  });

  console.log("👥 CUSTOMER ACTIVITY");
  console.log(`  Total customers: ${customers}`);
  console.log(`  Returning customers: ${returningCustomers}`);
  console.log("");

  // -----------------------------
  // PROVIDER HEALTH
  // -----------------------------
  const paymentProviders = await prisma.paymentProvider.count({
    where: { isActive: true },
  });

  const shipmentProviders = await prisma.shipmentProvider.count({
    where: { isActive: true },
  });

  console.log("🏦 PROVIDER HEALTH");
  console.log(`  Active payment providers: ${paymentProviders}`);
  console.log(`  Active shipment providers: ${shipmentProviders}`);
  console.log("");

  // -----------------------------
  // SYSTEM ACTIVITY
  // -----------------------------
  const auditLogs24h = await prisma.auditLog.count({
    where: {
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 60 * 24) },
    },
  });

  console.log("🛠 SYSTEM ACTIVITY");
  console.log(`  Audit logs (last 24h): ${auditLogs24h}`);
  console.log("");
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
