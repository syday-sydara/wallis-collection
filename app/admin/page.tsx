// app/admin/products/page.tsx
export const dynamic = "force-dynamic";

import AdminProductsClient from "./AdminProductsClient";
import { adminListProductsPaginated } from "@/lib/catalog/admin";

interface AdminProductsPageProps {
  searchParams?: {
    cursor?: string;
  };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const cursor = searchParams?.cursor;

  // Fetch paginated products
  const data = await adminListProductsPaginated({ cursor });

  if (!data || !Array.isArray(data.items)) {
    throw new Error("Invalid product data from server");
  }

  return <AdminProductsClient initialData={data} />;
}