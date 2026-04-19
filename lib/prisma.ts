// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

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

// Reuse client in development to avoid exhausting DB connections
export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Optional: health check
export async function prismaHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
