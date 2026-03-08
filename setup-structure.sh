#!/bin/bash

echo "🧹 Cleaning old payment files and placeholders..."

# -----------------------------
# REMOVE OLD PAYMENTS
# -----------------------------
rm -rf app/api/paystack
rm lib/paystack.ts
rm -rf node_modules/stripe
pnpm remove stripe || true

# -----------------------------
# REMOVE OLD PLACEHOLDER PAGES (public, auth, customer, admin)
# -----------------------------
PLACEHOLDER_DIRS=(
  "app/(public)"
  "app/(auth)"
  "app/(customer)"
  "app/(admin)"
)

for dir in "${PLACEHOLDER_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "Removing $dir placeholders..."
    find "$dir" -type f -name "page.tsx" -delete
  fi
done

# -----------------------------
# REMOVE OLD LIB FILES
# -----------------------------
OLD_LIBS=(
  "lib/paystack.ts"
  "lib/stripe.ts"
)
for file in "${OLD_LIBS[@]}"; do
  [ -f "$file" ] && rm "$file" && echo "Removed $file"
done

# -----------------------------
# CREATE CLEAN STRUCTURE
# -----------------------------

echo "🚀 Creating African E-commerce Store Structure (Next.js 16 + Prisma 7 + Monnify)..."

# Public pages
mkdir -p app/(public)/products/[slug]
mkdir -p app/(public)/cart
mkdir -p app/(public)/checkout
mkdir -p app/(public)/track-order

# Auth
mkdir -p app/(auth)/login
mkdir -p app/(auth)/register

# Customer Dashboard
mkdir -p app/(customer)/account/orders

# Admin Dashboard
mkdir -p app/(admin)/dashboard
mkdir -p app/(admin)/orders
mkdir -p app/(admin)/products
mkdir -p app/(admin)/refunds
mkdir -p app/(admin)/fraud
mkdir -p app/(admin)/inventory

# API
mkdir -p app/api/auth
mkdir -p app/api/products
mkdir -p app/api/cart
mkdir -p app/api/orders
mkdir -p app/api/payments/monnify
mkdir -p app/api/refunds
mkdir -p app/api/uploads
mkdir -p app/api/notifications
mkdir -p app/api/search

# Components
mkdir -p components/ui
mkdir -p components/checkout
mkdir -p components/payments
mkdir -p components/admin
mkdir -p components/product

# Lib / Services
mkdir -p lib/services
mkdir -p lib/fraud

# Middleware
touch middleware.ts

# -----------------------------
# PLACEHOLDER PAGES
# -----------------------------
echo "export default function Page() { return <div>Home</div> }" > app/(public)/page.tsx
echo "export default function Page() { return <div>Products</div> }" > app/(public)/products/page.tsx
echo "export default function Page() { return <div>Product Detail</div> }" > app/(public)/products/[slug]/page.tsx
echo "export default function Page() { return <div>Cart</div> }" > app/(public)/cart/page.tsx
echo "export default function Page() { return <div>Checkout</div> }" > app/(public)/checkout/page.tsx
echo "export default function Page() { return <div>Track Order</div> }" > app/(public)/track-order/page.tsx

echo "export default function Page() { return <div>Login</div> }" > app/(auth)/login/page.tsx
echo "export default function Page() { return <div>Register</div> }" > app/(auth)/register/page.tsx

echo "export default function Page() { return <div>Account</div> }" > app/(customer)/account/page.tsx
echo "export default function Page() { return <div>Customer Orders</div> }" > app/(customer)/account/orders/page.tsx

echo "export default function Page() { return <div>Admin Dashboard</div> }" > app/(admin)/dashboard/page.tsx
echo "export default function Page() { return <div>Admin Orders</div> }" > app/(admin)/orders/page.tsx
echo "export default function Page() { return <div>Admin Products</div> }" > app/(admin)/products/page.tsx
echo "export default function Page() { return <div>Refund Center</div> }" > app/(admin)/refunds/page.tsx
echo "export default function Page() { return <div>Fraud Center</div> }" > app/(admin)/fraud/page.tsx
echo "export default function Page() { return <div>Inventory</div> }" > app/(admin)/inventory/page.tsx

# -----------------------------
# API PLACEHOLDERS
# -----------------------------
API_PLACEHOLDERS=(
  "auth/login"
  "auth/register"
  "products/list"
  "products/[slug]"
  "cart/add"
  "cart/remove"
  "orders/create"
  "orders/lookup"
  "orders/history"
  "payments/monnify/initialize"
  "payments/monnify/webhook"
  "refunds/request"
  "uploads/product-image"
  "notifications/subscribe"
  "search"
)

for route in "${API_PLACEHOLDERS[@]}"; do
  mkdir -p "app/api/$route"
  echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/$route/route.ts"
done

# -----------------------------
# LIB PLACEHOLDERS / SERVICES
# -----------------------------
LIB_FILES=(
  "db.ts"
  "auth.ts"
  "monnify.ts"
  "notifications.ts"
  "inventory.ts"
  "services/order-service.ts"
  "services/payment-service.ts"
  "services/product-service.ts"
  "services/fraud-service.ts"
  "fraud/rules.ts"
  "fraud/ai.ts"
  "fraud/compute.ts"
  "storage.ts"
)

for file in "${LIB_FILES[@]}"; do
  touch "lib/$file"
done

# -----------------------------
# PRISMA 7 SCHEMA
# -----------------------------
cat << 'EOF' > prisma/schema.prisma
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
  addresses Address[]
  createdAt DateTime @default(now())
}

model Address {
  id      String @id @default(cuid())
  userId  String
  name    String
  phone   String
  city    String
  state   String
  address String
  user    User   @relation(fields: [userId], references: [id])
}

model Category {
  id       String    @id @default(cuid())
  name     String
  slug     String    @unique
  products Product[]
}

model Product {
  id           String   @id @default(cuid())
  name         String
  slug         String   @unique
  description  String?
  priceCents   Int
  stock        Int      @default(0)
  reservedStock Int     @default(0)
  images       Json
  categoryId   String?
  category     Category? @relation(fields: [categoryId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
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
  payments       Payment[]
}

model OrderItem {
  id         String   @id @default(cuid())
  orderId    String
  productId  String
  quantity   Int
  priceCents Int
}

model Payment {
  id          String   @id @default(cuid())
  orderId     String
  provider    String
  reference   String
  status      String
  amountCents Int
  createdAt   DateTime @default(now())
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

echo "✅ Project cleaned and new structure created!"
echo "✅ Run 'pnpm install' and 'npx prisma db push' to initialize your database."