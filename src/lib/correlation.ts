import { randomUUID } from "crypto";

export function correlationId(prefix?: string): string {
  const id = randomUUID();
  return prefix ? `${prefix}_${id}` : id;
}
