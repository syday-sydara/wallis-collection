# Wallis Collection

Wallis Collection is a modern **full-stack e-commerce platform** built with **Next.js, Prisma, PostgreSQL, and Paystack**.
It supports product management, checkout, fraud monitoring, order tracking, refunds, and an admin dashboard.

This project is designed with **scalability, security, and modular architecture** in mind.

---

# Tech Stack

## Frontend

* Next.js (App Router)
* React
* TailwindCSS
* Framer Motion
* SWR

## Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL
* Zod validation

## Authentication

* NextAuth
* Prisma Adapter
* bcrypt password hashing

## Payments

* Paystack
* Monnify

## Additional Features

* Fraud detection system
* Push notifications
* Inventory management
* Refund workflow
* Order tracking system

---

# Project Structure

```
app/
 ├ (public)
 │   ├ products/
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
 │   └ inventory/
 │
 └ api/
     ├ paystack/
     ├ monnify/
     ├ orders/
     ├ refunds/
     └ push/

components/
 ├ ui/
 ├ checkout/
 ├ payments/
 └ admin/

lib/
 ├ auth.ts
 ├ db.ts
 ├ paystack.ts
 ├ monnify.ts
 ├ notifications.ts
 ├ inventory.ts
 └ fraud/
     ├ rules.ts
     ├ ai.ts
     └ compute.ts

prisma/
 ├ schema.prisma
 └ seed.ts
```

---

# Features

## Customer Features

* Browse products
* View product details
* Add items to cart
* Secure checkout
* Pay via Paystack
* Track order status
* Request refunds
* Account dashboard

---

## Admin Features

* Admin dashboard
* Order management
* Inventory tracking
* Fraud monitoring
* Refund approval system

---

## Fraud Detection

The platform includes a modular fraud detection system:

```
lib/fraud
 ├ rules.ts
 ├ ai.ts
 └ compute.ts
```

Fraud scores are calculated using:

* rule-based detection
* behavioral signals
* AI scoring

Orders can be flagged for manual review.

---

# Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/your-username/wallis-collection.git
cd wallis-collection
```

---

## 2. Install dependencies

Using **pnpm**

```bash
pnpm install
```

---

## 3. Configure environment variables

Create a `.env` file.

Example:

```
DATABASE_URL="postgresql://user:password@localhost:5432/wallis"
NEXTAUTH_SECRET=your_secret
PAYSTACK_SECRET_KEY=your_key
MONNIFY_SECRET_KEY=your_key
```

---

## 4. Run Prisma migrations

```
npx prisma migrate dev
```

---

## 5. Seed the database

```
npx prisma db seed
```

---

## 6. Start the development server

```
pnpm dev
```

The application will run at:

```
http://localhost:3000
```

---

# Database

The project uses **PostgreSQL with Prisma ORM**.

Main models include:

* User
* Product
* Order
* OrderItem
* RefundRequest
* FraudSignal
* PushSubscription

---

# API Endpoints

## Payments

```
POST /api/paystack/initialize
POST /api/paystack/webhook
```

## Monnify

```
POST /api/monnify/create-account
POST /api/monnify/webhook
```

## Orders

```
POST /api/orders/lookup
```

## Refunds

```
POST /api/refunds/request
```

## Push Notifications

```
POST /api/push/subscribe
```

---

# Scripts

```
pnpm dev             # start development server
pnpm build           # build project
pnpm start           # start production server
pnpm lint            # run eslint
pnpm typecheck       # run TypeScript checks
pnpm prisma:migrate  # run database migrations
pnpm prisma:studio   # open Prisma Studio
```

---

# Security

* Password hashing with bcrypt
* Secure payment verification
* Fraud scoring
* Protected admin routes
* Server-side validation using Zod

---

# Deployment

Recommended platforms:

* Vercel
* Railway
* Render
* DigitalOcean

Make sure environment variables are configured in your hosting platform.

---

# Future Improvements

* AI fraud model
* Email notifications
* SMS order updates
* Product reviews
* Multi-currency support
* Multi-vendor marketplace support

---

# License

MIT License
