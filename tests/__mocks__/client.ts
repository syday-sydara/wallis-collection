import { vi } from "vitest";

export class PrismaClient {
  product = {
    findMany: vi.fn(),
    update: vi.fn()
  };

  order = {
    findFirst: vi.fn(),
    create: vi.fn()
  };

  $transaction = vi.fn(async (fn) => fn(this));
}