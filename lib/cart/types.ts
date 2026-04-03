export type CartItem = {
  id: string;
  productId: string;
  name: string;
  unitPrice: number;
  image: string;
  quantity: number;
  attributes?: Record<string, any>;
};