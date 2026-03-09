import ProductGrid from "@/components/products/ProductGrid";
import { getProducts } from "@/modules/products/queries";

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <div className="py-10 max-w-7xl mx-auto px-4 space-y-8">
      <h1 className="heading-1 text-center">Shop African Fashion</h1>

      {products.length === 0 ? (
        <p className="text-center text-neutral-600 font-medium">
          No products found.
        </p>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
