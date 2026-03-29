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
    <ul className="space-y-2 text-xs">
      {variants.map((v) => (
        <li key={v.id} className="rounded border p-2 space-y-1">
          <form
            action={async (formData) => {
              "use server";
              await updateVariant(v.id, formData);
            }}
            className="flex flex-wrap items-center gap-2"
          >
            <input
              name="name"
              defaultValue={v.name}
              className="w-32 rounded border px-2 py-1"
              required
            />
            <input
              name="sku"
              defaultValue={v.sku}
              className="w-32 rounded border px-2 py-1"
              required
            />
            <input
              name="price"
              type="number"
              defaultValue={v.price}
              className="w-28 rounded border px-2 py-1"
              required
            />
            <SubmitButton
              pendingLabel="Saving..."
              className="rounded bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white disabled:opacity-60"
            >
              Save
            </SubmitButton>
          </form>
          <form
            action={async () => {
              "use server";
              await deleteVariant(v.id);
            }}
            className="mt-1"
          >
            <SubmitButton
              pendingLabel="Deleting..."
              className="text-[11px] text-red-600 hover:underline disabled:opacity-60"
            >
              Delete
            </SubmitButton>
          </form>
        </li>
      ))}
    </ul>
  );
}