// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WhatsAppSessionSchema } from "@/lib/validation/schemas/WhatsAppSession.schema";
import type { WhatsAppSessionInput } from "@/lib/validation/types/WhatsAppSession.types";

export function useWhatsAppSessionForm(
  defaultValues?: Partial<WhatsAppSessionInput>,
) {
  return useForm<WhatsAppSessionInput>({
    resolver: zodResolver(WhatsAppSessionSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
