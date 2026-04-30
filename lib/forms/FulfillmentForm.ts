// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FulfillmentSchema } from "@/lib/validation/schemas/Fulfillment.schema";
import type { FulfillmentInput } from "@/lib/validation/types/Fulfillment.types";

export function useFulfillmentForm(defaultValues?: Partial<FulfillmentInput>) {
  return useForm<FulfillmentInput>({
    resolver: zodResolver(FulfillmentSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
