import { notFound } from "next/navigation";
import { getProductById } from "@/lib/catalog/admin/getProducts";

import { AdminPageHeader } from "@/components/admin/ui/AdminPageHeader";
import { AdminSection } from "@/components/admin/ui/AdminSection";
import { AdminCard } from "@/components/admin/ui/AdminCard";

import { ProductForm } from "./[id]/components/ProductForm";
import { VariantForm } from "./[id]/components/VariantForm";
import VariantItem from "./[id]/components/VariantItem";
import { InventorySection } from "./[id]/components/InventorySection";
import { ImagesManager } from "./[id]/components/ImagesManager";
import Link from "next/link";

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(params.id);
  if (!product) notFound();

  return (
    <div className="space-y-10">
      <AdminPageHeader
        title={product.name}
        subtitle={`SKU: ${product.slug}`}
        breadcrumbs={
          <nav aria-label="Breadcrumb">
            <ol className="flex items-center gap-1 text-xs text-text-muted">
              <li>
                <Link href="/admin/products" className="hover:underline">
                  Products
                </Link>
              </li>
              <li>/</li>
              <li className="text-text">{product.name}</li>
            </ol>
          </nav>
        }
      />

      <AdminSection title="Product Information">
        <AdminCard>
          <ProductForm product={product} />
        </AdminCard>
      </AdminSection>

      <AdminSection
        title="Variants"
        description="Manage product variants such as sizes, colors, or configurations."
      >
        <AdminCard header="Add Variant">
          <VariantForm productId={product.id} />
        </AdminCard>

        <div className="space-y-3">
          {product.variants.length === 0 ? (
            <p className="text-xs text-text-muted">No variants yet.</p>
          ) : (
            product.variants.map((variant) => (
              <AdminCard key={variant.id}>
                <VariantItem variant={variant} />
              </AdminCard>
            ))
          )}
        </div>
      </AdminSection>

      <AdminSection
        title="Inventory"
        description="Adjust stock levels and view recent inventory movements."
      >
        <AdminCard>
          <InventorySection product={product} movements={product.movements} />
        </AdminCard>
      </AdminSection>

      <AdminSection
        title="Images"
        description="Manage product images and display order."
      >
        <AdminCard>
          <ImagesManager product={product} />
        </AdminCard>
      </AdminSection>
    </div>
  );
}