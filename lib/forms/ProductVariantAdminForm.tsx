// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductVariantSchema } from "@/lib/validation/schemas/ProductVariant.schema";
import type { ProductVariantInput } from "@/lib/validation/types/ProductVariant.types";

export function ProductVariantAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductVariantInput>({
    resolver: zodResolver(ProductVariantSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>productId</label>
        <input type="text" {...register("productId")} />
      </div>

      <div>
        <label>name</label>
        <input type="text" {...register("name")} />
      </div>

      <div>
        <label>sku</label>
        <input type="text" {...register("sku")} />
      </div>

      <div>
        <label>price</label>
        <input type="number" {...register("price")} />
      </div>

      <div>
        <label>stock</label>
        <input type="number" {...register("stock")} />
      </div>

      <div>
        <label>reservedStock</label>
        <input type="number" {...register("reservedStock")} />
      </div>

      <div>
        <label>compareAtPrice</label>
        <input type="number" {...register("compareAtPrice")} />
      </div>

      <div>
        <label>costPrice</label>
        <input type="number" {...register("costPrice")} />
      </div>

      <div>
        <label>attributes</label>
        <input type="text" {...register("attributes")} />
      </div>

      <button type="submit">Save ProductVariant</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
