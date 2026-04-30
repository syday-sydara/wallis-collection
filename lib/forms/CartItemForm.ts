// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CartItemSchema } from "@/lib/validation/schemas/CartItem.schema";
import type { CartItemInput } from "@/lib/validation/types/CartItem.types";

export function useCartItemForm(defaultValues?: Partial<CartItemInput>) {
  return useForm<CartItemInput>({
    resolver: zodResolver(CartItemSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
