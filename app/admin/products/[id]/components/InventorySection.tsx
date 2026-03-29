import { adjustInventory } from "@/app/admin/products/actions";
import { SubmitButton } from "./SubmitButton";

export function InventorySection({
  productId,
  stock
}: {
  productId: string;
  stock: number;
}) {
  async function inventoryAction(formData: FormData) {
    "use server";
    await adjustInventory(productId, formData);
  }

  return (
    <div>
      <h3 className="text-sm font-semibold">Inventory</h3>
      <p className="text-xs text-neutral-600">
        Current stock: <span className="font-semibold">{stock}</span>
      </p>
      <form action={inventoryAction} className="mt-2 space-y-2 text-xs">
        <div className="flex gap-2">
          <input
            name="change"
            type="number"
            placeholder="+10 / -5"
            className="w-24 rounded border px-2 py-1"
            required
          />
          <input
            name="reason"
            placeholder="Reason"
            className="flex-1 rounded border px-2 py-1"
            required
          />
        </div>
        <SubmitButton
          pendingLabel="Adjusting..."
          className="rounded bg-neutral-900 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          Adjust stock
        </SubmitButton>
      </form>
    </div>
  );
}