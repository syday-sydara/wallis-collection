import clsx from "clsx";

export function AddToCartButton({ className = "", ...props }) {
  return (
    <div className={clsx("rounded border border-gray-200 p-3 bg-white", className)} {...props}>
      <span className="text-gray-400 text-sm">AddToCartButton component</span>
    </div>
  );
}
