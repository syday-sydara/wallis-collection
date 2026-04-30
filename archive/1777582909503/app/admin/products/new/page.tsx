import NewProductForm from "./NewProductForm";
import Link from "next/link";

export default function NewProductPage() {
  return (
    <div className="space-y-8">
      {/* Breadcrumb */}
      <nav className="text-sm text-text-muted">
        <Link href="/admin/products" className="hover:underline">
          Products
        </Link>
        <span className="mx-1">/</span>
        <span className="text-text">New</span>
      </nav>

      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-xl font-semibold tracking-tight">New Product</h1>
        <p className="text-sm text-text-muted">
          Create a new product and configure its details.
        </p>
      </div>

      {/* Form Container */}
      <div className="rounded-lg border border-border bg-surface-card p-6 shadow-sm">
        <NewProductForm />
      </div>
    </div>
  );
}
