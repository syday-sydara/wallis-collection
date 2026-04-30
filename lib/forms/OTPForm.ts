// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OTPSchema } from "@/lib/validation/schemas/OTP.schema";
import type { OTPInput } from "@/lib/validation/types/OTP.types";

export function useOTPForm(defaultValues?: Partial<OTPInput>) {
  return useForm<OTPInput>({
    resolver: zodResolver(OTPSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
