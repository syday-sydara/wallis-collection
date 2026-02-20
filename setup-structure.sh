#!/bin/bash

echo "🚀 Setting up project structure..."

# Create app directories (quoted to allow parentheses)
mkdir -p "app/(public)"
mkdir -p "app/(public)/products"
mkdir -p "app/(public)/cart"
mkdir -p "app/(public)/checkout"
mkdir -p "app/(public)/orders"

mkdir -p "app/(auth)/login"
mkdir -p "app/(auth)/register"

mkdir -p "app/(customer)/account"
mkdir -p "app/(customer)/orders"

mkdir -p "app/(admin)/dashboard"
mkdir -p "app/(admin)/orders"
mkdir -p "app/(admin)/refunds"
mkdir -p "app/(admin)/fraud"
mkdir -p "app/(admin)/inventory"

mkdir -p "app/api/paystack/initialize"
mkdir -p "app/api/paystack/webhook"

mkdir -p "app/api/monnify/create-account"
mkdir -p "app/api/monnify/webhook"

mkdir -p "app/api/orders/lookup"
mkdir -p "app/api/refunds/request"
mkdir -p "app/api/push/subscribe"

# Components
mkdir -p components/ui
mkdir -p components/checkout
mkdir -p components/payments
mkdir -p components/admin

# Lib
mkdir -p lib/fraud

# Create placeholder files
echo "export default function Page() { return <div>Home</div> }" > "app/(public)/page.tsx"
echo "export default function Page() { return <div>Products</div> }" > "app/(public)/products/page.tsx"
echo "export default function Page() { return <div>Cart</div> }" > "app/(public)/cart/page.tsx"
echo "export default function Page() { return <div>Checkout</div> }" > "app/(public)/checkout/page.tsx"
echo "export default function Page() { return <div>Orders</div> }" > "app/(public)/orders/page.tsx"

echo "export default function Page() { return <div>Login</div> }" > "app/(auth)/login/page.tsx"
echo "export default function Page() { return <div>Register</div> }" > "app/(auth)/register/page.tsx"

echo "export default function Page() { return <div>Account</div> }" > "app/(customer)/account/page.tsx"
echo "export default function Page() { return <div>Customer Orders</div> }" > "app/(customer)/orders/page.tsx"

echo "export default function Page() { return <div>Admin Dashboard</div> }" > "app/(admin)/dashboard/page.tsx"
echo "export default function Page() { return <div>Admin Orders</div> }" > "app/(admin)/orders/page.tsx"
echo "export default function Page() { return <div>Refund Center</div> }" > "app/(admin)/refunds/page.tsx"
echo "export default function Page() { return <div>Fraud Center</div> }" > "app/(admin)/fraud/page.tsx"
echo "export default function Page() { return <div>Inventory</div> }" > "app/(admin)/inventory/page.tsx"

# API placeholders
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/paystack/initialize/route.ts"
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/paystack/webhook/route.ts"

echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/monnify/create-account/route.ts"
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/monnify/webhook/route.ts"

echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/orders/lookup/route.ts"
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/refunds/request/route.ts"
echo "export async function POST() { return Response.json({ ok: true }) }" > "app/api/push/subscribe/route.ts"

# Lib placeholders
echo "// Prisma client" > lib/db.ts
echo "// Auth config" > lib/auth.ts
echo "// Paystack SDK wrapper" > lib/paystack.ts
echo "// Monnify API wrapper" > lib/monnify.ts
echo "// Notifications" > lib/notifications.ts
echo "// Inventory logic" > lib/inventory.ts
echo "// Fraud rules" > lib/fraud/rules.ts
echo "// AI fraud model" > lib/fraud/ai.ts
echo "// Fraud score combiner" > lib/fraud/compute.ts

echo "🎉 Project structure created successfully!"