// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { OrderItemSchema } from "@/lib/validation/schemas/OrderItem.schema";
import type { OrderItemInput } from "@/lib/validation/types/OrderItem.types";

export function OrderItemAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OrderItemInput>({
    resolver: zodResolver(OrderItemSchema),
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
        <label>variantId</label>
        <input type="text" {...register("variantId")} />
      </div>

      <div>
        <label>name</label>
        <input type="text" {...register("name")} />
      </div>

      <div>
        <label>image</label>
        <input type="text" {...register("image")} />
      </div>

      <div>
        <label>attributes</label>
        <input type="text" {...register("attributes")} />
      </div>

      <div>
        <label>quantity</label>
        <input type="number" {...register("quantity")} />
      </div>

      <div>
        <label>unitPrice</label>
        <input type="number" {...register("unitPrice")} />
      </div>

      <button type="submit">Save OrderItem</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
