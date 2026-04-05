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
  await requirePermission(PERMISSIONS.VIEW_ADMIN);

  const cursor = Array.isArray(searchParams?.cursor)
    ? searchParams.cursor[0]
    : searchParams?.cursor;

  const data = await adminListProductsPaginated({ cursor });

  return <AdminProductsClient initialData={data} />;
}