
// === AUTO-GENERATED START ===
import { PaymentSchema } from "../schemas/Payment.schema";
import { safeParseOrThrow } from "../zod-helpers";

export function validatePayment(input) {
  return safeParseOrThrow(PaymentSchema, input);
}
// === AUTO-GENERATED END ===
