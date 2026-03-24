// lib/cart/cart.ts
import type { CartItem } from "@/lib/types/types";

/**
 * Custom interface to match your database Product model
 */
interface ProductData {
  id: string;
  name: string;
  price: number;
  salePrice: number | null;
  stock: number;
  images: { url: string; position: number; }[];
}

/**
 * Create a standardized CartItem from a Product
 */
export function toCartItem(
  product: ProductData,
  quantity: number = 1,
  selectedVariants: Record<string, string> = {}
): CartItem {
  // Logic: Use salePrice if available, otherwise regular price
  const activePrice = product.salePrice ?? product.price;
  
  const key = generateCartKey(product.id, selectedVariants);
  
  return {
    productId: product.id,
    name: product.name,
    price: activePrice, 
    image: product.images?.[0]?.url ?? "",
    quantity,
    addedAt: new Date(),
    key, 
    variants: selectedVariants,
  };
}

/**
 * Generates a unique key for product + variant combinations
 * to ensure different sizes/colors are treated as separate line items.
 */
export function generateCartKey(
  productId: string,
  variants: Record<string, string>
): string {
  const variantString =
    Object.entries(variants)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => `${k.toLowerCase()}:${v.toLowerCase()}`)
      .join("|") || "default";
      
  return `${productId}-${variantString}`;
}

export function calculateCartTotal(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

export function countCartItems(cart: CartItem[]): number {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}