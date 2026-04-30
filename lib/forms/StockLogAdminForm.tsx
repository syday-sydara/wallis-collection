// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { StockLogSchema } from "@/lib/validation/schemas/StockLog.schema";
import type { StockLogInput } from "@/lib/validation/types/StockLog.types";

export function StockLogAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StockLogInput>({
    resolver: zodResolver(StockLogSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>variantId</label>
        <input type="text" {...register("variantId")} />
      </div>

      <div>
        <label>change</label>
        <input type="number" {...register("change")} />
      </div>

      <div>
        <label>reason</label>
        <input type="text" {...register("reason")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save StockLog</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
