// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductImageSchema } from "@/lib/validation/schemas/ProductImage.schema";
import type { ProductImageInput } from "@/lib/validation/types/ProductImage.types";

export function useProductImageForm(
  defaultValues?: Partial<ProductImageInput>,
) {
  return useForm<ProductImageInput>({
    resolver: zodResolver(ProductImageSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
