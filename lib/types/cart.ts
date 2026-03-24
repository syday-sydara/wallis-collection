export interface CartItemSnapshot {
  id: string;
  name: string;
  price: number;       // Naira
  quantity: number;
  variants?: Record<string, string>;
  key: string;
}