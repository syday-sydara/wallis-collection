# Wallis Collection

Wallis Collection is a modern **mobile-first full-stack e-commerce platform** built with **Next.js 14, Prisma, PostgreSQL, and Paystack**.

It is designed specifically for **emerging markets like Nigeria**, focusing on:

* low-bandwidth performance
* reliable payments
* simple checkout experience
* scalable architecture

---

# Tech Stack

## Frontend

* Next.js 14 (App Router)
* React
* TailwindCSS v4
* Minimal Framer Motion (lightweight interactions only)

## Backend

* Next.js Server Actions
* Route Handlers (for webhooks & external APIs)
* Prisma ORM
* PostgreSQL
* Zod validation

## Authentication

* NextAuth (Credentials Provider)
* Prisma Adapter
* bcrypt password hashing

## Payments

* Paystack (primary)
* Monnify (bank transfers)
* Cash on Delivery (COD)

---

# Architecture

The application follows a **server-first architecture**:

* Server Components for data fetching
* Server Actions for mutations (cart, checkout, refunds)
* Route Handlers only for external services (webhooks)
* Prisma as the single database access layer

This minimizes client-side JavaScript and improves performance on low-end devices.

---

# Mobile-First Design

Wallis Collection is optimized for **Nigerian mobile users**:

* Designed for **3G networks and low-end Android devices**
* Minimal JavaScript shipped to the client
* Optimized images using `next/image`
* Single-column layouts for all critical flows
* Large touch-friendly buttons
* Simple and fast checkout experience

---

# Features

## Customer Features

* Browse products
* View product details
* Add items to cart
* Fast checkout (mobile optimized)
* Pay via Paystack or bank transfer
* Cash on Delivery support
* Track order status
* Request refunds
* Account dashboard

---

## Admin Features

* Admin dashboard
* Order management
* Inventory tracking
* Refund approval system
* Fraud monitoring (rule-based)

---

## Payments

The platform integrates:

* Paystack (card, bank, USSD)
* Monnify (bank transfers)

### Key Capabilities

* Secure payment verification via webhooks
* Idempotent transaction handling (prevents duplicate charges)
* Automatic order status updates
* Support for COD orders

---

## Fraud Detection

A lightweight **rule-based fraud system** is implemented:

* High-value order detection
* Suspicious email patterns
* Missing user data signals

Flagged orders can be reviewed manually.

---

# Project Structure

```
app/
 ├ (public)
 │   ├ products/
 │   ├ categories/
 │   ├ cart/
 │   ├ checkout/
 │   └ track-order/
 │
 ├ (auth)
 │   ├ login/
 │   └ register/
 │
 ├ (customer)
 │   └ account/
 │       └ orders/
 │
 ├ (admin)
 │   ├ dashboard/
 │   ├ orders/
 │   ├ refunds/
 │   ├ fraud/
 │   ├ inventory/
 │   └ _components/
 │
 └ api/
     ├ paystack/webhook/
     ├ monnify/webhook/
     └ orders/lookup/

components/
 ├ ui/
 ├ shared/
 ├ product/
 └ cart/

lib/
 ├ auth.ts
 ├ db.ts
 ├ env.ts
 ├ utils.ts
 ├ payments/
 │   └ index.ts
 ├ shipping/
 ├ inventory.ts
 └ fraud/
     └ index.ts

prisma/
 ├ schema.prisma
 └ seed.ts
```

---

# API Endpoints

Only essential endpoints are exposed:

## Webhooks

```
POST /api/paystack/webhook
POST /api/monnify/webhook
```

## Orders

```
POST /api/orders/lookup
```

---

# Server Actions

Used for:

* Cart management
* Checkout
* Refund requests
* User interactions

This replaces most traditional API routes.

---

# Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/your-username/wallis-collection.git
cd wallis-collection
```

---

## 2. Install dependencies

```bash
pnpm install
```

---

## 3. Configure environment variables

Create a `.env` file:

```
DATABASE_URL="postgresql://user:password@localhost:5432/wallis"
NEXTAUTH_SECRET=your_secret
PAYSTACK_SECRET_KEY=your_key
MONNIFY_SECRET_KEY=your_key
```

---

## 4. Run Prisma migrations

```bash
npx prisma migrate dev
```

---

## 5. Seed the database

```bash
npx prisma db seed
```

---

## 6. Start development server

```bash
pnpm dev
```

App runs on:

```
http://localhost:3000
```

---

#
