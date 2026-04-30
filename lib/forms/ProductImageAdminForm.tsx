// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductImageSchema } from "@/lib/validation/schemas/ProductImage.schema";
import type { ProductImageInput } from "@/lib/validation/types/ProductImage.types";

export function ProductImageAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductImageInput>({
    resolver: zodResolver(ProductImageSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>url</label>
        <input type="text" {...register("url")} />
      </div>

      <div>
        <label>publicId</label>
        <input type="text" {...register("publicId")} />
      </div>

      <div>
        <label>width</label>
        <input type="number" {...register("width")} />
      </div>

      <div>
        <label>height</label>
        <input type="number" {...register("height")} />
      </div>

      <div>
        <label>format</label>
        <input type="text" {...register("format")} />
      </div>

      <div>
        <label>bytes</label>
        <input type="number" {...register("bytes")} />
      </div>

      <div>
        <label>alt</label>
        <input type="text" {...register("alt")} />
      </div>

      <div>
        <label>sortOrder</label>
        <input type="number" {...register("sortOrder")} />
      </div>

      <div>
        <label>isPrimary</label>
        <input type="checkbox" {...register("isPrimary")} />
      </div>

      <div>
        <label>productId</label>
        <input type="text" {...register("productId")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <button type="submit">Save ProductImage</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
