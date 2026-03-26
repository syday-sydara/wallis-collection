#!/bin/bash

echo "🌿 Creating Wallis Collection — Fermine Edition (Safe Mode: Skip Existing Files)..."

###############################################
# HELPERS
###############################################

# Create directories only if missing
create_dirs() {
  for dir in "$@"; do
    if [ ! -d "$dir" ]; then
      mkdir -p "$dir"
      echo "📁 Created: $dir"
    else
      echo "⏭️ Skipped (exists): $dir"
    fi
  done
}

# Create placeholder page only if missing
create_placeholder() {
  local path="$2/page.tsx"
  if [ ! -f "$path" ]; then
    echo "export default function Page(){return <div>$1</div>}" > "$path"
    echo "📝 Created page: $path"
  else
    echo "⏭️ Skipped page (exists): $path"
  fi
}

# Create API route only if missing
create_api_route() {
  local path="app/api/$1/route.ts"
  if [ ! -f "$path" ]; then
    mkdir -p "app/api/$1"
    echo "export async function POST(){return Response.json({ ok: true })}" > "$path"
    echo "🔌 Created API route: $path"
  else
    echo "⏭️ Skipped API route (exists): $path"
  fi
}

# Create file only if missing
create_file() {
  local path="$1"
  local content="$2"
  if [ ! -f "$path" ]; then
    echo "$content" > "$path"
    echo "📄 Created file: $path"
  else
    echo "⏭️ Skipped file (exists): $path"
  fi
}

###############################################
# ROUTE GROUPS
###############################################

echo "📁 Setting up App Router structure..."

PUBLIC_ROUTES=(
  "app/(public)"
  "app/(public)/products/[slug]"
  "app/(public)/categories/[slug]"
  "app/(public)/cart"
  "app/(public)/checkout"
  "app/(public)/track-order"
  "app/(public)/search"
)

AUTH_ROUTES=(
  "app/(auth)/login"
  "app/(auth)/register"
)

ACCOUNT_ROUTES=(
  "app/(account)"
  "app/(account)/orders"
  "app/(account)/addresses"
  "app/(account)/settings"
)

ADMIN_ROUTES=(
  "app/(admin)/dashboard"
  "app/(admin)/products"
  "app/(admin)/orders"
  "app/(admin)/customers"
  "app/(admin)/inventory"
  "app/(admin)/coupons"
  "app/(admin)/reviews"
  "app/(admin)/analytics"
  "app/(admin)/fraud"
  "app/(admin)/refunds"
)

create_dirs "${PUBLIC_ROUTES[@]}" "${AUTH_ROUTES[@]}" "${ACCOUNT_ROUTES[@]}" "${ADMIN_ROUTES[@]}"

###############################################
# API ROUTES
###############################################

echo "🔌 Creating API routes..."

API_ROUTES=(
  "auth"
  "products"
  "cart"
  "orders"
  "orders/lookup"
  "paystack/initialize"
  "paystack/webhook"
  "monnify/create-account"
  "monnify/webhook"
  "coupons/validate"
  "reviews/create"
  "refunds/request"
  "push/subscribe"
)

for route in "${API_ROUTES[@]}"; do
  create_api_route "$route"
done

###############################################
# COMPONENTS
###############################################

echo "🧩 Creating component structure..."

COMPONENT_DIRS=(
  "components/ui"
  "components/layout"
  "components/product"
  "components/cart"
  "components/checkout"
  "components/admin"
)

create_dirs "${COMPONENT_DIRS[@]}"

###############################################
# LIBRARIES
###############################################

echo "📚 Creating lib structure..."

LIB_DIRS=(
  "lib/payments"
  "lib/fraud"
  "lib/shipping"
  "lib/cart"
  "lib/analytics"
)

create_dirs "${LIB_DIRS[@]}"

###############################################
# CORE LIB FILES
###############################################

create_file "lib/db.ts" "// Prisma client"
create_file "lib/auth.ts" "// Authentication logic"

create_file "lib/payments/paystack.ts" "// Paystack integration"
create_file "lib/payments/monnify.ts" "// Monnify integration"

create_file "lib/shipping/nigeria.ts" "// Shipping rules (Nigeria states)"

create_file "lib/cart/index.ts" "// Cart helpers"

create_file "lib/fraud/rules.ts" "// Fraud rules engine"
create_file "lib/fraud/ai.ts" "// AI fraud detection"
create_file "lib/fraud/compute.ts" "// Fraud score combiner"

create_file "lib/analytics/events.ts" "// Analytics tracking"

###############################################
# PLACEHOLDER PAGES
###############################################

echo "📝 Creating placeholder pages..."

create_placeholder "Home" "app/(public)"
create_placeholder "Login" "app/(auth)/login"
create_placeholder "Register" "app/(auth)/register"
create_placeholder "Cart" "app/(public)/cart"
create_placeholder "Checkout" "app/(public)/checkout"
create_placeholder "Track Order" "app/(public)/track-order"

###############################################
# PRISMA SCHEMA
###############################################

echo "🗄️ Checking Prisma schema..."

if [ ! -f "prisma/schema.prisma" ]; then
  mkdir -p prisma
  cat << 'EOF' > prisma/schema.prisma
<your existing Prisma schema here — unchanged>
EOF
  echo "🗄️ Created Prisma schema."
else
  echo "⏭️ Skipped Prisma schema (exists): prisma/schema.prisma"
fi

###############################################
# DONE
###############################################

echo "🎉 Fermine‑optimized scaffold created successfully (Safe Mode: No overwrites)!"
