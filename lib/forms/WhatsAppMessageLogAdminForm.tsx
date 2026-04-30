// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WhatsAppMessageLogSchema } from "@/lib/validation/schemas/WhatsAppMessageLog.schema";
import type { WhatsAppMessageLogInput } from "@/lib/validation/types/WhatsAppMessageLog.types";

export function WhatsAppMessageLogAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WhatsAppMessageLogInput>({
    resolver: zodResolver(WhatsAppMessageLogSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>to</label>
        <input type="text" {...register("to")} />
      </div>

      <div>
        <label>operation</label>
        <input type="text" {...register("operation")} />
      </div>

      <div>
        <label>status</label>
        <input type="text" {...register("status")} />
      </div>

      <div>
        <label>error</label>
        <input type="text" {...register("error")} />
      </div>

      <div>
        <label>raw</label>
        <input type="text" {...register("raw")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save WhatsAppMessageLog</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
