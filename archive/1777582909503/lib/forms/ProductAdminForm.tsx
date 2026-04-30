// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductSchema } from "@/lib/validation/schemas/Product.schema";
import type { ProductInput } from "@/lib/validation/types/Product.types";

export function ProductAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(ProductSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>id</label>
        <input type="text" {...register("id")} />
      </div>

      <div>
        <label>name</label>
        <input type="text" {...register("name")} />
      </div>

      <div>
        <label>slug</label>
        <input type="text" {...register("slug")} />
      </div>

      <div>
        <label>description</label>
        <input type="text" {...register("description")} />
      </div>

      <div>
        <label>basePrice</label>
        <input type="number" {...register("basePrice")} />
      </div>

      <div>
        <label>isArchived</label>
        <input type="checkbox" {...register("isArchived")} />
      </div>

      <div>
        <label>isPublished</label>
        <input type="checkbox" {...register("isPublished")} />
      </div>

      <div>
        <label>publishedAt</label>
        <input type="datetime-local" {...register("publishedAt")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <button type="submit">Save Product</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
