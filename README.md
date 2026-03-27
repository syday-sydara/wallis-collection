# 🛍️ Wallis Collection  
A premium, mobile‑first Nigerian fashion storefront built with a modern, secure, server‑first architecture.

## 🚀 Tech Stack

- **Next.js 16** (App Router, Server Components, Streaming, Server Actions)
- **React 18**
- **Tailwind CSS v4** (CSS variables, design tokens)
- **Prisma ORM** (PostgreSQL)
- **pnpm** (workspace‑friendly package manager)
- **Zod** (validation)
- **Paystack / Monnify** (payments)
- **Nodemailer** (email)
- **TypeScript** (strict mode)

---

# 🧱 Architecture Overview

Wallis Collection uses a **server‑first, security‑hardened architecture**:

- All sensitive logic runs on the **server**
- No hidden IDs or client‑trusted fields
- Strict RBAC + feature flags
- Suspense streaming for fast UX
- Strict data exposure (allow‑listed Prisma selects)
- On‑demand revalidation for real‑time product updates
- Tailwind v4 tokens for consistent branding
- Optimized images with `next/image`

---

# 📁 Folder Structure
```
app/
(store)/
products/
product/[slug]/
checkout/
success/
verify/
security-center/
panels/
api/
checkout/
revalidate/
auth/
login/
logout/
security/
events/
sessions/
devices/
layout.tsx
globals.css

components/
ui/
skeletons/
security/

lib/
auth/
security/
mappers/
format/
api/
db.ts
rate-limit.ts
utils.ts

prisma/
schema.prisma
migrations/

public/
og/
images/

scripts/
setup.ts

```

---

# 🔐 Security Model

### ✔ Server‑only session resolution  
`getSessionUser()` reads encrypted cookies and resolves the user **without trusting the client**.

### ✔ RBAC + Feature Flags  
`hasPermission(user, "VIEW_SECURITY_CENTER")`  
Roles can evolve without rewriting conditionals.

### ✔ No hidden IDs  
All server actions derive userId from the session.

### ✔ Risk Engine Isolation  
All risk logic lives in `lib/security/risk.ts` and is never exposed to the client.

### ✔ Middleware Protection  
Routes like `/security-center` are protected at the edge.

---

# 🛡️ Security Center

The Security Center is a streaming, server‑rendered dashboard with:

- Recent Alerts  
- Risk Score  
- Active Sessions  
- Trusted Devices  

Each panel is a **server component** wrapped in `<Suspense>` for instant shell rendering.

ARIA live regions announce real‑time security events for accessibility.

---

# 💳 Checkout System

The checkout flow is:

1. Validate cart + customer info  
2. Prisma transaction  
3. Stock validation  
4. Inventory movement logging  
5. Payment initialization (Paystack/Monnify)  
6. Return `paymentUrl` + `orderId`  

No client‑side trust.  
No hidden IDs.  
No duplicate orders.

---

# 🛒 Product Catalog Loader

- Strict Prisma selects  
- Rate limiting  
- On‑demand revalidation (`revalidateTag("products")`)  
- Suspense streaming  
- Tailwind v4 skeletons  
- `next/image` optimization  

---

# 🧪 Development

### Install dependencies
```sh
pnpm install
Run dev server
pnpm dev
pnpm prisma:generate
pnpm prisma:migrate
pnpm build
```

🧭 Roadmap
Admin dashboard

Product management

Inventory analytics

Customer accounts

Order tracking

Webhooks (Paystack/Monnify)

Device fingerprinting for risk scoring

🏁 License
Private — All rights reserved.

