import {
  PrismaClient,
  ReservationStatus,
  OrderStatus,
  PaymentStatus,
} from "@prisma/client";
import chalk from "chalk";
import Table from "cli-table3";

const prisma = new PrismaClient();

async function main() {
  console.log(chalk.bold.blue("\n📊 WALLIS COLLECTION — DATABASE DASHBOARD\n"));

  // ------------------------------------------------------
  // PARALLEL QUERIES
  // ------------------------------------------------------
  const [
    users,
    products,
    variants,
    reservations,
    activeReservations,
    consumedReservations,
    expiredReservations,
    orders,
    pendingOrders,
    paidOrders,
    payments,
    successfulPayments,
    auditLogs,
    whatsappSessions,
    whatsappMessages,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.product.count(),
    prisma.productVariant.count(),

    prisma.stockReservation.count(),
    prisma.stockReservation.count({ where: { status: ReservationStatus.ACTIVE } }),
    prisma.stockReservation.count({ where: { status: ReservationStatus.CONSUMED } }),
    prisma.stockReservation.count({ where: { status: ReservationStatus.EXPIRED } }),

    prisma.order.count(),
    prisma.order.count({ where: { status: OrderStatus.PENDING } }),
    prisma.order.count({ where: { status: OrderStatus.PAID } }),

    prisma.payment.count(),
    prisma.payment.count({ where: { status: PaymentStatus.SUCCESS } }),

    prisma.auditLog.count(),

    prisma.whatsAppSession.count(),
    prisma.whatsAppMessage.count(),
  ]);

  // ------------------------------------------------------
  // REVENUE + STOCK
  // ------------------------------------------------------
  const revenueAgg = await prisma.payment.aggregate({
    _sum: { amount: true },
    where: { status: PaymentStatus.SUCCESS },
  });

  const totalRevenue = revenueAgg._sum.amount ?? 0;

  const stockAgg = await prisma.productVariant.aggregate({
    _sum: { stockQty: true },
  });

  const totalStock = stockAgg._sum.stockQty ?? 0;

  const aov = paidOrders > 0 ? totalRevenue / paidOrders : 0;

  // ------------------------------------------------------
  // RESERVATIONS EXPIRING SOON
  // ------------------------------------------------------
  const expiringSoon = await prisma.stockReservation.count({
    where: {
      status: ReservationStatus.ACTIVE,
      expiresAt: { lt: new Date(Date.now() + 5 * 60 * 1000) }, // next 5 minutes
    },
  });

  // ------------------------------------------------------
  // TABLES
  // ------------------------------------------------------

  // USERS + PRODUCTS
  const coreTable = new Table({
    head: [chalk.yellow("Metric"), chalk.yellow("Count")],
  });

  coreTable.push(
    ["Users", users],
    ["Products", products],
    ["Variants", variants],
    ["Total Stock Units", totalStock]
  );

  // RESERVATIONS
  const reservationTable = new Table({
    head: [chalk.cyan("Reservation Status"), chalk.cyan("Count")],
  });

  reservationTable.push(
    ["Active", activeReservations],
    ["Consumed", consumedReservations],
    ["Expired", expiredReservations],
    ["Expiring Soon (5 min)", expiringSoon],
    ["Total", reservations]
  );

  // ORDERS
  const orderTable = new Table({
    head: [chalk.green("Order Status"), chalk.green("Count")],
  });

  orderTable.push(
    ["Pending", pendingOrders],
    ["Paid", paidOrders],
    ["Total Orders", orders],
    ["Average Order Value", `₦${(aov / 100).toLocaleString()}`]
  );

  // PAYMENTS
  const paymentTable = new Table({
    head: [chalk.magenta("Payment Status"), chalk.magenta("Count")],
  });

  paymentTable.push(
    ["Successful", successfulPayments],
    ["Total Payments", payments],
    ["Total Revenue", `₦${(totalRevenue / 100).toLocaleString()}`]
  );

  // WHATSAPP
  const whatsappTable = new Table({
    head: [chalk.blue("WhatsApp Metric"), chalk.blue("Count")],
  });

  whatsappTable.push(
    ["Sessions", whatsappSessions],
    ["Messages", whatsappMessages]
  );

  // AUDIT LOGS
  const auditTable = new Table({
    head: [chalk.white("Audit Logs"), chalk.white("Count")],
  });

  auditTable.push(["Total Audit Entries", auditLogs]);

  // ------------------------------------------------------
  // OUTPUT
  // ------------------------------------------------------
  console.log(chalk.bold("📦 CORE DATA"));
  console.log(coreTable.toString());

  console.log(chalk.bold("\n🧾 RESERVATIONS"));
  console.log(reservationTable.toString());

  console.log(chalk.bold("\n🛒 ORDERS"));
  console.log(orderTable.toString());

  console.log(chalk.bold("\n💳 PAYMENTS"));
  console.log(paymentTable.toString());

  console.log(chalk.bold("\n💬 WHATSAPP ACTIVITY"));
  console.log(whatsappTable.toString());

  console.log(chalk.bold("\n📝 AUDIT LOGS"));
  console.log(auditTable.toString());

  console.log(chalk.bold.blue("\n✔ Dashboard Loaded Successfully\n"));
}

main()
  .catch(err => {
    console.error(chalk.red("❌ DASHBOARD ERROR"), err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
