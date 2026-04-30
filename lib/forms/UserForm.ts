// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserSchema } from "@/lib/validation/schemas/User.schema";
import type { UserInput } from "@/lib/validation/types/User.types";

export function useUserForm(defaultValues?: Partial<UserInput>) {
  return useForm<UserInput>({
    resolver: zodResolver(UserSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
