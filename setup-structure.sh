#!/bin/bash

echo "🧹 Cleaning old payment files and placeholders..."

# -----------------------------
# REMOVE OLD PAYMENTS
# -----------------------------
rm -rf "app/api/paystack"
rm -f "lib/paystack.ts"

# Remove Stripe if installed
if pnpm list stripe &> /dev/null; then
  pnpm remove stripe
else
  echo "Stripe not installed, skipping removal..."
fi

# -----------------------------
# REMOVE OLD PLACEHOLDER PAGES
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
  if [ -f "$file" ]; then
    rm "$file"
    echo "Removed $file"
  fi
done

# -----------------------------
# CREATE CLEAN STRUCTURE
# -----------------------------
echo "🚀 Creating African E-commerce Store Structure..."

# Public pages
mkdir -p "app/(public)/products/[slug]"
mkdir -p "app/(public)/cart"
mkdir -p "app/(public)/checkout"
mkdir -p "app/(public)/track-order"

# Auth
mkdir -p "app/(auth)/login"
mkdir -p "app/(auth)/register"

# Customer Dashboard
mkdir -p "app/(customer)/account/orders"

# Admin Dashboard
mkdir -p "app/(admin)/dashboard"
mkdir -p "app/(admin)/orders"
mkdir -p "app/(admin)/products"
mkdir -p "app/(admin)/refunds"
mkdir -p "app/(admin)/fraud"
mkdir -p "app/(admin)/inventory"

# API Routes
API_DIRS=(
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

for route in "${API_DIRS[@]}"; do
  mkdir -p "app/api/$route"
  echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/$route/route.ts"
done

# Components
mkdir -p "components/ui"
mkdir -p "components/checkout"
mkdir -p "components/payments"
mkdir -p "components/admin"
mkdir -p "components/product"

# Lib / Services
mkdir -p "lib/services"
mkdir -p "lib/fraud"
mkdir -p "lib/storage"

# Middleware
touch "middleware.ts"

# -----------------------------
# STYLES / THEME
# -----------------------------
mkdir -p "styles/theme"
mkdir -p "styles/components"

# base.css
cat << 'EOF' > "styles/theme/base.css"
@import "tailwindcss/base";
@import "tailwindcss/components";
@import "tailwindcss/utilities";
@import "tw-animate-css";
@import "shadcn/tailwind.css";

html { @apply font-sans; background-color: var(--color-bg); color: var(--color-primary); }
body { @apply bg-background text-foreground; }
a { text-decoration: none; color: inherit; }
button { cursor: pointer; }
* { @apply border-border outline-ring/50; }
EOF

# variables.css
cat << 'EOF' > "styles/theme/variables.css"
@layer base {
  :root {
    --color-primary: #272B36;
    --color-accent: #a08a81;
    --color-bg: #ffffff;
    --color-neutral: #b7b8bb;
    --color-secondary: #595d66;
    --color-success: #4CAF50;
    --color-warning: #A08A81;
    --color-danger: #C94F4F;
    --font-heading: "Space Grotesk", sans-serif;
    --font-body: "Space Grotesk", sans-serif;
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 24px;
    --shadow-soft: 0 4px 20px rgba(0,0,0,0.04);
    --shadow-card: 0 8px 30px rgba(0,0,0,0.06);
    --ease-smooth: cubic-bezier(0.4,0,0.2,1);
    --duration-400: 400ms;
  }

  .dark {
    --color-bg: #0f1115;
    --color-primary: #ffffff;
    --color-accent: #a08a81;
    --color-secondary: #bbbbbb;
  }
}
EOF

# utilities.css
cat << 'EOF' > "styles/theme/utilities.css"
@layer utilities {
  .heading-display { font-family: var(--font-heading); font-weight:700; font-size:3.5rem; line-height:1.1; letter-spacing:-0.02em; }
  .heading-1 { font-family: var(--font-heading); font-weight:600; font-size:2.5rem; line-height:1.15; }
  .underline-grow { position: relative; }
  .underline-grow::after { content:""; position:absolute; width:0; height:2px; bottom:-2px; left:0; background-color:currentColor; transition:width 0.3s var(--ease-smooth); }
  .underline-grow:hover::after { width:100%; }
}
EOF

# Import into globals.css
touch "styles/globals.css"
echo '@import "./theme/base.css";' >> styles/globals.css
echo '@import "./theme/variables.css";' >> styles/globals.css
echo '@import "./theme/utilities.css";' >> styles/globals.css

# -----------------------------
# PLACEHOLDER PAGES
# -----------------------------
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
echo "export default function Page() { return <div>Admin Products</div> }" > "app/(admin)/products/page.tsx"
echo "export default function Page() { return <div>Refund Center</div> }" > "app/(admin)/refunds/page.tsx"
echo "export default function Page() { return <div>Fraud Center</div> }" > "app/(admin)/fraud/page.tsx"
echo "export default function Page() { return <div>Inventory</div> }" > "app/(admin)/inventory/page.tsx"

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
  mkdir -p "lib/$(dirname $file)"
  touch "lib/$file"
done

# -----------------------------
# PRISMA 7 SCHEMA
# -----------------------------
cat << 'EOF' > prisma/schema.prisma
generator client { provider = "prisma-client-js" }

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User { id String @id @default(cuid()); email String @unique; phone String?; password String?; orders Order[]; addresses Address[]; createdAt DateTime @default(now()) }
model Address { id String @id @default(cuid()); userId String; name String; phone String; city String; state String; address String; user User @relation(fields: [userId], references: [id]) }
model Category { id String @id @default(cuid()); name String; slug String @unique; products Product[] }
model Product { id String @id @default(cuid()); name String; slug String @unique; description String?; priceCents Int; stock Int @default(0); reservedStock Int @default(0); images Json; categoryId String?; category Category? @relation(fields: [categoryId], references: [id]); createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model Order { id String @id @default(cuid()); userId String?; email String; phone String?; status OrderStatus @default(PENDING); paymentMethod String; providerRef String?; trackingStatus String @default("Processing"); trackingSteps Json?; totalCents Int; currency String @default("NGN"); createdAt DateTime @default(now()); updatedAt DateTime @updatedAt; items OrderItem[]; payments Payment[] }
model OrderItem { id String @id @default(cuid()); orderId String; productId String; quantity Int; priceCents Int }
model Payment { id String @id @default(cuid()); orderId String; provider String; reference String; status String; amountCents Int; createdAt DateTime @default(now()) }
model RefundRequest { id String @id @default(cuid()); orderId String; reason String; status String @default("PENDING"); createdAt DateTime @default(now()); updatedAt DateTime @updatedAt }
model FraudSignal { id String @id @default(cuid()); orderId String; score Int; details Json?; createdAt DateTime @default(now()) }
model PushSubscription { id String @id @default(cuid()); userId String?; endpoint String; p256dh String; auth String; createdAt DateTime @default(now()) }

enum OrderStatus { PENDING PAID FAILED REFUNDED CANCELLED }
EOF

echo "✅ Project cleaned and full structure created! Run 'pnpm install' and 'npx prisma db push' next."