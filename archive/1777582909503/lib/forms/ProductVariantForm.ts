// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductVariantSchema } from "@/lib/validation/schemas/ProductVariant.schema";
import type { ProductVariantInput } from "@/lib/validation/types/ProductVariant.types";

export function useProductVariantForm(
  defaultValues?: Partial<ProductVariantInput>,
) {
  return useForm<ProductVariantInput>({
    resolver: zodResolver(ProductVariantSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
