// lib/types.ts
import { Prisma } from "@prisma/client"

/* ---------------------------------- */
/* Product Types                      */
/* ---------------------------------- */

export const productCardSelect = Prisma.validator<Prisma.ProductSelect>()({
  id: true,
  name: true,
  slug: true,
  priceNaira: true,
  salePriceNaira: true,
  category: true,
  stock: true,
  createdAt: true,
  images: {
    select: {
      url: true,
      position: true,
    },
  },
})

export type ProductCardData = Prisma.ProductGetPayload<{
  select: typeof productCardSelect
}>

export type Product = Prisma.ProductGetPayload<{
  include: { images: true; reviews: true }
}>

/* ---------------------------------- */
/* Cart Types                         */
/* ---------------------------------- */

export interface CartItem {
  productId: string
  name: string
  price: number // final price (sale or regular)
  image: string
  quantity: number
  addedAt: Date
}

/* ---------------------------------- */
/* Order Types                        */
/* ---------------------------------- */

export type OrderStatus =
  | "PENDING"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"

export interface OrderSummary {
  id: string
  totalCents: number
  status: OrderStatus
  createdAt: Date
}
