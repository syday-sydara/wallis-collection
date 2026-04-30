// === AUTO-GENERATED START ===
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ProductInsightsSchema } from "@/lib/validation/schemas/ProductInsights.schema";
import type { ProductInsightsInput } from "@/lib/validation/types/ProductInsights.types";

export function ProductInsightsAdminForm({ defaultValues, onSubmit }) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductInsightsInput>({
    resolver: zodResolver(ProductInsightsSchema),
    defaultValues: defaultValues as any,
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div>
        <label>productId</label>
        <input type="text" {...register("productId")} />
      </div>

      <div>
        <label>viewCount</label>
        <input type="number" {...register("viewCount")} />
      </div>

      <div>
        <label>addToCartCount</label>
        <input type="number" {...register("addToCartCount")} />
      </div>

      <div>
        <label>whatsappClickCount</label>
        <input type="number" {...register("whatsappClickCount")} />
      </div>

      <div>
        <label>checkoutClickCount</label>
        <input type="number" {...register("checkoutClickCount")} />
      </div>

      <div>
        <label>purchaseCount</label>
        <input type="number" {...register("purchaseCount")} />
      </div>

      <div>
        <label>addToCartRate</label>
        <input type="number" {...register("addToCartRate")} />
      </div>

      <div>
        <label>checkoutClickRate</label>
        <input type="number" {...register("checkoutClickRate")} />
      </div>

      <div>
        <label>whatsappClickRate</label>
        <input type="number" {...register("whatsappClickRate")} />
      </div>

      <div>
        <label>conversionRate</label>
        <input type="number" {...register("conversionRate")} />
      </div>

      <div>
        <label>variantPopularity</label>
        <input type="text" {...register("variantPopularity")} />
      </div>

      <div>
        <label>abandonmentCount</label>
        <input type="number" {...register("abandonmentCount")} />
      </div>

      <div>
        <label>fraudFlagCount</label>
        <input type="number" {...register("fraudFlagCount")} />
      </div>

      <div>
        <label>createdAt</label>
        <input type="datetime-local" {...register("createdAt")} />
      </div>

      <div>
        <label>updatedAt</label>
        <input type="datetime-local" {...register("updatedAt")} />
      </div>

      <button type="submit">Save ProductInsights</button>
    </form>
  );
}
// === AUTO-GENERATED END ===
