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
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text tracking-tight">
        Inventory
      </h3>

      <p className="text-xs text-text-muted">
        Current stock: <span className="font-semibold text-text">{stock}</span>
      </p>

      <form action={inventoryAction} className="mt-2 space-y-3 text-xs">
        <div className="flex gap-2">
          <input
            name="change"
            type="number"
            placeholder="+10 / -5"
            className="w-24 rounded-md border border-border bg-surface px-2 py-1.5 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
            required
          />

          <input
            name="reason"
            placeholder="Reason"
            className="flex-1 rounded-md border border-border bg-surface px-2 py-1.5 text-text shadow-sm focus:outline-none focus:ring-2 focus:ring-[rgb(var(--focus-ring))]"
            required
          />
        </div>

        <SubmitButton
          pendingLabel="Adjusting..."
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground shadow-sm hover:bg-primary-hover active:bg-primary-active disabled:opacity-60 transition-all"
        >
          Adjust stock
        </SubmitButton>
      </form>
    </div>
  );
}