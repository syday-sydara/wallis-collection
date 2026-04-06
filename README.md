# 🛍️ Wallis Collection  
A premium, mobile‑first Nigerian fashion storefront built on a secure, server‑first architecture.

Wallis Collection delivers a modern commerce experience powered by a hardened backend, real‑time product updates, and a fully server‑driven checkout pipeline. Every layer — from authentication to payments to inventory — is designed for correctness, resilience, and operational clarity.

---

# 🚀 Tech Stack

### **Frontend & Framework**
- **Next.js 16** — App Router, Server Components, Streaming, Server Actions  
- **React 18** — concurrent rendering  
- **Tailwind CSS v4** — design tokens, CSS variables, responsive primitives  

### **Backend & Infrastructure**
- **Prisma ORM** — PostgreSQL with strict schema enforcement  
- **Server‑only business logic** — no client‑trusted fields  
- **Zod** — schema validation across API boundaries  
- **Nodemailer** — transactional email pipeline  

### **Payments**
- **Paystack** — card & transfer payments  
- **Monnify** — enterprise‑grade bank transfer flows  
- Webhook‑driven reconciliation + fraud scoring  

### **Tooling**
- **pnpm** — workspace‑optimized package manager  
- **TypeScript (strict mode)** — end‑to‑end type safety  

---

# 🧱 Architecture Overview

Wallis Collection is built on a **server‑first, security‑centric architecture** designed for correctness and operational safety.

## Core Principles
- **Zero client trust** — all sensitive logic runs exclusively on the server  
- **Deterministic state transitions** — no ambiguous order/payment states  
- **Strict RBAC** — role‑based access with feature‑flag expansion  
- **Minimal data exposure** — allow‑listed Prisma selects only  
- **Real‑time freshness** — on‑demand revalidation for product updates  
- **Streaming UX** — instant shell rendering with Suspense  

## High‑Level Architecture Diagram
Client (RSC) ↓ Next.js Server Actions → Prisma ORM → PostgreSQL ↓ Payment Providers (Paystack / Monnify) ↓ Risk Engine → Security Center

---

# 📁 Folder Structure
app/ (store)/ products/ product/[slug]/ checkout/ success/ verify/ security-center/ panels/ api/ checkout/ revalidate/ auth/ login/ logout/ security/ events/ sessions/ devices/ layout.tsx globals.css
components/ ui/ skeletons/ security/
lib/ auth/ security/ mappers/ format/ api/ db.ts rate-limit.ts utils.ts
prisma/ schema.prisma migrations/
public/ og/ images/
scripts/ setup.ts


---

# 🔐 Security Model

Security is a first‑class concern, not an afterthought.

### ✔ Server‑only session resolution  
`getSessionUser()` resolves identity from encrypted cookies — never trusting client input.

### ✔ RBAC + Feature Flags  
Fine‑grained permissions with evolvable role definitions.

### ✔ Zero hidden IDs  
All server actions derive `userId` from the session, not the client.

### ✔ Risk Engine Isolation  
Fraud scoring and device fingerprinting live in isolated server modules.

### ✔ Middleware Enforcement  
High‑risk routes (e.g., `/security-center`) are protected at the edge.

---

# 🛡️ Security Center

A real‑time, server‑rendered dashboard providing:

- Recent security alerts  
- User risk score  
- Active sessions  
- Trusted devices  

Each panel is a **Server Component** wrapped in `<Suspense>` for instant shell rendering.  
ARIA live regions announce security events for accessibility.

---

# 💳 Checkout System

A fully server‑driven, race‑condition‑safe checkout pipeline:

1. Validate cart + customer details  
2. Atomic Prisma transaction  
3. Stock validation + reservation  
4. Inventory movement logging  
5. Payment initialization (Paystack / Monnify)  
6. Return `paymentUrl` + `orderId`  

### Guarantees
- No duplicate orders  
- No client‑trusted fields  
- No inconsistent inventory states  
- Idempotent payment verification  

---

# 🛒 Product Catalog Loader

- Strict Prisma selects  
- Rate‑limited API access  
- On‑demand revalidation (`revalidateTag("products")`)  
- Suspense streaming for instant UX  
- Tailwind v4 skeletons  
- `next/image` optimization  

---

# 🧪 Development

```sh
pnpm install
pnpm dev
pnpm prisma:generate
pnpm prisma:migrate
pnpm build

Roadmap
- Admin dashboard
- Product management
- Inventory analytics
- Customer accounts
- Order tracking
- Webhooks (Paystack / Monnify)
- Device fingerprinting for risk scoring

🏁 License
Private — All rights reserved.
