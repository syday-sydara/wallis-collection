import { adminListProductsPaginated } from "@/lib/catalog/admin";
import AdminProductsClient from "./AdminProductsClient";

export default async function AdminProductsPage({ searchParams }) {
  const data = await adminListProductsPaginated({
    cursor: searchParams?.cursor,
  });

  return <AdminProductsClient initialData={data} />;
}