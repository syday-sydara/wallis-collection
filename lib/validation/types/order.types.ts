import { z } from "zod";
import { orderSchema, orderItemSchema } from "../schemas/order.schema";

export type OrderItemInput = z.infer<typeof orderItemSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
