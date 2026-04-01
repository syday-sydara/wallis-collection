export interface CartItem {
  productId: string;
  variantId: string;

  name: string;
  variantName?: string;

  quantity: number;
  price: number; // in kobo
  stock: number; // max allowed quantity

  image?: string;
}

export interface Cart {
  items: CartItem[];
  total: number; // in kobo
}
