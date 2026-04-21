import { prisma } from "@/lib/prisma";
import ProductTabs from "../../../../components/admin/products/ProductTabs";

export default async function ProductDetailPage({ params }) {
  const product = await prisma.product.findUnique({
    where: { id: params.id },
    include: {
      images: true,
      variants: true,
    },
  });

  if (!product) {
    return <div className="p-6">Product not found.</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">{product.name}</h1>

      <ProductTabs product={product} />
    </div>
  );
}
