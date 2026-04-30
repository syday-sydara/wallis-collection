// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FraudEventSchema } from "@/lib/validation/schemas/FraudEvent.schema";
import type { FraudEventInput } from "@/lib/validation/types/FraudEvent.types";

export function FraudEventAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FraudEventInput>({
    resolver: zodResolver(FraudEventSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>signal</label>
        <input type="text" {...register("signal")} />
      </div>

      <div>
        <label>orderId</label>
        <input type="text" {...register("orderId")} />
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

      <button type="submit">Save FraudEvent</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
