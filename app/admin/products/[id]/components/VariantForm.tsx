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
        className="rounded border px-2 py-1"
        required
      />
      <input
        name="sku"
        placeholder="SKU"
        className="rounded border px-2 py-1"
        required
      />
      <input
        name="price"
        type="number"
        placeholder="Price (kobo)"
        className="rounded border px-2 py-1"
        required
      />
      <SubmitButton
        pendingLabel="Adding..."
        className="col-span-3 rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        Add variant
      </SubmitButton>
    </form>
  );
}