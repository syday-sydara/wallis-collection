// lib/prisma.ts
import { PrismaClient } from "@prisma/client";
import { phoneNormalizationMiddleware } from "./middleware/phone-normalization";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["query", "error", "warn"],
  });

// ------------------------------------------------------
// Register middleware
// ------------------------------------------------------
prisma.$use(phoneNormalizationMiddleware());

// ------------------------------------------------------
// Hot reload safety (dev only)
// ------------------------------------------------------
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// ------------------------------------------------------
// Optional: Prisma connection health check
// ------------------------------------------------------
export async function prismaHealthCheck() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latency: Date.now() - start };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

// ------------------------------------------------------
// Optional: graceful shutdown
// ------------------------------------------------------
export async function shutdownPrisma() {
  await prisma.$disconnect();
}

// ------------------------------------------------------
// Optional: connection event logging
// ------------------------------------------------------
prisma.$on("error", (e) => {
  console.error("[PRISMA ERROR]", e);
});

prisma.$on("warn", (e) => {
  console.warn("[PRISMA WARN]", e);
});
