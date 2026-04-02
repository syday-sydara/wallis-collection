import { createVariant } from "@/app/admin/products/actions";
import { SubmitButton } from "./SubmitButton";

export function VariantForm({ productId }: { productId: string }) {
  async function variantAction(formData: FormData) {
    "use server";
    await createVariant(productId, formData);
  }

  return (
    <form
      action={variantAction}
      className="mt-2 grid grid-cols-3 gap-2 text-xs"
    >
      <input
        name="name"
        placeholder="Variant name"
        required
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                   shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
      />

      <input
        name="sku"
        placeholder="SKU"
        required
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                   shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
      />

      <input
        name="price"
        type="number"
        placeholder="Price (kobo)"
        required
        className="rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                   shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
      />

      <SubmitButton
        pendingLabel="Adding..."
        className="col-span-3 rounded-md bg-primary px-3 py-1.5 text-xs font-medium 
                   text-primary-foreground shadow-sm hover:bg-primary-hover 
                   active:bg-primary-active disabled:opacity-60 transition-all"
      >
        Add variant
      </SubmitButton>
    </form>
  );
}