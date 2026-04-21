import NewProductForm from "./NewProductForm";

export default function NewProductPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">New Product</h1>
      </div>

      <NewProductForm />
    </div>
  );
}
