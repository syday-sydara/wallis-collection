// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddressSchema } from "@/lib/validation/schemas/Address.schema";
import type { AddressInput } from "@/lib/validation/types/Address.types";

export function useAddressForm(defaultValues?: Partial<AddressInput>) {
  return useForm<AddressInput>({
    resolver: zodResolver(AddressSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
