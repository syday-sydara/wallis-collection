// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FraudEventSchema } from "@/lib/validation/schemas/FraudEvent.schema";
import type { FraudEventInput } from "@/lib/validation/types/FraudEvent.types";

export function useFraudEventForm(defaultValues?: Partial<FraudEventInput>) {
  return useForm<FraudEventInput>({
    resolver: zodResolver(FraudEventSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
