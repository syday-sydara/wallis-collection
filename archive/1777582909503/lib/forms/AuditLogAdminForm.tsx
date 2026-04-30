// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuditLogSchema } from "@/lib/validation/schemas/AuditLog.schema";
import type { AuditLogInput } from "@/lib/validation/types/AuditLog.types";

export function AuditLogAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AuditLogInput>({
    resolver: zodResolver(AuditLogSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>action</label>
        <input type="text" {...register("action")} />
      </div>

      <div>
        <label>actorType</label>
        <input type="text" {...register("actorType")} />
      </div>

      <div>
        <label>actorId</label>
        <input type="text" {...register("actorId")} />
      </div>

      <div>
        <label>resource</label>
        <input type="text" {...register("resource")} />
      </div>

      <div>
        <label>resourceId</label>
        <input type="text" {...register("resourceId")} />
      </div>

      <div>
        <label>metadata</label>
        <input type="text" {...register("metadata")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>userId</label>
        <input type="text" {...register("userId")} />
      </div>

      <button type="submit">Save AuditLog</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
