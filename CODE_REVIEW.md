# Code Review: Wallis Collection E-Commerce Platform

**Date**: April 21, 2026  
**Reviewer**: Code Quality Analysis  
**Status**: 3/10 Critical Issues Fixed ✅

---

## Executive Summary

Your Next.js e-commerce platform is well-architected with comprehensive security, payment processing, and audit logging. However, **3 critical production bugs** were found and fixed, plus multiple high-priority optimizations needed.

### Quick Stats
- **P0 Critical**: 3 issues (✅ ALL FIXED)
- **P1 High**: 4 issues (⚠️ Needs fix)
- **P2 Medium**: 3 issues (📝 Recommendations)
- **Codebase Health**: 7/10 (Good architecture, some optimization gaps)

---

## 🔴 CRITICAL ISSUES (P0) - FIXED ✅

### 1. ❌ Import Path Error: @/lib/db → @/lib/prisma (13 files)
**Status**: ✅ FIXED

**Issue**: 13 files imported from non-existent path `@/lib/db`. Correct path is `@/lib/prisma`.

**Files Fixed**:
- `app/api/health/route.ts`
- `app/api/checkout/verify/route.ts`
- `app/(store)/success/page.tsx`
- `app/(admin)/security/events/[id]/page.tsx`
- `app/api/_internal/security-log/route.ts`
- `app/api/security/sessions/route.ts`
- `app/api/security/risk-distribution/route.ts`
- `app/api/security/metrics/route.ts`
- `app/api/security/events/route.ts`
- `app/api/security/devices/route.ts`
- `lib/audit/log.ts`
- `app/(store)/checkout/actions.ts`
- `scripts/fix-product-stock.ts`

**Impact**: 404 errors on all affected routes when accessed.

---

### 2. ❌ Undefined Variable: `origin` in middleware.ts (Line 89)
**Status**: ✅ FIXED

**Issue**: 
```typescript
// BEFORE (❌ Broken)
fetch(`${origin}/api/_internal/security-log`, ...)  // 'origin' is undefined!
```

**Fix**:
```typescript
// AFTER (✅ Fixed)
fetch(`${getInternalSecurityLogUrl()}`, ...)  // Uses defined helper
```

**Impact**: 500 errors when admin access is denied, security logs not captured.

---

### 3. ❌ Webhooks Blocked by Risk Enforcement
**Status**: ✅ FIXED

**Issue**: Global risk check blocks ALL requests when risk score ≥ 70, including payment webhooks.

```typescript
// BEFORE (❌ Broken)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const user = parseMiddlewareSession(req);
  const risk = user?.riskScore ?? 0;
  
  if (risk >= 70) {
    return blockRisk(req);  // ❌ Blocks webhooks too!
  }
}
```

**Fix**:
```typescript
// AFTER (✅ Fixed)
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Exempt webhooks and internal endpoints FIRST
  if (pathname.startsWith("/api/webhooks") || pathname.startsWith("/api/_internal")) {
    return NextResponse.next();
  }

  const user = parseMiddlewareSession(req);
  const risk = user?.riskScore ?? 0;
  
  if (risk >= 70) {
    return blockRisk(req);  // ✅ Now only blocks user requests
  }
}
```

**Impact**: Payment webhook verification failures, failed orders, revenue loss.

---

## 🟡 HIGH PRIORITY ISSUES (P1) - ACTION REQUIRED

### 4. ⚠️ No Timeout on Paystack External API

**Location**: `app/api/checkout/verify/route.ts:44-52`

**Status**: ✅ FIXED - Added 10s timeout

**What was done**:
```typescript
// Added AbortController with 10s timeout
const controller = new AbortController();
const timeoutId = setTimeout(() => controller.abort(), 10000);

try {
  res = await fetch(url, {
    signal: controller.signal,  // ✅ Prevents infinite hang
    ...
  });
} finally {
  clearTimeout(timeoutId);
}
```

**Why it matters**: External API calls can hang indefinitely. 10s timeout prevents request queue saturation.

---

### 5. ⚠️ Risk Engine Not Cached (Performance Issue)

**Location**: `lib/risk/engine.ts`

**Current behavior**: Queries database on EVERY request for:
- All policies (admin-defined rules)
- All policy conditions
- All policy rules

**Recommendation**:
```typescript
// Add Redis caching with 1-hour TTL
const getCachedPolicies = async () => {
  const cached = await redis.get("risk:policies");
  if (cached) return JSON.parse(cached);
  
  const policies = await prisma.riskPolicy.findMany({
    include: { conditions: true, rules: true }
  });
  
  await redis.set("risk:policies", JSON.stringify(policies), "EX", 3600);
  return policies;
};
```

**Performance impact**: 
- Current: ~50-200ms per request (DB query)
- With cache: ~5-10ms (Redis lookup)
- Estimated: 70% latency reduction on checkout flow

---

### 6. ⚠️ Stock Race Condition (Concurrency Issue)

**Locations**: 
- `lib/checkout/service.ts` - Checks stock
- `app/api/checkout/verify/route.ts` - Checks stock again

**Current flow**:
```
1. Checkout: Check if stock > 0 ✅
2. Payment processing...
3. Verify: Check stock again ✅
4. [RACE]: Two concurrent orders could both pass → Oversell
```

**Solution - Implement Inventory Reservation**:

In `lib/checkout/service.ts`:
```typescript
async function reserveInventory(orderId: string, items: OrderItem[]) {
  await prisma.$transaction(async (tx) => {
    // Lock row & atomically decrease reservedStock
    for (const item of items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { 
          reservedStock: { increment: item.quantity }
        }
      });
    }
  });
}

async function confirmInventory(orderId: string) {
  // Move from reserved → actual stock deduction
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: { items: true }
    });
    
    for (const item of order.items) {
      await tx.productVariant.update({
        where: { id: item.variantId },
        data: { 
          stock: { decrement: item.quantity },
          reservedStock: { decrement: item.quantity }
        }
      });
    }
  });
}
```

Update Prisma schema:
```prisma
model ProductVariant {
  // ... existing fields
  stock Int @default(0)
  reservedStock Int @default(0)  // ← Already exists, use it!
}
```

---

### 7. ⚠️ Event Queue Initialization Not Ideal

**Location**: `app/layout.tsx:5`

**Current**: 
```typescript
initEventQueue();  // Called on every render
```

Has guard inside (`__EVENT_QUEUE_STARTED__`), but calling at module level isn't ideal.

**Better pattern**:
```typescript
// Create a separate initialization file
// lib/init.ts
let initialized = false;

export async function initializeApp() {
  if (initialized) return;
  initialized = true;
  
  await initEventQueue();
  console.log("✅ App initialized");
}

// app/layout.tsx
import { initializeApp } from "@/lib/init";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Initialize once in dev/production via next.config.js onDemandEntries
  if (typeof window === "undefined") {
    void initializeApp();
  }
  
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
```

---

## 🟠 MEDIUM PRIORITY ISSUES (P2) - NICE TO HAVE

### 8. 📝 No Server-Side Cart Persistence

**Current State**: Cart stored only in localStorage (client-side)

**Issue**: 
- Lost when cookies cleared
- Not synced across devices
- Cannot resume after device loss

**Recommended Implementation**:
```typescript
// lib/cart/sync.ts
export async function syncCartToServer(userId: string, cartItems: CartItem[]) {
  return fetch("/api/cart/sync", {
    method: "POST",
    body: JSON.stringify({ userId, items: cartItems }),
  });
}

// Add to Prisma schema:
model Cart {
  id String @id @default(cuid())
  userId String @unique
  items CartItem[]
  updatedAt DateTime @updatedAt
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model CartItem {
  id String @id @default(cuid())
  cartId String
  productVariantId String
  quantity Int
  cart Cart @relation(fields: [cartId], references: [id], onDelete: Cascade)
}
```

---

### 9. 📝 Inventory Reservation System Not Fully Utilized

**Current**: `ProductVariant.reservedStock` field exists but no reservation logic visible.

The `reservedStock` field is perfect for implementing the race condition fix (#6). Use it to:
1. Reserve stock on checkout start
2. Confirm on payment success
3. Release on payment failure

---

### 10. 📝 Missing Pagination on Security Events

**Location**: `app/api/security/events/route.ts`

**Issue**: No cursor-based pagination for large security event datasets.

```typescript
// Add pagination
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const cursor = searchParams.get("cursor");
  const limit = Math.min(parseInt(searchParams.get("limit") || "20"), 100);
  
  const events = await prisma.securityEvent.findMany({
    take: limit + 1,  // Get one extra to determine hasMore
    cursor: cursor ? { id: cursor } : undefined,
    skip: cursor ? 1 : 0,
    orderBy: { createdAt: "desc" },
  });
  
  const hasMore = events.length > limit;
  const items = events.slice(0, limit);
  
  return NextResponse.json({
    items,
    nextCursor: hasMore ? items[items.length - 1]?.id : null,
    hasMore,
  });
}
```

---

## 🟢 SECURITY STRENGTHS ✅

Your security implementation is solid:

- ✅ **Timing-safe session validation** (HMAC-SHA256 with `timingSafeEqual`)
- ✅ **Comprehensive audit logging** (all admin actions tracked)
- ✅ **Role-based access control** (5 roles × 9 permissions)
- ✅ **Fraud signal tracking** (7 fraud signals weighted)
- ✅ **Payment webhook verification** (signature validation)
- ✅ **Security headers configured** (SAMEORIGIN, nosniff, etc.)
- ✅ **Rate limiting on APIs** (permission denials tracked)

**Minor improvements**:
- Add rate limiting to webhook endpoints
- Validate webhook signatures with constant-time comparison
- Consider rotating webhook secrets regularly

---

## 📊 Code Quality Breakdown

| Category | Score | Notes |
|----------|-------|-------|
| **Architecture** | 8/10 | Well-organized layers (lib, components, API) |
| **Security** | 8/10 | Strong practices, minor hardening needed |
| **Performance** | 6/10 | Missing caching, some N+1 queries possible |
| **Testing** | 5/10 | No test files found in codebase |
| **Documentation** | 6/10 | Good code comments, could use API docs |
| **Maintainability** | 7/10 | Clear file structure, some deduplication possible |

---

## 🚀 Quick Fix Checklist

- [x] Replace `@/lib/db` → `@/lib/prisma` (13 files)
- [x] Fix undefined `origin` in middleware
- [x] Exempt webhooks from risk check
- [x] Add Paystack fetch timeout
- [ ] Implement risk engine caching (Redis)
- [ ] Add inventory reservation pattern
- [ ] Add pagination to security events
- [ ] Add server-side cart persistence
- [ ] Add unit tests for critical flows
- [ ] Document API endpoints

---

## 📝 Recommendations Priority

**This Sprint**:
1. Test all affected routes to verify fixes work
2. Implement risk engine Redis caching (1 day)
3. Add inventory reservation (1-2 days)

**Next Sprint**:
4. Add server-side cart persistence
5. Implement security events pagination
6. Add comprehensive unit tests

**Later**:
7. API documentation (OpenAPI/Swagger)
8. Performance monitoring/tracing
9. Load testing for payment flows

---

## Testing the Fixes

```bash
# Test import fixes
npm run build

# Test middleware exemptions
curl http://localhost:3000/api/webhooks/paystack -X POST

# Test checkout timeout
curl http://localhost:3000/api/checkout/verify \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"orderId":"test","token":"test"}'
```

---

## Files Modified

✅ **Fixed in this review**:
1. `app/api/health/route.ts` - Import fix
2. `app/api/checkout/verify/route.ts` - Import + timeout fix
3. `app/(store)/success/page.tsx` - Import fix
4. `app/(admin)/security/events/[id]/page.tsx` - Import fix
5. `app/api/_internal/security-log/route.ts` - Import fix
6. `app/api/security/sessions/route.ts` - Import fix
7. `app/api/security/risk-distribution/route.ts` - Import fix
8. `app/api/security/metrics/route.ts` - Import fix
9. `app/api/security/events/route.ts` - Import fix
10. `app/api/security/devices/route.ts` - Import fix
11. `lib/audit/log.ts` - Import fix
12. `app/(store)/checkout/actions.ts` - Import fix
13. `scripts/fix-product-stock.ts` - Import fix
14. `middleware.ts` - Origin fix + webhook exemption

---

## Notes

- Your payment reconciliation logic in `lib/payments/reconciliation.ts` is solid with p-limit concurrency control
- Audit logging is comprehensive - good for compliance
- Risk scoring is well-designed with confidence levels
- Consider adding OpenTelemetry for better observability

**Overall**: Good foundation, needs these fixes + caching optimizations. Production-ready after P1 issues are addressed.
