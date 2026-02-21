#!/bin/bash

echo "🚀 Setting up project structure (Prisma 7 compatible, no route conflicts)..."

###############################################
# APP ROUTER STRUCTURE (FIXED)
###############################################

# Public-facing pages
mkdir -p "app/(public)"
mkdir -p "app/(public)/products"
mkdir -p "app/(public)/products/[slug]"
mkdir -p "app/(public)/cart"
mkdir -p "app/(public)/checkout"
mkdir -p "app/(public)/track-order"   # renamed from /orders to avoid conflict

# Auth routes
mkdir -p "app/(auth)/login"
mkdir -p "app/(auth)/register"

# Customer dashboard
mkdir -p "app/(customer)/account"
mkdir -p "app/(customer)/account/orders"   # moved from /orders to avoid conflict

# Admin dashboard
mkdir -p "app/(admin)/dashboard"
mkdir -p "app/(admin)/orders"
mkdir -p "app/(admin)/refunds"
mkdir -p "app/(admin)/fraud"
mkdir -p "app/(admin)/inventory"

###############################################
# API ROUTES
###############################################

mkdir -p "app/api/paystack/initialize"
mkdir -p "app/api/paystack/webhook"

mkdir -p "app/api/monnify/create-account"
mkdir -p "app/api/monnify/webhook"

mkdir -p "app/api/orders/lookup"
mkdir -p "app/api/refunds/request"
mkdir -p "app/api/push/subscribe"

###############################################
# COMPONENTS
###############################################

mkdir -p components/ui
mkdir -p components/checkout
mkdir -p components/payments
mkdir -p components/admin

###############################################
# LIB FOLDERS
###############################################

mkdir -p lib/fraud

###############################################
# PLACEHOLDER PAGES
###############################################

echo "export default function Page() { return <div>Home</div> }" > "app/(public)/page.tsx"
echo "export default function Page() { return <div>Products</div> }" > "app/(public)/products/page.tsx"
echo "export default function Page() { return <div>Product Detail</div> }" > "app/(public)/products/[slug]/page.tsx"
echo "export default function Page() { return <div>Cart</div> }" > "app/(public)/cart/page.tsx"
echo "export default function Page() { return <div>Checkout</div> }" > "app/(public)/checkout/page.tsx"
echo "export default function Page() { return <div>Track Order</div> }" > "app/(public)/track-order/page.tsx"

echo "export default function Page() { return <div>Login</div> }" > "app/(auth)/login/page.tsx"
echo "export default function Page() { return <div>Register</div> }" > "app/(auth)/register/page.tsx"

echo "export default function Page() { return <div>Account</div> }" > "app/(customer)/account/page.tsx"
echo "export default function Page() { return <div>Customer Orders</div> }" > "app/(customer)/account/orders/page.tsx"

echo "export default function Page() { return <div>Admin Dashboard</div> }" > "app/(admin)/dashboard/page.tsx"
echo "export default function Page() { return <div>Admin Orders</div> }" > "app/(admin)/orders/page.tsx"
echo "export default function Page() { return <div>Refund Center</div> }" > "app/(admin)/refunds/page.tsx"
echo "export default function Page() { return <div>Fraud Center</div> }" > "app/(admin)/fraud/page.tsx"
echo "export default function Page() { return <div>Inventory</div> }" > "app/(admin)/inventory/page.tsx"

###############################################
# API ROUTE PLACEHOLDERS
###############################################

echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/paystack/initialize/route.ts"
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/paystack/webhook/route.ts"

echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/monnify/create-account/route.ts"
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/monnify/webhook/route.ts"

echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/orders/lookup/route.ts"
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/refunds/request/route.ts"
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/push/subscribe/route.ts"

###############################################
# LIB PLACEHOLDERS
###############################################

echo "// Prisma client (Prisma 7)" > lib/db.ts
echo "// Auth config" > lib/auth.ts
echo "// Paystack wrapper" > lib/paystack.ts
echo "// Monnify wrapper" > lib/monnify.ts
echo "// Notifications" > lib/notifications.ts
echo "// Inventory logic" > lib/inventory.ts
echo "// Fraud rules" > lib/fraud/rules.ts
echo "// AI fraud model" > lib/fraud/ai.ts
echo "// Fraud score combiner" > lib/fraud/compute.ts

###############################################
# PRISMA 7 SCHEMA TEMPLATE
###############################################

cat << 'EOF' > prisma/schema.prisma
// Prisma 7 schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(cuid())
  email     String   @unique
  phone     String?
  password  String?
  orders    Order[]
  createdAt DateTime @default(now())
}

model Product {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  description String?
  priceCents  Int
  stock       Int      @default(0)
  images      Json
  category    String?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Order {
  id             String      @id @default(cuid())
  userId         String?
  email          String
  phone          String?
  status         OrderStatus @default(PENDING)
  paymentMethod  String
  providerRef    String?
  trackingStatus String      @default("Processing")
  trackingSteps  Json?
  totalCents     Int
  currency       String      @default("NGN")
  createdAt      DateTime    @default(now())
  updatedAt      DateTime    @updatedAt
  items          OrderItem[]
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  productId  String
  quantity   Int
  priceCents Int
}

model RefundRequest {
  id        String   @id @default(cuid())
  orderId   String
  reason    String
  status    String   @default("PENDING")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model FraudSignal {
  id        String   @id @default(cuid())
  orderId   String
  score     Int
  details   Json?
  createdAt DateTime @default(now())
}

model PushSubscription {
  id        String   @id @default(cuid())
  userId    String?
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
}

enum OrderStatus {
  PENDING
  PAID
  FAILED
  REFUNDED
  CANCELLED
}
EOF

echo "🎉 Project structure created successfully — no route conflicts!"