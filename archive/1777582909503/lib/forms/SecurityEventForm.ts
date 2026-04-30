// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SecurityEventSchema } from "@/lib/validation/schemas/SecurityEvent.schema";
import type { SecurityEventInput } from "@/lib/validation/types/SecurityEvent.types";

export function useSecurityEventForm(
  defaultValues?: Partial<SecurityEventInput>,
) {
  return useForm<SecurityEventInput>({
    resolver: zodResolver(SecurityEventSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
