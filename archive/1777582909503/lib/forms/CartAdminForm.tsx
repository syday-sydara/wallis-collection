// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CartSchema } from "@/lib/validation/schemas/Cart.schema";
import type { CartInput } from "@/lib/validation/types/Cart.types";

export function CartAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CartInput>({
    resolver: zodResolver(CartSchema),
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
        <label>sessionId</label>
        <input type="text" {...register("sessionId")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <button type="submit">Save Cart</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
