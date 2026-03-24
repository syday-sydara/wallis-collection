// lib/cart/cart.ts
import type { CartItem, ProductCardData } from "@/lib/types/types";

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
  product: any, // Use 'any' temporarily or import the Product type from @prisma/client
  quantity: number = 1,
  selectedVariants: Record<string, string> = {}
): CartItem {
  // 1. Use the correct property names from schema.prisma
  // 2. Convert from Kobo (stored) to Naira (UI) if you follow the seed.ts logic
  const basePrice = product.price / 100;
  const salePrice = product.salePrice ? product.salePrice / 100 : null;
  
  const activePrice = salePrice ?? basePrice;
  
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