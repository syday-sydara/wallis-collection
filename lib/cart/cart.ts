// lib/cart.ts
import type { CartItem } from "@/lib/types";
import type { ProductCardData } from "@/lib/types";

/* ---------------------------------- */
/* Create a CartItem from Product     */
/* ---------------------------------- */
export function toCartItem(
  product: ProductCardData,
  quantity: number = 1
): CartItem {
  return {
    productId: product.id,
    name: product.name,
    price: product.salePriceNaira ?? product.priceNaira,
    image: product.images?.[0]?.url ?? "",
    quantity,
    addedAt: new Date(),
  };
}

/* ---------------------------------- */
/* Add item to cart                   */
/* ---------------------------------- */
export function addToCart(
  cart: CartItem[],
  item: CartItem
): CartItem[] {
  const existing = cart.find((c) => c.productId === item.productId);

  if (existing) {
    return cart.map((c) =>
      c.productId === item.productId
        ? { ...c, quantity: c.quantity + item.quantity }
        : c
    );
  }

  return [...cart, item];
}

/* ---------------------------------- */
/* Remove item from cart              */
/* ---------------------------------- */
export function removeFromCart(
  cart: CartItem[],
  productId: string
): CartItem[] {
  return cart.filter((c) => c.productId !== productId);
}

/* ---------------------------------- */
/* Update quantity                    */
/* ---------------------------------- */
export function updateCartQuantity(
  cart: CartItem[],
  productId: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(cart, productId);
  }

  return cart.map((c) =>
    c.productId === productId ? { ...c, quantity } : c
  );
}

/* ---------------------------------- */
/* Clear cart                         */
/* ---------------------------------- */
export function clearCart(): CartItem[] {
  return [];
}

/* ---------------------------------- */
/* Calculate totals                   */
/* ---------------------------------- */
export function calculateCartTotal(cart: CartItem[]) {
  return cart.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
}

/* ---------------------------------- */
/* Count total items                  */
/* ---------------------------------- */
export function countCartItems(cart: CartItem[]) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
