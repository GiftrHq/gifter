
````markdown
You are my **Claude Code CLI agent** working inside my Gifter monorepo.

Your job in this session is to **implement the “Brand Panel & Commerce Backend” as described in `brand-panel-spec.md`**, using:

- **Payload CMS v3** with **Postgres**
- **Payload’s Stripe integration (official Stripe plugin / direct Stripe support)**
- A **Next.js Brand Panel frontend**

Do NOT build a big custom `gifterCommerce` plugin. Instead, use Payload’s Stripe plugin / built-in Stripe integration, plus collection hooks and a couple of small custom endpoints where absolutely necessary (especially around Stripe Connect).

---

## 1. Context

- Gifter core:
  - TypeScript + Prisma + routing-controllers backend (users, taste profiles, recs, etc.).
  - Python AI service (OpenAI) for recommendations, curated collections, question generation.
- New piece we’re building:
  - A **commerce / brand service** with Payload v3 + Postgres + Stripe.
  - A **brand panel** UI for merchants to manage catalog, orders, payouts.

All UX, copy, and data model details are in:  
`brand-panel-spec.md`  
Follow it as the **source of truth** for collections, fields, and screen content.

---

## 2. High-level goals

### Backend (apps/brands – Payload v3)

Implement a Payload v3 service that:

1. Uses **Postgres** as a DB.
2. Uses the **official Stripe plugin / integration** from Payload for:
   - Product → price mapping.
   - Checkout/payment primitives.
   - Webhook patterns.
3. Defines our own collections (per `brand-panel-spec.md`):
   - `users`
   - `brands`
   - `products`
   - `productVariants`
   - `orders`
   - `orderItems`
   - `customers`
   - `payouts` (or `transactions`)
   - `collections` (curated product sets)
   - optionally `brandApplications`
   - A `commerceSettings` global.
4. Handles **multi-tenant marketplace** logic:
   - Each product belongs to a `brand`.
   - Brand users can only manage their own brand/products/orders.
   - Admins can manage everything.
5. Integrates **Stripe Connect** on top of Payload’s Stripe integration:
   - Each `brand` has a `stripeConnectAccountId` and onboarding status.
   - At checkout, we use Connect (destination charges / application fees) where appropriate.

### Frontend (apps/brand-panel – Next.js)

Implement a **Brand Panel** skeleton that:

1. Uses the black & white editorial styling from `brand-panel-spec.md`.
2. Implements these routes as pages with correct layout & copy:
   - `/dashboard`
   - `/catalog`
   - `/catalog/products/new`
   - `/catalog/products/[id]`
   - `/orders`
   - `/orders/[id]`
   - `/customers` (can be minimal v1)
   - `/payouts`
   - `/settings/brand`
3. Talks to the Payload API (for now, mocking data is acceptable while wiring up structure).

---

## 3. Concrete tasks

### 3.1 Read the spec

1. Open `brand-panel-spec.md`.
2. Internalize:
   - UX & copy for each Brand Panel screen.
   - Collections & fields for Payload.
   - Role model: `admin`, `brandOwner`, `brandStaff`, `support`.
   - Stripe Connect flow (brand approval → onboarding → payouts).

Do NOT invent alternative flows where the spec is explicit.

---

### 3.2 Scaffold the Payload v3 service (`apps/brands`)

From the monorepo root, we want an app like:

```text
apps/brands/
  package.json
  tsconfig.json
  .env.example
  src/
    server.ts
    payload.config.ts
    collections/
      users.ts
      brands.ts
      products.ts
      productVariants.ts
      orders.ts
      orderItems.ts
      customers.ts
      payouts.ts
      collections.ts
    globals/
      commerceSettings.ts
    access/
      brands.ts
      products.ts
      orders.ts
      ...
    hooks/
      brands.ts
      orders.ts
      products.ts
      stripe.ts (if useful)
````

Do:

* `npm init -y` in `apps/brands`.
* Install:

  * `payload@latest`
  * `express`
  * `dotenv`
  * `@payloadcms/db-postgres`
  * `typescript`, `ts-node`, `@types/node`, `@types/express`
  * The **official Payload Stripe plugin** (whatever is current – e.g. `@payloadcms/plugin-stripe`).

Configure:

* `payload.config.ts` to:

  * Use `postgresAdapter` with `DATABASE_URL`.
  * Register all commerce collections + `commerceSettings` global.
  * Register the Payload Stripe plugin with sensible defaults.
  * Set `admin.user = 'users'`.

* `server.ts` to:

  * Initialise Payload with Express.
  * Respect env vars: `PORT`, `PAYLOAD_SECRET`, `PAYLOAD_PUBLIC_SERVER_URL`.

Add scripts in `apps/brands/package.json`:

* `"dev"` → `ts-node src/server.ts` (or nodemon)
* `"build"` → `tsc`
* `"start"` → `node dist/server.js`

---

### 3.3 Implement collections & access control

Create and fill:

* `src/collections/users.ts`
* `src/collections/brands.ts`
* `src/collections/products.ts`
* `src/collections/productVariants.ts`
* `src/collections/orders.ts`
* `src/collections/orderItems.ts`
* `src/collections/customers.ts`
* `src/collections/payouts.ts`
* `src/collections/collections.ts`
* `src/globals/commerceSettings.ts`

Each collection should:

* Follow the **field shapes** described in `brand-panel-spec.md` (names, types, relationships).
* Include **admin config** (`useAsTitle`, lists, default columns).
* Implement **access.check functions** so that:

  * Brand users only see their own brand’s data.
  * Admins can see/edit everything.
  * Public access is restricted (Core API will use an internal token, not public exposure).

For now, keep hooks minimal (e.g. just slug generation) and we’ll add more after Stripe is wired.

---

### 3.4 Wire Payload’s Stripe plugin for basic Stripe support

In `payload.config.ts`:

* Import the Stripe plugin from Payload (e.g. `@payloadcms/plugin-stripe`).
* Configure it with:

  * `stripeSecretKey` from env.
  * Any mapping between your `products`/`productVariants` and Stripe `Price` objects if required.

Goals:

* We should be able to model products/prices in Payload and have Stripe-side records created/linked.
* The pattern for using Stripe from inside Payload (e.g. via the plugin’s hooks) should be in place.

We will **extend this later** for Stripe Connect by:

* Adding fields on `brands` for `stripeConnectAccountId`, `stripeOnboardingStatus`.
* In hooks or custom endpoints, using the Stripe client (via plugin) to:

  * Create Connect accounts.
  * Generate onboarding links.
  * Add `transfer_data[destination]` and `application_fee_amount` when creating PaymentIntents / Checkout sessions.

You don’t need to finish the full Connect flow in this pass, but the scaffolding should clearly expect it.

---

### 3.5 Brand Panel Next.js app (`apps/brand-panel`)

Create / configure a Next.js app with TypeScript in `apps/brand-panel`.

Implement:

1. A **global layout**:

   * Left sidebar with:

     * Dashboard
     * Catalog
     * Orders
     * Customers
     * Payouts
     * Settings
   * Top bar with Gifter bow icon + “Gifter for Brands” + brand name + profile menu.
   * Black background, white text, editorial spacing.

2. Pages matching `brand-panel-spec.md` with correct copy:

   * `/dashboard` – greeting, status card, onboarding checklist, KPIs, recent orders.
   * `/catalog` – product list view + “Add product” button.
   * `/catalog/products/new` – multi-section product editor.
   * `/catalog/products/[id]` – same editor with loaded data.
   * `/orders` – orders table with filters.
   * `/orders/[id]` – order detail layout.
   * `/customers` – lightweight customers list.
   * `/payouts` – Stripe onboarding state, payouts log.
   * `/settings/brand` – brand profile fields & story.

You can **stub API calls** with mock data for now; focus on matching layout and copy to the spec so wiring it to Payload later is straightforward.

---

## 4. Style & constraints

* TypeScript everywhere.
* Keep files small and cohesive.
* Follow any existing lint/prettier config in the repo if present.
* When integrating the Stripe plugin:

  * Do not duplicate functionality it already provides.
  * Only add hooks/endpoints where the plugin doesn’t cover multi-vendor / Connect concerns.

---

## 5. How to proceed

1. Start by summarizing your planned changes (files to create/modify).
2. Implement in coherent steps:

   * Scaffold Payload service with Stripe plugin.
   * Add core collections & access control.
   * Scaffold Brand Panel layout & routes.
3. After each step, show a short summary and key file contents/diffs.

Use this document as your working brief. Begin by reading `brand-panel-spec.md`, then set up the `apps/brands` Payload service with Stripe integration, then scaffold the Brand Panel UI.

```
