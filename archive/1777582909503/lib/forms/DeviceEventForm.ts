// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeviceEventSchema } from "@/lib/validation/schemas/DeviceEvent.schema";
import type { DeviceEventInput } from "@/lib/validation/types/DeviceEvent.types";

export function useDeviceEventForm(defaultValues?: Partial<DeviceEventInput>) {
  return useForm<DeviceEventInput>({
    resolver: zodResolver(DeviceEventSchema),
    defaultValues: defaultValues as any,
  });
}
// === AUTO-GENERATED END ===
