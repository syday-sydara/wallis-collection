// === AUTO-GENERATED START ===
import { z } from "zod";

export const CartSchema = z.object({
  id: z.string(),
  userId: z.string(),
  user: UserSchema,
  sessionId: z.string().optional(),
  items: z.array(CartItemSchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});
// === AUTO-GENERATED END ===
