// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { DeviceEventSchema } from "@/lib/validation/schemas/DeviceEvent.schema";
import type { DeviceEventInput } from "@/lib/validation/types/DeviceEvent.types";

export function DeviceEventAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeviceEventInput>({
    resolver: zodResolver(DeviceEventSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>deviceId</label>
        <input type="text" {...register("deviceId")} />
      </div>

      <div>
        <label>userId</label>
        <input type="text" {...register("userId")} />
      </div>

      <div>
        <label>ip</label>
        <input type="text" {...register("ip")} />
      </div>

      <div>
        <label>userAgent</label>
        <input type="text" {...register("userAgent")} />
      </div>

      <div>
        <label>metadata</label>
        <input type="text" {...register("metadata")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save DeviceEvent</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
