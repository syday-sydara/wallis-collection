// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema } from "@/lib/validation/schemas/Category.schema";
import type { CategoryInput } from "@/lib/validation/types/Category.types";

export function CategoryAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
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
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <button type="submit">Save Category</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
