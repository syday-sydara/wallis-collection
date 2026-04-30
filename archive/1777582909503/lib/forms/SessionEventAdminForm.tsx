// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionEventSchema } from "@/lib/validation/schemas/SessionEvent.schema";
import type { SessionEventInput } from "@/lib/validation/types/SessionEvent.types";

export function SessionEventAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionEventInput>({
    resolver: zodResolver(SessionEventSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>sessionId</label>
        <input type="text" {...register("sessionId")} />
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

      <button type="submit">Save SessionEvent</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
