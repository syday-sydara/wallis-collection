// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuditLogSchema } from "@/lib/validation/schemas/AuditLog.schema";
import type { AuditLogInput } from "@/lib/validation/types/AuditLog.types";

export function useAuditLogForm(defaultValues?: Partial<AuditLogInput>) {
  return useForm<AuditLogInput>({
    resolver: zodResolver(AuditLogSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
