// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Optional: Prisma connection health check
 * Used by workers, ops dashboards, and readiness probes
 */
export async function prismaHealthCheck() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latency: Date.now() - start };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

/**
 * Optional: graceful shutdown
 * Prevents open handles in workers and dev environments
 */
export async function shutdownPrisma() {
  await prisma.$disconnect();
}

/**
 * Optional: connection event logging
 * Mirrors your Redis logging strategy
 */
prisma.$on("error", (e) => {
  console.error("[PRISMA ERROR]", e);
});

prisma.$on("warn", (e) => {
  console.warn("[PRISMA WARN]", e);
});
