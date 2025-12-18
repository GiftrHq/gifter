```markdown
# Gifter – Brand Panel & Commerce Backend Spec  
*(Brand-panel copy, layout, UX, animations + Payload CMS v3 + ecommerce data model)*

This file defines **everything needed** to build the **Brand Panel** UI and the underlying **Payload v3 + ecommerce** backend for a production-ready marketplace:

- Brand-panel screens, layout, copy, interactions, and motion (for **brands** and **admins**).
- Payload CMS v3 collections, fields, relationships, access patterns, and Stripe Connect integration.
- Designed to plug cleanly into your **Core Gifter API (Prisma/TS)** and **Python AI services**.

Brand voice: **Gifter**, the calm, luxury, AI gifting concierge, speaking directly to brands (“I”).

Color: **black & white only**, editorial, minimal.

---

## 1. Brand Panel – Global UX & Styling

### 1.1 Tech (context, not implementation)

- Frontend: **Next.js / React** app (e.g. `apps/brand-panel`).
- Backend for panel data: **Payload v3** (Commerce service).
- Auth: Payload auth or JWT-based sessions; brand role & brand relations in `users` collection.

### 1.2 Visual System

**Colors**

- `PanelBlack`: `#000000` (primary background)
- `PanelOffBlack`: `#050505`–`#101010` (cards and app chrome)
- `PanelWhite`: `#FFFFFF` (primary text & high-importance surfaces)
- `PanelGray`: `#8A8A8A` (secondary text)
- `PanelSoftGray`: `#161616` (borders, inputs, dividers)
- No accent colors; color appears only via product photography (when used).

**Typography**

- Headings: same Playfair Display editorial/fashion serif/sans as marketing site.
- Body: clean sans  Inter (e.g. Inter / SF).
- Microcopy / labels: uppercase, slight tracking.

**Core Components**

- **Top-bar**  
  - Left: Gifter bow icon + “Gifter for Brands”.
  - Right: current brand name (for brand user) or “Gifter Admin” (for admin), profile menu.

- **Sidebar (for brand users)**  
  - Items:
    - Dashboard
    - Catalog
    - Orders
    - Customers (optional, read-only)
    - Payouts
    - Settings

- **Primary Button**  
  - White background, black text, radius 8–12.
  - Hover: scale 1.02, subtle shadow.
  - Disabled: reduced opacity, no shadow.

- **Secondary Button**  
  - Transparent, 1px white border, white text.
  - Hover: border brightens, text opacity 100%.

- **Card**  
  - Background: `PanelOffBlack`.
  - Border: 1px `PanelSoftGray`.
  - Radius: 16.
  - Hover (for clickable cards): slight lift + border becomes brighter.

**Motion**

- Section-level fade-up on scroll (like website).
- Cards: fade + slide in with 50–80ms stagger.
- Button press: 0.15–0.2s scale down/up, no bounce.
- Use only subtle easing; everything should feel **calm and precise**.

---

## 2. Brand Panel – Screens & Copy

### 2.1 Brand Dashboard (Brand User)

**Route:** `/dashboard`

**Purpose:**  
Give brands a calm, high-level overview: status, essentials, and “what to do next”.

**Layout**

- Two-column grid:
  - Left:
    - Welcome strip
    - Onboarding checklist (if incomplete)
  - Right:
    - Key metrics summary
    - Activity glimpses

**Copy & Elements**

1. **Welcome strip**

   - Title:  
     > **Hello, [Brand Name].**

   - Subtext:  
     > I’ve pulled together your latest gifting activity.

2. **Status / Onboarding checklist**

   Card title:  
   > **Your status**

   - If brand.status = `pending`:
     - Badge: “Pending review”
     - Text:  
       > I’m reviewing your application. You’ll hear from me soon.
   - If `approved` but Stripe incomplete:
     - Badge: “Action needed”
     - Text:  
       > You’re approved. Next we just need your payout details.
     - Button: **Complete payout setup**

   - Checklist items (with subtle progress indicators):
     - “Brand profile set up”
     - “First products added”
     - “Payouts configured”

3. **Key metrics card**

   Title:  
   > **At a glance**

   Metrics (for last 30 days):

   - Orders
   - Revenue (platform currency)
   - Conversion (visits → orders, if available later)
   - Top product (by orders)

   Footer microcopy:  
   > I’ll keep this simple. If something spikes or dips, I’ll let you know.

4. **Recent orders glance**

   Table snippet (last 4 orders):

   - Date
   - Order # / Buyer (initials)
   - Total
   - Status pill (Paid/Fulfilled/Refunded)

   Link: **View all orders →** (to `/orders`)

**Interactions / Animations**

- On page load:
  - Greeting → status card → metrics → recent orders fade in sequence.
- Status pill change (e.g., when Stripe setup completes) triggers a subtle glow animation on status card border.

---

### 2.2 Catalog – Product List

**Route:** `/catalog` → `ProductsView`

**Purpose:**  
Full list of products & variants for the brand.

**Layout**

- Header row:
  - Title: **Catalog**
  - Secondary: “Products that appear inside Gifter.”
  - Right: Primary button **Add product**.

- Filters toolbar:
  - Search by product name/SKU.
  - Status dropdown: All / Draft / Published / Archived.
  - Category filter (optional).

- Table or card grid (depending on screen size):

  Columns:
  - Thumbnail
  - Product name
  - Status
  - Price range (across variants)
  - Stock summary
  - Last updated

**Copy snippet under title:**

> This is what I can recommend to gifters. The clearer the details, the better I can match them.

**Interactions**

- Row click → `ProductEditView(productId)`.
- Hover row: slight highlight + “Edit” icon appears at end.
- Bulk actions (future): multi-select checkboxes for publish/unpublish/archive.

---

### 2.3 Product Editor

**Route:** `/catalog/products/new` and `/catalog/products/[id]`

**Sections**

1. **Header**

   - Left: “New product” or product name.
   - Right: status pill (Draft/Published), buttons:
     - Save
     - Publish / Unpublish

2. **Tabs or stacked sections**

   - Basics
   - Media
   - Variants & Pricing
   - Gift context (tags for AI)
   - Visibility & Status

**Copy & Fields**

1. **Basics**

   - Product name (text)
   - Handle / slug (auto-generated from name)
   - Short description
   - Detailed description (rich text)

   Helper text:

   > Short description appears first. Think of it as how I introduce the product in a sentence.

2. **Media**

   - Main image uploader (drag & drop, reorderable).
   - At least one image required before publish.

   Microcopy:

   > Clear, editorial photography helps me present you well inside Gifter.

3. **Variants & Pricing**

   - Variant strategy:
     - Option set (e.g., Size, Color).
     - For each combination: SKU, price, stock, optional barcode.

   Microcopy:

   > If you don’t use variants, you’ll still see one default variant that holds price and stock.

4. **Gift context (AI)**

   Fields:

   - Gift tags (multi-select or free-form chips):
     - “For the ritualist”, “For the host”, “Under £50”, etc.
   - Occasion fit (checkboxes):
     - Birthday, Anniversary, Housewarming, Thank you, Just because.
   - Style tags (multi-select):
     - Minimal, Bold, Cozy, Luxurious, Playful, etc.

   Microcopy:

   > These help me understand *who* this is for. I use them when lining up recommendations.

   Future: “Suggest tags for me” button that calls AI.

5. **Visibility & Status**

   - Product status:
     - Draft / Published / Archived.
   - “Is featured” (for curated collections, optional).
   - “Available to Gifter users?” toggle.

**Interactions / UX details**

- Auto-save indicator (“Saved · 3 seconds ago”) at top.
- Unsaved changes warning if they try to navigate away.
- Publishing:

  - On click “Publish”:  
    - Validate required fields (name, price, image, brand approved, Stripe ready).
    - Show inline errors with red underlines and small, calm copy:  
      > “I need at least one image before I can show this to gifters.”

---

### 2.4 Orders List

**Route:** `/orders`

**Layout**

- Header:
  - Title: **Orders**
  - Sub: “Everything that’s been bought from you through Gifter.”

- Filter bar:
  - Date range.
  - Status (Pending, Paid, Fulfilled, Refunded).
  - Search (order #, buyer email).

- Table columns:

  - Order #
  - Date
  - Buyer (initials/email)
  - Items count
  - Total
  - Status pill

**Interactions**

- Row click → `OrderDetailView(orderId)`.
- Status pill colors within grayscale:
  - Pending: light gray.
  - Paid: white border.
  - Fulfilled: white fill.
  - Refunded: gray with stroke.

---

### 2.5 Order Detail

**Route:** `/orders/[id]`

**Layout**

Two column layout (desktop):

- Left: order info and line items.
- Right: payment & fulfilment panel.

**Left:**

- Order number & date.
- Buyer contact (email).
- Shipping address block.
- Line items table:
  - Product name, variant, quantity, unit price, subtotal.

**Right:**

- Payment status:
  - “Paid via Gifter” + amount + currency.
  - Stripe PaymentIntent ID (masked).
- Fulfilment status:
  - Dropdown: Pending / In progress / Fulfilled / Cancelled.
  - Date/time when changed.

- Actions (for brand user):

  - **Mark as fulfilled** → sets status & time.
  - **Request refund** (or “Contact support to refund” if you keep refund control centralised).

**Copy examples:**

- Payment card:

  > This order has been paid. Funds will go to your Stripe account according to the usual payout schedule.

- Fulfilment note:

  > Once you mark this as fulfilled, I’ll update the customer and their gifting history.

---

### 2.6 Customers (Optional v1, lightweight)

**Route:** `/customers`

List of buyers who have ordered from this brand:

- Buyer initials / avatar.
- Email.
- Orders count.
- Last order date.

This is primarily informational; no marketing campaigns from here (at least in v1).

---

### 2.7 Payouts & Stripe

**Route:** `/payouts`

**Layout**

- Top card: Stripe onboarding status.

Copy states:

- If not started:

  > **Set up payouts**  
  > I’ll need a few details so Stripe can send funds to you. This only takes a few minutes.

  Button: **Start Stripe setup**

- If in progress:

  > **Finish your payout setup**  
  > You started setting things up with Stripe. When you’re ready, you can pick up where you left off.

  Button: **Resume setup**

- If complete:

  > **Payouts are ready**  
  > You’re all set. Future orders will be paid out to your Stripe account.

Below: Payout log (optional in v1):

- Date
- Amount
- Type: “Order payout”, “Refund”, “Adjustment”
- Stripe transfer ID (masked)

---

### 2.8 Settings – Brand Profile

**Route:** `/settings/brand`

Sections:

1. **Public brand profile**
   - Logo upload (square, monochrome recommended).
   - Brand name.
   - Short tagline.
   - Long “About” text.

   Copy:

   > This is how I introduce you to gifters the first time they meet you.

2. **Story / Positioning**

   Fields:

   - “Who are you for?” (giftFit).
   - Style / vibe tags (minimal, cozy, etc.).

   Copy:

   > Think in human terms: “for the design-obsessed friend”, “for the home ritualist”.

3. **Business details**

   - Country, base currency.
   - Website URL.
   - Instagram handle etc.

**Admin-only fields are hidden here** (status, internal notes).

---

### 2.9 Admin Views (High-level, inside Payload or custom `/admin`)

While brand users get the custom panel, internal admins can either:

- Use **Payload default admin** (recommended), OR
- Use a thin custom `/admin` overlay with:

  - Brand applications list (`status = pending`).
  - Brand detail view with approve/reject.
  - Global search across brands/products/orders.

Admin copy is more operational, less branded. Example on brand detail:

> “Approving this brand will invite them to complete Stripe setup and start adding products.”

---

## 3. Payload CMS v3 + Ecommerce – Collections & Structure

### 3.1 High-level Backend Role

This Payload instance is the **Commerce/Brand service**, owning:

- Brands & brand users
- Products & variants
- Orders & line items
- Customers
- Stripe Connect accounts & payout logs
- Optionally: curated collections

Your **Core Gifter API** (TS/Prisma) consumes this data via:

- REST/GraphQL calls.
- Webhooks (e.g. product updates → AI ingestion, order paid → gifting history updates).

---

### 3.2 Collections Overview

Collections (Payload):

1. `users`
2. `brands`
3. `products`
4. `productVariants`
5. `orders`
6. `orderItems`
7. `customers`
8. `payouts` (or `transactions`)
9. `collections` (curated product groupings; optional but useful)
10. `brandApplications` (optional, if you want a separate application step)

Globals:

- `commerceSettings` (platform fee %, supported currencies, etc.)

Below: suggested structures.

---

### 3.3 `users` Collection

**Purpose:**  
Brand panel users + internal admins.

**Key fields:**

- `email` (unique)
- `password`
- `role` (select):
  - `admin`
  - `brandOwner`
  - `brandStaff`
  - `support`
- `brand` (relationship to `brands`, required for `brandOwner` / `brandStaff`)

**Access:**

- `admin`: full CRUD.
- `brandOwner`/`brandStaff`:
  - Can read/update their own user record.
  - Cannot read other brands’ users.
- Used for panel auth.

---

### 3.4 `brands` Collection

**Purpose:**  
Each merchant / store onboarded into Gifter.

**Fields (grouped)**

1. **Core identity**

   - `name` (text)
   - `slug` (text, unique)
   - `logo` (upload)
   - `coverImage` (upload, optional)
   - `shortDescription` (textarea)
   - `longDescription` (rich text)

2. **Story / gift positioning**

   - `giftFit` (text):
     - e.g., “For the design-obsessed homebody.”
   - `styleTags` (array of text or select):
     - Minimal, Cozy, Playful, etc.
   - `categories` (optional relationship to category collection if you add one).

3. **Business details**

   - `country` (text or select)
   - `baseCurrency` (select: EUR, GBP, USD, etc.)
   - `websiteUrl` (text)
   - `instagramHandle` (text)
   - `otherSocials` (array of { platform, url })

4. **Status & admin controls**

   - `status` (select):
     - `pending`
     - `approved`
     - `rejected`
     - `suspended`
   - `internalNotes` (rich text, admin-only)
   - `reviewedBy` (relationship to `users`, admin-only)
   - `reviewedAt` (date/time)

5. **Stripe & payouts**

   - `stripeConnectAccountId` (text, admin-only)
   - `stripeOnboardingStatus` (select):
     - `not_started`
     - `in_progress`
     - `complete`
   - `defaultPlatformFeePercent` (number, optional override per brand)

**Access control:**

- `read`:
  - Public: only `status = approved` and only non-sensitive fields (for product join).
  - Brand user: can read their own brand fully (except some internal/admin fields).
  - Admin: full.
- `update`:
  - Brand user: only non-admin fields (identity, story, business details).
  - Admin: all fields.

**Hooks (examples):**

- After `status` changes to `approved`:
  - If no `stripeConnectAccountId`, call Stripe API to create an account.
  - Store account ID.
- After updates: optional webhook to Core API with changed brand metadata.

---

### 3.5 `products` Collection

**Purpose:**  
Base products (concept-level), not specific variants.

**Fields**

1. **Core**

   - `title` (text)
   - `slug` (text, unique)
   - `brand` (relationship to `brands`)
   - `status` (select):
     - `draft`
     - `published`
     - `archived`
   - `primaryImage` (upload)
   - `gallery` (array of uploads)

2. **Descriptions**

   - `shortDescription` (textarea)
   - `description` (rich text)
   - `specs` (rich text or structured array later)

3. **Gift context**

   - `giftTags` (array of text or relationship to `giftTags` collection)
   - `occasionFit` (array select: birthday, anniversary, housewarming, thank you, etc.)
   - `styleTags` (array select, aligned with brand style tags)

4. **Commerce info**

   - `hasVariants` (boolean)
   - `defaultSku` (text, if no variants)
   - `defaultPrice` (number, if no variants)
   - `defaultCurrency` (select)
   - `defaultStock` (number)

   *(If you lean fully on `productVariants`, you can make these optional and only used for single-variant products.)*

5. **Stripe**

   - `stripePriceId` (text, optional per product if one price)

6. **Flags**

   - `isFeatured` (boolean)
   - `visibleToGifter` (boolean, gating field for your app)

**Access:**

- Brand user:
  - `create`: allowed when `brand` matches their `brand` and brand is approved.
  - `update`/`delete`: only their products.
- Admin: full.
- Public (Core API): `status = published`, `brand.status = approved`, restricted fields.

**Hooks:**

- `beforeValidate`: auto-generate slug from title.
- `afterChange`:
  - If `status = published` and brand is approved:
    - Send webhook to Core API: product upsert.
  - If `status` changed to `archived`:
    - Notify Core API to hide this product from recs.

---

### 3.6 `productVariants` Collection

**Purpose:**  
Variants per product (color/size/etc).

**Fields**

- `product` (relationship to `products`)
- `optionValues` (array of key/value pairs, e.g. Size: M, Color: Black)
- `sku` (text, unique-ish per product)
- `price` (number)
- `currency` (select)
- `stock` (number, allow null if external stock)
- `stripePriceId` (text, optional per variant)

**Access:**

- Brand user: only variants whose parent product belongs to their brand.
- Admin: full.
- Public: read only via Core API when needed.

---

### 3.7 `customers` Collection

**Purpose:**  
Record of end customers per brand (minimal for now).

**Fields**

- `email` (text)
- `firstName` (optional)
- `lastName` (optional)
- `brand` (relationship to `brands`) – this customer, as seen by this brand.
- `externalUserId` (optional, link to Core Gifter user if relevant)
- `createdAt` / `updatedAt` (Payload default)

**Access:**

- Brand user: read customers for their brand.
- Admin: full.
- Public: none.

---

### 3.8 `orders` Collection

**Purpose:**  
Orders placed via Gifter, per brand.

**Fields**

1. **Identifiers & relations**

   - `orderNumber` (text or generated sequence)
   - `brand` (relationship to `brands`)
   - `customer` (relationship to `customers`, optional)
   - `coreUserId` (text, optional, ID from your Prisma DB)
   - `coreOccasionId` (text, optional, ID from your Prisma DB)

2. **Amounts**

   - `currency` (select)
   - `subtotal` (number)
   - `shipping` (number)
   - `tax` (number)
   - `total` (number)

3. **Status**

   - `status` (select):
     - `pending`
     - `paid`
     - `fulfilled`
     - `cancelled`
     - `refunded`
   - `paidAt` (date/time)
   - `fulfilledAt` (date/time)

4. **Stripe**

   - `stripePaymentIntentId` (text)
   - `stripeChargeId` (text, optional)
   - `stripeTransferId` (text, if using separate transfers)
   - `stripeFeeAmount` (number, optional for reporting)
   - `platformFeeAmount` (number, your fee)

5. **Shipping & notes**

   - `shippingAddress` (group of fields)
   - `buyerNote` (textarea)
   - `internalNotes` (textarea, admin/brand-only)

**Access:**

- Brand user: `read` orders where `brand` matches their brand; `update` limited to `status`, `fulfilledAt`, `internalNotes`.
- Admin: full.
- Public: none.

**Hooks:**

- On `status` change to `paid`:
  - Webhook to Core API (order paid event).
- On `status` change to `refunded`:
  - Webhook to Core API.

---

### 3.9 `orderItems` Collection

**Purpose:**  
Line items for orders.

**Fields**

- `order` (relationship to `orders`)
- `product` (relationship to `products`)
- `variant` (relationship to `productVariants`, optional)
- `quantity` (number)
- `unitPrice` (number)
- `currency` (select)
- `subtotal` (number)
- Snapshot fields:
  - `productTitle` (text)
  - `variantSummary` (text)
  - `brandName` (text)
  - `image` (upload or URL)

**Access:**

- Inferred from parent order:
  - Brand user: items of their orders.
  - Admin: full.

---

### 3.10 `payouts` (or `transactions`) Collection

**Purpose:**  
Logging money movements for internal + brand view.

**Fields**

- `brand` (relationship to `brands`)
- `order` (relationship to `orders`, optional)
- `type` (select):
  - `payout`
  - `platformFee`
  - `refund`
  - `adjustment`
- `amount` (number, positive or negative)
- `currency` (select)
- `stripeTransferId` (text, optional)
- `stripeBalanceTransactionId` (text, optional)
- `createdAt` (auto)

**Access:**

- Brand user: read records for their brand.
- Admin: full.
- Public: none.

---

### 3.11 `collections` (Curated Product Groups)

**Purpose:**  
Internal and AI-powered curated product sets for use across the system.

**Fields**

- `title` (text)
- `slug` (text)
- `subtitle` (text)
- `description` (rich text)
- `products` (array of relationships to `products` with optional sort index)
- `filters` (optional JSON for dynamic collections)
- `isFeatured` (boolean)
- `targetPersona` (text)
- `targetOccasion` (text or select)
- `image` (upload, hero for marketing + app)

**Access:**

- Admin: full.
- Brand user: read only if you want them to see context.
- Public (Core API): read curated (no control fields).

**Hooks:**

- On publish: optional webhook to Core API / AI service if you want.

---

### 3.12 `brandApplications` (Optional)

If you want a separate application object rather than reusing `brands`:

- Fields:
  - All the “application form” fields (name, website, description, etc.).
  - `status` (pending / approved / rejected).
  - `linkedBrand` (relationship to `brands`, if created).
- Approving an application would:
  - Auto-create a `brand` record.
  - Link brand user to that brand.
- You can also handle this all within `brands` using `status = pending`.

---

### 3.13 `commerceSettings` Global

Global config for commerce:

- `platformFeePercent` (default commission).
- `supportedCurrencies` (array).
- `allowedCountries` (array).
- `stripePublishableKey` / `stripeSecretKey` (if you store them here, lock down access heavily).
- `returnUrlBase` / `refreshUrlBase` for Stripe account link flows.

---

## 4. Stripe Connect Integration Points (Backend)

### 4.1 Brand approval → Stripe account creation

- Hook on `brands` afterChange:
  - If `status` transitioned to `approved` and `stripeConnectAccountId` is empty:
    - Call Stripe API:
      - `accounts.create({ type: 'express', ... })`.
    - Save `stripeConnectAccountId`.
    - Set `stripeOnboardingStatus = 'not_started'`.

### 4.2 Stripe onboarding link

- Brand panel requests an onboarding link from a custom endpoint in Commerce service:
  - `POST /api/brands/:id/stripe/onboard`
  - Server calls:
    - `stripe.accountLinks.create({ account, refresh_url, return_url, type: 'account_onboarding' })`
  - Returns URL to UI.

### 4.3 Stripe webhooks

Webhook handler (in Commerce service) for events like:

- `account.updated`:
  - If `charges_enabled` and other requirements satisfied:
    - Set `stripeOnboardingStatus = 'complete'`.

- `payment_intent.succeeded`:
  - Mark relevant `order` as `paid`.
  - Create appropriate `payouts` entries if needed.

---

## 5. Integration with Core Gifter API & AI

### 5.1 Product sync to Core API

- After product publish/update (hooks in `products` and `productVariants`):
  - POST to Core API: `/internal/commerce/product-upsert` with:
    - IDs, titles, brand info, tags, image URLs, price ranges.
- Core API:
  - Updates `ProductMetadata` (Prisma).
  - Recomputes embeddings if necessary.
  - This powers all AI recs, curated collections, etc.

### 5.2 Order & gifting context

- On order marked as `paid`:
  - Commerce service POST → Core API `/internal/commerce/order-paid` with:
    - `orderId`, `coreUserId`, `coreOccasionId`, product IDs, totals.
- Core API:
  - Updates user gifting history.
  - Feeds any learning loops (e.g. “people who bought this liked…”).
  - Enables “because they gifted X…” logic for future suggestions.

---

## 6. Summary

This spec gives you:

- A **brand panel UX** that matches the editorial black/white Gifter brand and AI concierge voice.
- A **Payload v3+ecommerce backend** structured for:
  - Multi-brand marketplace.
  - Stripe Connect payouts.
  - Products/variants/orders/customers.
  - Clean integration with your Core Gifter API (Prisma) and Python AI layer.

Next step after this:

- Implement `payload.config.ts` with these collections and access rules.
- Stand up `apps/brand-panel` using this UX spec and connect it to Payload via REST/GraphQL.
- Wire up webhooks and integration endpoints on your Core API.

Once this is in place, the app + AI can treat commerce as a robust, production-ready substrate instead of something you have to re-invent inside Prisma.
```
