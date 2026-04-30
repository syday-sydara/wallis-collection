// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionEventSchema } from "@/lib/validation/schemas/SessionEvent.schema";
import type { SessionEventInput } from "@/lib/validation/types/SessionEvent.types";

export function useSessionEventForm(
  defaultValues?: Partial<SessionEventInput>,
) {
  return useForm<SessionEventInput>({
    resolver: zodResolver(SessionEventSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
