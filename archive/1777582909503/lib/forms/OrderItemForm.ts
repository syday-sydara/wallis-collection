// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderItemSchema } from "@/lib/validation/schemas/OrderItem.schema";
import type { OrderItemInput } from "@/lib/validation/types/OrderItem.types";

export function useOrderItemForm(defaultValues?: Partial<OrderItemInput>) {
  return useForm<OrderItemInput>({
    resolver: zodResolver(OrderItemSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
