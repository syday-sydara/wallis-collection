// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SessionSchema } from "@/lib/validation/schemas/Session.schema";
import type { SessionInput } from "@/lib/validation/types/Session.types";

export function SessionAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SessionInput>({
    resolver: zodResolver(SessionSchema),
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
        <label>ipAddress</label>
        <input type="text" {...register("ipAddress")} />
      </div>

      <div>
        <label>userAgent</label>
        <input type="text" {...register("userAgent")} />
      </div>

      <div>
        <label>deviceId</label>
        <input type="text" {...register("deviceId")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>lastActive</label>
        <input type="datetime-local" {...register("lastActive")} />
      </div>

      <div>
        <label>revokedAt</label>
        <input type="datetime-local" {...register("revokedAt")} />
      </div>

      <div>
        <label>riskScore</label>
        <input type="number" {...register("riskScore")} />
      </div>

      <button type="submit">Save Session</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
