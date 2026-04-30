// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CartItemSchema } from "@/lib/validation/schemas/CartItem.schema";
import type { CartItemInput } from "@/lib/validation/types/CartItem.types";

export function CartItemAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CartItemInput>({
    resolver: zodResolver(CartItemSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>cartId</label>
        <input type="text" {...register("cartId")} />
      </div>

      <div>
        <label>productId</label>
        <input type="text" {...register("productId")} />
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
        <label>unitPrice</label>
        <input type="number" {...register("unitPrice")} />
      </div>

      <div>
        <label>quantity</label>
        <input type="number" {...register("quantity")} />
      </div>

      <div>
        <label>attributes</label>
        <input type="text" {...register("attributes")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <button type="submit">Save CartItem</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
