// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WhatsAppMessageLogSchema } from "@/lib/validation/schemas/WhatsAppMessageLog.schema";
import type { WhatsAppMessageLogInput } from "@/lib/validation/types/WhatsAppMessageLog.types";

export function useWhatsAppMessageLogForm(
  defaultValues?: Partial<WhatsAppMessageLogInput>,
) {
  return useForm<WhatsAppMessageLogInput>({
    resolver: zodResolver(WhatsAppMessageLogSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
