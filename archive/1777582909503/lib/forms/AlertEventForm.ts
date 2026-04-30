// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertEventSchema } from "@/lib/validation/schemas/AlertEvent.schema";
import type { AlertEventInput } from "@/lib/validation/types/AlertEvent.types";

export function useAlertEventForm(defaultValues?: Partial<AlertEventInput>) {
  return useForm<AlertEventInput>({
    resolver: zodResolver(AlertEventSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
