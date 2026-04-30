// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeviceSchema } from "@/lib/validation/schemas/Device.schema";
import type { DeviceInput } from "@/lib/validation/types/Device.types";

export function useDeviceForm(defaultValues?: Partial<DeviceInput>) {
  return useForm<DeviceInput>({
    resolver: zodResolver(DeviceSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
