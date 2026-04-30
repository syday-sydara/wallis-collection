// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CartSchema } from "@/lib/validation/schemas/Cart.schema";
import type { CartInput } from "@/lib/validation/types/Cart.types";

export function useCartForm(defaultValues?: Partial<CartInput>) {
  return useForm<CartInput>({
    resolver: zodResolver(CartSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
