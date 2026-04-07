// app/admin/products/page.tsx
export const dynamic = "force-dynamic";

import AdminProductsClient from "./AdminProductsClient";
import { adminListProductsPaginated } from "@/lib/products/admin";
import { requirePermission } from "@/lib/auth/require-admin";
import { PERMISSIONS } from "@/lib/auth/permissions";

interface AdminProductsPageProps {
  searchParams?: {
    cursor?: string | string[];
  };
}

export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  // Permission check (you may later switch to PERMISSIONS.VIEW_PRODUCTS)
  await requirePermission(PERMISSIONS.VIEW_ADMIN);

  // Normalize cursor
  const cursorParam = searchParams?.cursor;
  const cursor = Array.isArray(cursorParam) ? cursorParam[0] : cursorParam;

  // Fetch paginated products
  const data = await adminListProductsPaginated({ cursor });

  return <AdminProductsClient initialData={data} />;
}
