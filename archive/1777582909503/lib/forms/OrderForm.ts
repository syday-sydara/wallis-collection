// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderSchema } from "@/lib/validation/schemas/Order.schema";
import type { OrderInput } from "@/lib/validation/types/Order.types";

export function useOrderForm(defaultValues?: Partial<OrderInput>) {
  return useForm<OrderInput>({
    resolver: zodResolver(OrderSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
