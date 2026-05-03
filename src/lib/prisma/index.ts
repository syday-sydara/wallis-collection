// lib/prisma/index.ts
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

prisma.$use(phoneNormalizationMiddleware());

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function prismaHealthCheck() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    return { ok: true, latency: Date.now() - start };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}

export async function shutdownPrisma() {
  await prisma.$disconnect();
}
