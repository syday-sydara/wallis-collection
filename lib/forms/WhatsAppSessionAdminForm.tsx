// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WhatsAppSessionSchema } from "@/lib/validation/schemas/WhatsAppSession.schema";
import type { WhatsAppSessionInput } from "@/lib/validation/types/WhatsAppSession.types";

export function WhatsAppSessionAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<WhatsAppSessionInput>({
    resolver: zodResolver(WhatsAppSessionSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>whatsapp</label>
        <input type="text" {...register("whatsapp")} />
      </div>

      <div>
        <label>state</label>
        <input type="text" {...register("state")} />
      </div>

      <div>
        <label>data</label>
        <input type="text" {...register("data")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save WhatsAppSession</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
