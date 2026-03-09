#!/bin/bash

echo "🚀 Creating production-ready Nigerian ecommerce store structure..."

###############################################
# APP ROUTER STRUCTURE
###############################################

# Public-facing pages
mkdir -p "app/(public)"
mkdir -p "app/(public)/products"
mkdir -p "app/(public)/products/[slug]"
mkdir -p "app/(public)/categories/[slug]"
mkdir -p "app/(public)/cart"
mkdir -p "app/(public)/checkout"
mkdir -p "app/(public)/track-order"
mkdir -p "app/(public)/search"

# Auth routes
mkdir -p "app/(auth)/login"
mkdir -p "app/(auth)/register"

# Customer dashboard
mkdir -p "app/(customer)/account"
mkdir -p "app/(customer)/account/orders"
mkdir -p "app/(customer)/account/addresses"
mkdir -p "app/(customer)/account/settings"

# Admin dashboard
mkdir -p "app/(admin)/dashboard"
mkdir -p "app/(admin)/products"
mkdir -p "app/(admin)/orders"
mkdir -p "app/(admin)/customers"
mkdir -p "app/(admin)/inventory"
mkdir -p "app/(admin)/coupons"
mkdir -p "app/(admin)/reviews"
mkdir -p "app/(admin)/analytics"
mkdir -p "app/(admin)/fraud"
mkdir -p "app/(admin)/refunds"

###############################################
# API ROUTES
###############################################

mkdir -p "app/api/auth"
mkdir -p "app/api/products"
mkdir -p "app/api/cart"
mkdir -p "app/api/orders"
mkdir -p "app/api/orders/lookup"

mkdir -p "app/api/paystack/initialize"
mkdir -p "app/api/paystack/webhook"

mkdir -p "app/api/monnify/create-account"
mkdir -p "app/api/monnify/webhook"

mkdir -p "app/api/coupons/validate"
mkdir -p "app/api/reviews/create"
mkdir -p "app/api/refunds/request"

mkdir -p "app/api/push/subscribe"

###############################################
# COMPONENTS
###############################################

mkdir -p components/ui
mkdir -p components/layout
mkdir -p components/product
mkdir -p components/cart
mkdir -p components/checkout
mkdir -p components/payments
mkdir -p components/admin
mkdir -p components/reviews

###############################################
# LIBRARIES
###############################################

mkdir -p lib/payments
mkdir -p lib/fraud
mkdir -p lib/shipping
mkdir -p lib/cart
mkdir -p lib/analytics

###############################################
# CORE LIB FILES
###############################################

echo "// Prisma client" > lib/db.ts
echo "// Authentication logic" > lib/auth.ts

echo "// Paystack integration" > lib/payments/paystack.ts
echo "// Monnify integration" > lib/payments/monnify.ts

echo "// Shipping rules (Nigeria states)" > lib/shipping/shipping.ts

echo "// Cart helpers" > lib/cart/cart.ts

echo "// Fraud rules engine" > lib/fraud/rules.ts
echo "// AI fraud detection" > lib/fraud/ai.ts
echo "// Fraud score combiner" > lib/fraud/compute.ts

echo "// Analytics tracking" > lib/analytics/events.ts

###############################################
# BASIC PLACEHOLDER PAGES
###############################################

for page in page login register; do
  echo "export default function Page(){return <div>${page^}</div>}" > "app/(public)/$page/page.tsx"
done

echo "export default function Page(){return <div>Cart</div>}" > "app/(public)/cart/page.tsx"
echo "export default function Page(){return <div>Checkout</div>}" > "app/(public)/checkout/page.tsx"
echo "export default function Page(){return <div>Track Order</div>}" > "app/(public)/track-order/page.tsx"

###############################################
# PLACEHOLDER API ROUTES
###############################################

ROUTES=(
  "paystack/initialize"
  "paystack/webhook"
  "monnify/create-account"
  "monnify/webhook"
  "orders/lookup"
  "refunds/request"
  "coupons/validate"
  "reviews/create"
  "push/subscribe"
)

for route in "${ROUTES[@]}"; do
  mkdir -p "app/api/$route"
  echo "export async function POST(){return Response.json({ok:true})}" > "app/api/$route/route.ts"
done

###############################################
# PRISMA SCHEMA
###############################################

mkdir -p prisma
cat << 'EOF' > prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum Role { ADMIN USER }
enum PaymentMethod { PAYSTACK MONNIFY COD }
enum OrderStatus { PENDING PAID FAILED SHIPPED DELIVERED REFUNDED CANCELLED }
enum InventoryReason { SALE RESTOCK REFUND MANUAL_ADJUSTMENT }
enum ShipmentStatus { PROCESSING SHIPPED IN_TRANSIT DELIVERED FAILED }
enum EventType { PRODUCT_VIEW ADD_TO_CART CHECKOUT_STARTED ORDER_PLACED }

model User {
  id        String   @id @default(cuid())
  name      String?
  email     String   @unique
  phone     String?
  password  String?
  role      Role     @default(USER)
  orders    Order[]
  reviews   Review[]
  addresses Address[]
  events    Event[]
  createdAt DateTime @default(now())
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  priceNaira  Int
  salePriceNaira Int?
  stock       Int @default(0)
  category    String?
  brand       String?
  sizes       String[]
  colors      String[]
  isNew       Boolean @default(false)
  isOnSale    Boolean @default(false)
  featured    Boolean @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  images      ProductImage[]
  reviews     Review[]
  inventory   InventoryMovement[]
}

model ProductImage {
  id        String @id @default(cuid())
  productId String
  url       String
  position  Int
  product Product @relation(fields: [productId], references: [id])
}

model Order {
  id            String      @id @default(cuid())
  userId        String?
  user          User?       @relation(fields: [userId], references: [id])
  email         String
  phone         String?
  status        OrderStatus @default(PENDING)
  paymentMethod PaymentMethod
  providerRef   String?
  totalCents    Int
  currency      String      @default("NGN")
  trackingStatus String     @default("Processing")
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  items         OrderItem[]
  shipments     Shipment[]
}

model OrderItem {
  id         String  @id @default(cuid())
  orderId    String
  productId  String
  quantity   Int
  priceCents Int
  order   Order   @relation(fields: [orderId], references: [id])
  product Product @relation(fields: [productId], references: [id])
}

model Address {
  id        String @id @default(cuid())
  userId    String?
  fullName  String
  phone     String
  state     String
  city      String
  address   String
  user      User? @relation(fields: [userId], references: [id])
}

model Review {
  id        String @id @default(cuid())
  productId String
  userId    String?
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
  product Product @relation(fields: [productId], references: [id])
  user    User?   @relation(fields: [userId], references: [id])
}

model RefundRequest {
  id        String @id @default(cuid())
  orderId   String
  reason    String
  status    String   @default("PENDING")
  createdAt DateTime @default(now())
  updatedAt DateTime @default(now())
}

model FraudSignal {
  id        String @id @default(cuid())
  orderId   String
  score     Int
  details   Json?
  createdAt DateTime @default(now())
}

model PushSubscription {
  id        String @id @default(cuid())
  userId    String?
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
}

model InventoryMovement {
  id        String   @id @default(cuid())
  productId String
  change    Int
  reason    InventoryReason
  reference String?
  createdAt DateTime @default(now())
  product Product @relation(fields: [productId], references: [id])
}

model Shipment {
  id             String          @id @default(cuid())
  orderId        String
  courier        String?
  trackingNumber String?
  status         ShipmentStatus
  createdAt      DateTime @default(now())
  order   Order           @relation(fields: [orderId], references: [id])
  updates ShipmentUpdate[]
}

model ShipmentUpdate {
  id         String   @id @default(cuid())
  shipmentId String
  status     String
  note       String?
  createdAt  DateTime @default(now())
  shipment Shipment @relation(fields: [shipmentId], references: [id])
}

model Event {
  id        String   @id @default(cuid())
  userId    String?
  type      EventType
  data      Json?
  createdAt DateTime @default(now())
  user User? @relation(fields: [userId], references: [id])
}
EOF

echo "🎉 Project skeleton with complete Prisma schema created successfully!"