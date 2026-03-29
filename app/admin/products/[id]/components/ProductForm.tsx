import { updateProduct } from "@/app/admin/products/actions";
import { SubmitButton } from "./SubmitButton";

type Product = {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  description: string | null;
  isArchived: boolean;
};

export function ProductForm({ product }: { product: Product }) {
  async function updateAction(formData: FormData) {
    "use server";
    await updateProduct(product.id, formData);
  }

  return (
    <form action={updateAction} className="space-y-3 text-sm">
      <div>
        <label className="block text-xs font-medium">Name</label>
        <input
          name="name"
          required
          defaultValue={product.name}
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium">Slug</label>
        <input
          name="slug"
          required
          defaultValue={product.slug}
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
        />
        <p className="mt-1 text-[11px] text-neutral-500">
          Slug must be unique and URL‑friendly.
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium">Base price (kobo)</label>
        <input
          name="basePrice"
          type="number"
          required
          defaultValue={product.basePrice}
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
        />
        <p className="mt-1 text-[11px] text-neutral-500">
          Enter price in kobo (₦1000 = ₦10.00).
        </p>
      </div>
      <div>
        <label className="block text-xs font-medium">Description</label>
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          className="mt-1 w-full rounded border px-2 py-1 text-sm"
          rows={4}
        />
      </div>
      <div className="flex items-center gap-2">
        <input
          id="isArchived"
          name="isArchived"
          type="checkbox"
          defaultChecked={product.isArchived}
        />
        <label htmlFor="isArchived" className="text-xs">
          Archived
        </label>
      </div>
      <SubmitButton
        pendingLabel="Saving..."
        className="rounded bg-black px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
      >
        Save
      </SubmitButton>
    </form>
  );
}