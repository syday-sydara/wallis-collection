export interface CartItemSnapshot {
  id: string;
  name: string;
  price: number;
  quantity: number;
  variants?: Record<string, string>;
  key: string;
}