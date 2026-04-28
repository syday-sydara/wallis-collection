// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: ["warn", "error"],
    errorFormat: process.env.NODE_ENV === "production" ? "minimal" : "pretty",
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
}

export const prisma = global.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Health check
export async function prismaHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

// Optional: graceful shutdown
export async function prismaShutdown() {
  await prisma.$disconnect();
}

// Optional: warmup
export async function prismaWarmup() {
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (err) {
    console.error("Prisma warmup failed:", err);
  }
}

// Optional: safe transaction wrapper
export async function safeTransaction<T>(
  fn: (tx: PrismaClient) => Promise<T>
): Promise<T> {
  try {
    return await prisma.$transaction(async (tx) => fn(tx));
  } catch (err) {
    console.error("Transaction failed:", err);
    throw err;
  }
}
