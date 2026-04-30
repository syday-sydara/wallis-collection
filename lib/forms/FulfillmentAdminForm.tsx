// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { FulfillmentSchema } from "@/lib/validation/schemas/Fulfillment.schema";
import type { FulfillmentInput } from "@/lib/validation/types/Fulfillment.types";

export function FulfillmentAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FulfillmentInput>({
    resolver: zodResolver(FulfillmentSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>orderId</label>
        <input type="text" {...register("orderId")} />
      </div>

      <div>
        <label>carrier</label>
        <input type="text" {...register("carrier")} />
      </div>

      <div>
        <label>tracking</label>
        <input type="text" {...register("tracking")} />
      </div>

      <div>
        <label>status</label>
        <select {...register("status")}>
          <option value="PENDING">PENDING</option>
          <option value="IN_TRANSIT">IN_TRANSIT</option>
          <option value="OUT_FOR_DELIVERY">OUT_FOR_DELIVERY</option>
          <option value="DELIVERED">DELIVERED</option>
          <option value="FAILED">FAILED</option>
        </select>
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <button type="submit">Save Fulfillment</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
