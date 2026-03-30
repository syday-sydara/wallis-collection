"use client";

interface Props {
  productId: string;
  variant?: any;
  disabled?: boolean;
}

export default function AddToCartButton({
  productId,
  variant,
  disabled,
}: Props) {
  function handleClick() {
    console.log("Add to cart:", { productId, variant });
  }

  return (
    <button
      onClick={handleClick}
      disabled={disabled}
      className="w-full rounded-md bg-primary text-white py-3 font-medium disabled:opacity-50"
    >
      Add to Cart
    </button>
  );
}