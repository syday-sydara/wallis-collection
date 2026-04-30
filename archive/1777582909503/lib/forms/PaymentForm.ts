// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PaymentSchema } from "@/lib/validation/schemas/Payment.schema";
import type { PaymentInput } from "@/lib/validation/types/Payment.types";

export function usePaymentForm(defaultValues?: Partial<PaymentInput>) {
  return useForm<PaymentInput>({
    resolver: zodResolver(PaymentSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
