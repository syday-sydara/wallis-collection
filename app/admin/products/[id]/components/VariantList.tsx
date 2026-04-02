import { deleteVariant, updateVariant } from "@/app/admin/products/actions";
import { SubmitButton } from "./SubmitButton";

type Variant = {
  id: string;
  name: string;
  sku: string;
  price: number;
};

export function VariantList({ variants }: { variants: Variant[] }) {
  return (
    <ul className="space-y-3 text-xs">
      {variants.map((v) => (
        <li
          key={v.id}
          className="rounded-md border border-border bg-surface p-3 shadow-sm space-y-2"
        >
          {/* UPDATE FORM */}
          <form
            action={async (formData) => {
              "use server";
              await updateVariant(v.id, formData);
            }}
            className="flex flex-wrap items-start gap-3"
          >
            <input
              name="name"
              defaultValue={v.name}
              required
              className="w-32 rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
            />

            <input
              name="sku"
              defaultValue={v.sku}
              required
              className="w-32 rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
            />

            <input
              name="price"
              type="number"
              defaultValue={v.price}
              required
              className="w-28 rounded-md border border-border bg-surface px-2 py-1.5 text-text 
                         shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
            />

            <SubmitButton
              pendingLabel="Saving..."
              className="rounded-md bg-primary px-3 py-1.5 text-[11px] font-medium 
                         text-primary-foreground shadow-sm hover:bg-primary-hover 
                         active:bg-primary-active disabled:opacity-60 transition-all"
            >
              Save
            </SubmitButton>
          </form>

          {/* DELETE FORM */}
          <form
            action={async () => {
              "use server";
              await deleteVariant(v.id);
            }}
          >
            <SubmitButton
              pendingLabel="Deleting..."
              className="text-[11px] text-danger-foreground hover:underline disabled:opacity-60"
            >
              Delete
            </SubmitButton>
          </form>
        </li>
      ))}
    </ul>
  );
}