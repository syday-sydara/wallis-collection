// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertEventSchema } from "@/lib/validation/schemas/AlertEvent.schema";
import type { AlertEventInput } from "@/lib/validation/types/AlertEvent.types";

export function AlertEventAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AlertEventInput>({
    resolver: zodResolver(AlertEventSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>event</label>
        <input type="text" {...register("event")} />
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

      <button type="submit">Save AlertEvent</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
