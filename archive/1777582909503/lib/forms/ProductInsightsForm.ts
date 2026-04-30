// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductInsightsSchema } from "@/lib/validation/schemas/ProductInsights.schema";
import type { ProductInsightsInput } from "@/lib/validation/types/ProductInsights.types";

export function useProductInsightsForm(
  defaultValues?: Partial<ProductInsightsInput>,
) {
  return useForm<ProductInsightsInput>({
    resolver: zodResolver(ProductInsightsSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
