export interface CartItem {
  productId: string;
  variantId: string;
  name: string;
  variantName?: string;
  quantity: number;
  price: number; // in cents
  image?: string;
}

export interface Cart {
  items: CartItem[];
  total: number; // in cents
}