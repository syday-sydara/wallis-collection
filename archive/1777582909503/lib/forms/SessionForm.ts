// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionSchema } from "@/lib/validation/schemas/Session.schema";
import type { SessionInput } from "@/lib/validation/types/Session.types";

export function useSessionForm(defaultValues?: Partial<SessionInput>) {
  return useForm<SessionInput>({
    resolver: zodResolver(SessionSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
