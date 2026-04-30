// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema } from "@/lib/validation/schemas/Product.schema";
import type { ProductInput } from "@/lib/validation/types/Product.types";

export function useProductForm(defaultValues?: Partial<ProductInput>) {
  return useForm<ProductInput>({
    resolver: zodResolver(ProductSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
