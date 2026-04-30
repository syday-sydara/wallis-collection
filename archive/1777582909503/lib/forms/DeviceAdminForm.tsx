// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeviceSchema } from "@/lib/validation/schemas/Device.schema";
import type { DeviceInput } from "@/lib/validation/types/Device.types";

export function DeviceAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeviceInput>({
    resolver: zodResolver(DeviceSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>userId</label>
        <input type="text" {...register("userId")} />
      </div>

      <div>
        <label>deviceFingerprint</label>
        <input type="text" {...register("deviceFingerprint")} />
      </div>

      <div>
        <label>userAgent</label>
        <input type="text" {...register("userAgent")} />
      </div>

      <div>
        <label>lastIpAddress</label>
        <input type="text" {...register("lastIpAddress")} />
      </div>

      <div>
        <label>trusted</label>
        <input type="checkbox" {...register("trusted")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>lastSeen</label>
        <input type="datetime-local" {...register("lastSeen")} />
      </div>

      <button type="submit">Save Device</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
