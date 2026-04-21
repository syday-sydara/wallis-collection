"use client";

import { useModal } from "@/components/admin/ui/modal/AdminModalController";
import VariantForm from "@/components/admin/variants/VariantForm";

export default function VariantsTab({ product }) {
  const modal = useModal();

  return (
    <div className="space-y-4">
      <button
        className="btn btn-primary"
        onClick={() =>
          modal.open(<VariantForm productId={product.id} />, { size: "md" })
        }
      >
        Add Variant
      </button>

      <div className="border border-border-default rounded-md divide-y">
        {product.variants.map((v) => (
          <div key={v.id} className="p-3 flex justify-between">
            <div>
              <div className="font-medium">{v.name}</div>
              <div className="text-text-secondary text-sm">
                Price: ₦{(v.price / 100).toFixed(2)}
              </div>
            </div>

            <button
              className="btn btn-sm btn-outline"
              onClick={() =>
                modal.open(
                  <VariantForm productId={product.id} variant={v} />,
                  { size: "md" }
                )
              }
            >
              Edit
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
