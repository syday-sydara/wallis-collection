// lib/cart.ts
import type { CartItem } from "@/lib/types/types";
import type { ProductCardData } from "@/lib/types/types";

/* ---------------------------------- */
/* Create a CartItem from Product     */
/* ---------------------------------- */
export function toCartItem(
  product: ProductCardData,
  quantity: number = 1
): CartItem {
  const key = generateCartKey(product, product.variants ?? {});
  return {
    productId: product.id,
    name: product.name,
    price: product.salePriceNaira ?? product.priceNaira,
    image: product.images?.[0]?.url ?? "",
    quantity,
    addedAt: new Date(),
    key, // unique key for variant + product
    variants: product.variants ?? {},
  };
}

/* ---------------------------------- */
/* Generate unique key per product+variant */
/* ---------------------------------- */
export function generateCartKey(
  product: ProductCardData,
  variants: Record<string, string>
) {
  const variantKey =
    Object.entries(variants).map(([k, v]) => `${k}:${v}`).join("|") || "default";
  return `${product.id}-${variantKey}`;
}

/* ---------------------------------- */
/* Add item to cart                   */
/* ---------------------------------- */
export function addToCart(cart: CartItem[], item: CartItem): CartItem[] {
  const existing = cart.find((c) => c.key === item.key);

  if (existing) {
    return cart.map((c) =>
      c.key === item.key ? { ...c, quantity: c.quantity + item.quantity } : c
    );
  }

  return [...cart, item];
}

/* ---------------------------------- */
/* Remove item from cart              */
/* ---------------------------------- */
export function removeFromCart(cart: CartItem[], key: string): CartItem[] {
  return cart.filter((c) => c.key !== key);
}

/* ---------------------------------- */
/* Update quantity                    */
/* ---------------------------------- */
export function updateCartQuantity(
  cart: CartItem[],
  key: string,
  quantity: number
): CartItem[] {
  if (quantity <= 0) {
    return removeFromCart(cart, key);
  }

  return cart.map((c) => (c.key === key ? { ...c, quantity } : c));
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
export function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

/* ---------------------------------- */
/* Count total items                  */
/* ---------------------------------- */
export function countCartItems(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/* ---------------------------------- */
/* Cart Snapshot for recovery         */
/* ---------------------------------- */
export function saveCartSnapshot(cart: CartItem[]) {
  try {
    localStorage.setItem("cart_snapshot", JSON.stringify(cart));
  } catch {
    // ignore errors on low-end devices
  }
}

export function loadCartSnapshot(): CartItem[] {
  try {
    const snapshot = localStorage.getItem("cart_snapshot");
    return snapshot ? JSON.parse(snapshot) : [];
  } catch {
    return [];
  }
}

export function clearCartSnapshot() {
  try {
    localStorage.removeItem("cart_snapshot");
  } catch {}
}