import {
  PrismaClient,
  ReservationStatus,
  PaymentStatus,
} from "@prisma/client";
import { createClient } from "redis";
import { Queue } from "bullmq";
import chalk from "chalk";
import Table from "cli-table3";

const prisma = new PrismaClient();
const auditQueue = new Queue("audit", {
  connection: { host: "localhost", port: 6379 },
});

function measure<T>(fn: () => Promise<T>): Promise<T & { ms: number }> {
  const start = Date.now();
  return fn().then(res => Object.assign(res as any, { ms: Date.now() - start }));
}

async function checkDatabase() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function checkRedis() {
  const redis = createClient({ url: process.env.REDIS_URL });
  try {
    await redis.connect();
    await redis.ping();
    await redis.disconnect();
    return { ok: true };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function checkQueues() {
  try {
    const [waiting, failed, active, completed] = await Promise.all([
      auditQueue.getWaitingCount(),
      auditQueue.getFailedCount(),
      auditQueue.getActiveCount(),
      auditQueue.getCompletedCount(),
    ]);

    return {
      ok: true,
      waiting,
      failed,
      active,
      completed,
    };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

async function checkReservations() {
  const [active, expired, consumed] = await Promise.all([
    prisma.stockReservation.count({
      where: { status: ReservationStatus.ACTIVE },
    }),
    prisma.stockReservation.count({
      where: { status: ReservationStatus.EXPIRED },
    }),
    prisma.stockReservation.count({
      where: { status: ReservationStatus.CONSUMED },
    }),
  ]);

  return { ok: true, active, expired, consumed };
}

async function checkReservationExpiryDrift() {
  const drifted = await prisma.stockReservation.count({
    where: {
      status: ReservationStatus.ACTIVE,
      expiresAt: { lt: new Date() },
    },
  });

  return {
    ok: drifted === 0,
    drifted,
  };
}

async function checkOrders() {
  const [pending, paid] = await Promise.all([
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: "PAID" } }),
  ]);

  return { ok: true, pending, paid };
}

async function checkPayments() {
  const [initiated, success, failed] = await Promise.all([
    prisma.payment.count({
      where: { status: PaymentStatus.INITIATED },
    }),
    prisma.payment.count({
      where: { status: PaymentStatus.SUCCESS },
    }),
    prisma.payment.count({
      where: { status: PaymentStatus.FAILED },
    }),
  ]);

  return { ok: true, initiated, success, failed };
}

async function checkWhatsApp() {
  const [sessions, messages] = await Promise.all([
    prisma.whatsAppSession.count(),
    prisma.whatsAppMessage.count(),
  ]);

  return { ok: true, sessions, messages };
}

async function checkAuditLogs() {
  const count = await prisma.auditLog.count();
  return { ok: true, count };
}

async function checkStockConsistency() {
  const inconsistencies = await prisma.$queryRaw<
    { variantId: string; stockQty: number; reserved: number }[]
  >`
    SELECT
      pv.id as "variantId",
      pv."stockQty",
      COALESCE(SUM(sr.quantity), 0) as reserved
    FROM "ProductVariant" pv
    LEFT JOIN "StockReservation" sr
      ON sr."variantId" = pv.id
      AND sr.status = 'ACTIVE'
    GROUP BY pv.id
    HAVING COALESCE(SUM(sr.quantity), 0) > pv."stockQty"
  `;

  return {
    ok: inconsistencies.length === 0,
    inconsistencies,
  };
}

function statusLabel(ok: boolean) {
  return ok ? chalk.green("OK") : chalk.red("FAIL");
}

function msLabel(ms: number) {
  if (ms < 50) return chalk.green(`${ms}ms`);
  if (ms < 150) return chalk.yellow(`${ms}ms`);
  return chalk.red(`${ms}ms`);
}

async function main() {
  console.log(
    chalk.bold.blue("\n🩺 WALLIS COLLECTION — SYSTEM HEALTH DASHBOARD\n"),
  );

  const [
    db,
    redis,
    queues,
    reservations,
    orders,
    payments,
    whatsapp,
    audit,
    stock,
    reservationDrift,
  ] = await Promise.all([
    measure(checkDatabase),
    measure(checkRedis),
    measure(checkQueues),
    measure(checkReservations),
    measure(checkOrders),
    measure(checkPayments),
    measure(checkWhatsApp),
    measure(checkAuditLogs),
    measure(checkStockConsistency),
    measure(checkReservationExpiryDrift),
  ]);

  // SYSTEM SUMMARY TABLE
  const systemTable = new Table({
    head: [chalk.yellow("Component"), chalk.yellow("Status"), chalk.yellow("Latency")],
  });

  systemTable.push(
    ["Database", statusLabel(db.ok), msLabel(db.ms)],
    ["Redis", statusLabel(redis.ok), msLabel(redis.ms)],
    ["Queues", statusLabel(queues.ok), msLabel(queues.ms)],
    ["Reservations", statusLabel(reservations.ok), msLabel(reservations.ms)],
    ["Reservation Drift", statusLabel(reservationDrift.ok), msLabel(reservationDrift.ms)],
    ["Orders", statusLabel(orders.ok), msLabel(orders.ms)],
    ["Payments", statusLabel(payments.ok), msLabel(payments.ms)],
    ["WhatsApp", statusLabel(whatsapp.ok), msLabel(whatsapp.ms)],
    ["Audit Logs", statusLabel(audit.ok), msLabel(audit.ms)],
    ["Stock Consistency", statusLabel(stock.ok), msLabel(stock.ms)],
  );

  console.log(chalk.bold("🧩 SYSTEM STATUS"));
  console.log(systemTable.toString());

  // QUEUE METRICS
  const queueTable = new Table({
    head: [chalk.cyan("Metric"), chalk.cyan("Value")],
  });

  queueTable.push(
    ["Waiting Jobs", queues.waiting],
    ["Active Jobs", queues.active],
    ["Failed Jobs", queues.failed],
    ["Completed Jobs", queues.completed],
  );

  console.log(chalk.bold("\n📬 QUEUE HEALTH"));
  console.log(queueTable.toString());

  // RESERVATION HEALTH
  const reservationTable = new Table({
    head: [chalk.green("Reservation Status"), chalk.green("Count")],
  });

  reservationTable.push(
    ["Active", reservations.active],
    ["Consumed", reservations.consumed],
    ["Expired", reservations.expired],
  );

  console.log(chalk.bold("\n📦 RESERVATION HEALTH"));
  console.log(reservationTable.toString());

  if (!reservationDrift.ok) {
    console.log(
      chalk.red(
        `\n⚠ ${reservationDrift.drifted} reservations are EXPIRED but still ACTIVE`,
      ),
    );
  }

  // STOCK CONSISTENCY
  if (!stock.ok) {
    console.log(chalk.red("\n⚠ STOCK INCONSISTENCIES DETECTED"));
    const stockTable = new Table({
      head: ["Variant ID", "Stock Qty", "Reserved"],
    });

    stock.inconsistencies.forEach(row => {
      stockTable.push([row.variantId, row.stockQty, row.reserved]);
    });

    console.log(stockTable.toString());
  } else {
    console.log(chalk.green("\n✔ Stock levels consistent"));
  }

  console.log(chalk.bold.blue("\n✔ Health Check Complete\n"));
}

main()
  .catch(err => {
    console.error(chalk.red("❌ HEALTH CHECK ERROR"), err);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });
