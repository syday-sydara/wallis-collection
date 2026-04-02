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
    <form action={updateAction} className="space-y-4 text-sm">
      {/* Name */}
      <div>
        <label className="block text-xs font-medium text-text-muted">
          Name
        </label>
        <input
          name="name"
          required
          defaultValue={product.name}
          className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-text shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
        />
      </div>

      {/* Slug */}
      <div>
        <label className="block text-xs font-medium text-text-muted">
          Slug
        </label>
        <input
          name="slug"
          required
          defaultValue={product.slug}
          className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-text shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
        />
        <p className="mt-1 text-[11px] text-text-muted">
          Slug must be unique and URL‑friendly.
        </p>
      </div>

      {/* Base Price */}
      <div>
        <label className="block text-xs font-medium text-text-muted">
          Base price (kobo)
        </label>
        <input
          name="basePrice"
          type="number"
          required
          defaultValue={product.basePrice}
          className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-text shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
        />
        <p className="mt-1 text-[11px] text-text-muted">
          Enter price in kobo (₦1000 = ₦10.00).
        </p>
      </div>

      {/* Description */}
      <div>
        <label className="block text-xs font-medium text-text-muted">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={product.description ?? ""}
          rows={4}
          className="mt-1 w-full rounded-md border border-border bg-surface px-2 py-1.5 text-text shadow-sm 
                     focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
        />
      </div>

      {/* Archived toggle */}
      <div className="flex items-center gap-2">
        <input
          id="isArchived"
          name="isArchived"
          type="checkbox"
          defaultChecked={product.isArchived}
          className="h-4 w-4 rounded border-border text-primary 
                     focus:ring-[rgb(var(--focus-ring))]"
        />
        <label htmlFor="isArchived" className="text-xs text-text">
          Archived
        </label>
      </div>

      {/* Submit */}
      <SubmitButton
        pendingLabel="Saving..."
        className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground 
                   shadow-sm hover:bg-primary-hover active:bg-primary-active 
                   disabled:opacity-60 transition-all"
      >
        Save
      </SubmitButton>
    </form>
  );
}