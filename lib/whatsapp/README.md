# 📦 WhatsApp Module — Architecture & Developer Guide

This folder contains the complete WhatsApp messaging subsystem for the Wallis Collection platform.  
It is designed to be:

- Clean and modular  
- Easy to extend  
- Production‑ready  
- Nigeria‑first (₦, +234 formatting, NGN defaults)

The system handles:

- Sending WhatsApp messages (text, buttons, lists, media, templates)
- Onboarding flows
- Order tracking flows
- Conversation state management
- Abuse/rate‑limit protection
- Logging & observability
- Queue‑based message delivery

---

## 🧱 Architecture Overview

The WhatsApp module is organized into **7 layers**, each with a single responsibility.


---

## 1️⃣ Transport Layer

### `transport.ts`
Low‑level HTTP wrapper around the WhatsApp Cloud API.

Responsibilities:
- Sending POST requests to Meta
- Timeout handling
- Retry logic
- Circuit breaker protection

This is the only file that communicates directly with WhatsApp’s API.

---

## 2️⃣ Gateway Layer

### `gateway.ts`
Middleware between the app and WhatsApp.

Responsibilities:
- Logging (success/failure)
- Metrics
- Security events
- Writing to `WhatsAppMessageLog` in the database
- Normalizing phone numbers
- Tagging messages for observability

All message sends pass through this layer.

---

## 3️⃣ Client Layer

### `client.ts`
High‑level API for sending WhatsApp messages.

Example:

```ts
new WhatsAppClient("+2348012345678").text("Hello!");

## 4️⃣ Message Builders
### `
- text.ts
- buttons.ts
- list.ts
- media.ts
- template.ts
- index.ts
These generate valid WhatsApp message payloads.
They contain no business logic — only formatting
```ts
.

## 5️⃣ Business Logic (Onboarding)
### `
onboarding/
- buttons.ts — main menu
- phone.ts — phone number selection
- orders.ts — order selection
- track.ts — tracking link delivery

These implement the user onboarding and order‑tracking flows.
```ts

## 6️⃣ Conversation Engine
### ` router.ts
- Central handler for all WhatsApp interactions.
- Responsibilities:
    - Routing button replies
    - Routing list replies
    - State‑based flow control
    - Fallback handling
    - Abuse detection integration
```ts

### ` state-types.ts
- TypeScript union of all valid states.
- Example:
   export type WhatsAppState =
  | "IDLE"
  | "PHONE_SELECTION"
  | "ORDER_SELECTION"
  | "TRACKING";
```ts

### ` abuse.ts
Rate‑limit and suspicious‑behavior detection.
```

## 7️⃣ Infrastructure

### ` queue.ts

- Simple in‑memory job queue for WhatsApp messages.

- Responsibilities:

  - Queueing messages

  - Sequential processing

  - Delegating to WhatsAppClient

```ts

### ` Data Models (Prisma)

The WhatsApp system uses two models:

- WhatsAppSession
    Stores conversation state.

- WhatsAppMessageLog
    Stores message send history.
    Both are required for reliability and observability.
```ts

### ` 🔄 Message Flow Diagram
WhatsApp Webhook
      ↓
  router.ts
      ↓
 state.ts (read)
      ↓
 onboarding/* or business logic
      ↓
 WhatsAppClient
      ↓
 gateway.ts
      ↓
 transport.ts → WhatsApp Cloud API
      ↓
 WhatsAppMessageLog (DB)
```

###  🧪 Testing Strategy

`text

- Unit test message builders (pure functions)

- Integration test client.ts with mocked transport

- E2E test onboarding flows via router.ts

- Load test transport layer with circuit breaker enabled

```

###🛠 Adding New Features

- Add a new message type
- Create a builder in messages/

- Add a method in client.ts

Add a case in queue.ts (optional)

Add a new onboarding step
Add a file in onboarding/

Add a state in state-types.ts

Update router.ts to route to it

Add a new business flow