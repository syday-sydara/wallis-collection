// === AUTO-GENERATED START ===
import { StockLogSchema } from "../schemas/StockLog.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validateStockLog(input) {
  return safeParseOrThrow(StockLogSchema, input);
}
// === AUTO-GENERATED END ===
