import { Prisma } from "@prisma/client"

/* ---------------------------------- */
/* Product Types                      */
/* ---------------------------------- */

export type Product = Prisma.ProductGetPayload<{}>

export const productCardSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  slug: true,
  priceNaira: true,
  images: true,
  category: true,
  stock: true,
  createdAt: true,
})

export type ProductCardData = Prisma.ProductGetPayload<{
  select: typeof productCardSelect
}>

/* ---------------------------------- */
/* Cart Types                         */
/* ---------------------------------- */

export interface CartItem {
  productId: string
  name: string
  priceNaira: number
  image: string
  quantity: number
  addedAt: Date
}

/* ---------------------------------- */
/* Order Types                        */
/* ---------------------------------- */

export type OrderStatus =
  | "pending"
  | "paid"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "refunded"

export interface OrderSummary {
  id: string
  totalCents: number
  status: OrderStatus
  createdAt: Date
}