import { vi } from "vitest";

export const prisma = {
  order: {
    findFirst: vi.fn(),
    create: vi.fn(),
    updateMany: vi.fn(),
    findUnique: vi.fn()
  },
  product: {
    findMany: vi.fn(),
    update: vi.fn()
  },
  $transaction: vi.fn((fn) => fn(prisma))
};
