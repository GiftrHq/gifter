# Gifter Core API + AI System — Production Spec (BetterAuth)  
**Last updated:** 2025-12-21 (Europe/London)

This document is the **single source of truth** for:
- **Core API** (mobile-facing) endpoints, modules, contracts
- **Prisma/Postgres schema** (production-ready)
- **Embeddings + AI enrichment + recommendations**
- **LLM-generated curated categories/collections**
- **Occasions + reminder scheduling + notifications**
- **Telemetry + model-run observability**
- **Payload commerce mirroring** (Brands/Products/Variants/Orders) via webhooks
- **Authentication** via **BetterAuth**

> Assumptions:
> - **Payload CMS** is your **commerce + brand panel + Stripe** system (source of truth for commerce objects).
> - **Core API** is your **mobile + AI + social + wishlists + scheduling + personalization** system.
> - Core maintains a **mirror** of commerce objects from Payload for fast querying, vector search, personalization, and consistency.
> - Postgres is used for Core DB, with **pgvector** enabled.
> - iOS app calls BetterAuth for sign-in and calls Core API with a Bearer token or session token.

---

## 0) High-level architecture

### Components
1) **Payload CMS (Commerce + Brand Panel)**
- Collections: `brands`, `products`, `productVariants`, `orders`, `orderItems`, `payouts`, `media`, `customers`
- Emits webhooks (via your existing hooks) to Core:
  - `product.changed`
  - `brand.changed` (optional but recommended)
  - `order.status_changed`

2) **Core API (Node/TS, Prisma, Postgres)**
- Source of truth for:
  - Users, recipients, friends
  - Taste profiles, occasions, reminders, notifications
  - Wishlists, saves, feedback events
  - Telemetry + experiments
  - Curated collections

3) **Workers (Node/TS in same repo, separate process)**
- Background jobs for:
  - product ingestion follow-ups (enrichment + embeddings)
  - taste profile embedding generation
  - recommendation rerank + explanations
  - daily curated collections generation
  - reminder schedule generation & sending notifications
  - telemetry aggregation (optional)

4) **Queue**
- BullMQ + Redis recommended (simple + robust).
- Alternatives: SQS, Cloud Tasks, etc.

---

## 1) Authentication — BetterAuth (finalized)

### Principles
- **BetterAuth is the identity provider layer**: sign-up/sign-in/refresh.
- Core API is a **resource server**: it validates tokens and maps them to a Core `User`.
- Core stores:
  - `authProvider = "BETTERAUTH"`
  - `authUserId` (subject/user id from BetterAuth)
- For service-to-service (Payload → Core), use **webhook secret** (HMAC or static secret header).

### Token strategy (recommended for mobile)
- iOS app authenticates with BetterAuth and obtains an **access token** (JWT) + refresh.
- Calls Core API with:
  - `Authorization: Bearer <access_token>`
- Core validates token using BetterAuth verification:
  - Option A (best): Verify JWT using BetterAuth **JWKS** / public key + issuer + audience.
  - Option B: Call BetterAuth introspection endpoint (slower, adds dependency).

### Core API auth middleware requirements
- Validate:
  - signature
  - `iss`, `aud`, expiry
- Extract:
  - `sub` → `authUserId`
  - `email` (optional)
  - `name`/`picture` (optional)
- Upsert Core user:
  - if no user exists for `(provider, authUserId)`, create it on first request.
  - keep `email` updated if present.

### Internal service auth for webhooks
- Payload sends:
  - `X-Internal-Webhook-Secret: <shared_secret>`
  - `X-Event-Name: product.changed`
  - Optional signature: `X-Signature: HMAC_SHA256(body)`
- Core rejects if secret/signature invalid.

---

## 2) Repo + folder structure (production)

This structure keeps boundaries clean, supports workers, and avoids “AI logic sprinkled everywhere”.

```
gifter/
  apps/
    core-api/
      src/
        server.ts
        env.ts
        routes/
          index.ts
          health.routes.ts
          me.routes.ts
          recipients.routes.ts
          friends.routes.ts
          occasions.routes.ts
          wishlists.routes.ts
          products.routes.ts
          recommendations.routes.ts
          collections.routes.ts
          notifications.routes.ts
          telemetry.routes.ts
          integrations.payload.routes.ts
          integrations.betterauth.routes.ts  (optional)
        controllers/
          me.controller.ts
          recipients.controller.ts
          occasions.controller.ts
          products.controller.ts
          recommendations.controller.ts
          collections.controller.ts
          notifications.controller.ts
          telemetry.controller.ts
          integrations.payload.controller.ts
        services/
          auth/
            betterauth.verify.ts
            user.resolve.ts
          commerce/
            payload.ingest.ts
            mirror.service.ts
          embeddings/
            embeddings.service.ts
            vector.sql.ts
          enrichment/
            product.enrichment.service.ts
          recommendations/
            candidates.service.ts
            ranking.service.ts
            rerank.llm.service.ts
            explanations.llm.service.ts
          collections/
            curated.collections.service.ts
          occasions/
            occasions.service.ts
            reminder.policy.service.ts
            schedule.service.ts
          notifications/
            push.service.ts
            notification.service.ts
          telemetry/
            telemetry.service.ts
            experiments.service.ts
        repositories/
          user.repo.ts
          recipient.repo.ts
          product.repo.ts
          embedding.repo.ts
          recommendation.repo.ts
          occasion.repo.ts
          notification.repo.ts
          telemetry.repo.ts
        jobs/
          enqueue.ts
          job.types.ts
          job.utils.ts
        middleware/
          auth.middleware.ts
          rateLimit.middleware.ts
          idempotency.middleware.ts
          error.middleware.ts
          requestContext.middleware.ts
        prompts/
          PromptLibrary.ts
          templates/
            product_enrichment.v1.ts
            recommendation_rerank.v1.ts
            curated_collections.v1.ts
            onboarding_questions.v1.ts
        utils/
          logger.ts
          zod.ts
          time.ts
          crypto.ts
          pagination.ts
          money.ts
      prisma/
        schema.prisma
        migrations/
      tests/
        api/
        services/
      package.json

    workers/
      src/
        worker.ts
        env.ts
        queues/
          index.ts
          embedding.queue.ts
          enrichment.queue.ts
          collections.queue.ts
          reminders.queue.ts
          telemetry.queue.ts
        processors/
          embedProduct.processor.ts
          embedTasteProfile.processor.ts
          enrichProduct.processor.ts
          generateCollections.processor.ts
          dispatchNotifications.processor.ts
        llm/
          llm.client.ts
          embedding.client.ts
        utils/
          logger.ts
          backoff.ts
      package.json

    payload/   (your existing Payload app)
      src/
        hooks/
          products.ts
          orders.ts
          brands.ts
        integrations/
          coreApi.client.ts  (shared fetch + signature)
  packages/
    shared/
      src/
        types/
          api.ts
          events.ts
          enums.ts
        constants/
        telemetry/
        money/
        zod/
```

### Boundary rules (important)
- **controllers**: request validation + orchestration only. No business logic.
- **services**: business logic, use repositories, call jobs/queues, LLM.
- **repositories**: Prisma access only (no logic).
- **prompts**: centralized prompt templates, versioned.
- **workers**: execute jobs; never host HTTP endpoints.

---

## 3) Core API — Endpoint spec (REST)

**Conventions**
- Base: `/v1`
- Pagination: `?cursor=<opaque>&limit=20`
- Errors: `{ "error": { "code": "...", "message": "...", "details": {} } }`
- All endpoints require auth unless marked **Public** or **Internal**.

### 3.1 Health
- **GET** `/v1/health` (Public)  
  Returns `{ ok: true, env, version }`

### 3.2 Me / user
- **GET** `/v1/me`
- **PATCH** `/v1/me`
  - `displayName`, `avatarUrl`, `timezone`, `defaultCurrency`
- **POST** `/v1/me/device`
  - body: `{ platform:"ios", token, appVersion?, buildNumber? }`
- **DELETE** `/v1/me/device/:deviceId`

### 3.3 Recipients (friends + non-users)
- **POST** `/v1/recipients`
  - body: `{ type:"USER"|"EXTERNAL", userId?, name?, relationship?, birthday?, notes?, avatarUrl? }`
- **GET** `/v1/recipients`
- **GET** `/v1/recipients/:id`
- **PATCH** `/v1/recipients/:id`
- **DELETE** `/v1/recipients/:id`

### 3.4 Friends
- **POST** `/v1/friend-requests` `{ toUserId }`
- **GET** `/v1/friend-requests?in=incoming|outgoing`
- **POST** `/v1/friend-requests/:id/accept`
- **POST** `/v1/friend-requests/:id/decline`
- **GET** `/v1/friends`
- **DELETE** `/v1/friends/:friendshipId`

### 3.5 Occasions + reminders
- **POST** `/v1/occasions`
- **GET** `/v1/occasions?recipientId=...`
- **GET** `/v1/occasions/upcoming?days=30`
- **PATCH** `/v1/occasions/:id`
- **DELETE** `/v1/occasions/:id`
- **GET** `/v1/reminder-policies`
- **POST** `/v1/reminder-policies`
- **PATCH** `/v1/reminder-policies/:id`
- **DELETE** `/v1/reminder-policies/:id`

### 3.6 Products (mirrored from Payload)
- **GET** `/v1/products`
- **GET** `/v1/products/:id`
- **GET** `/v1/brands` (optional public)
- **GET** `/v1/brands/:id`

### 3.7 Wishlists
- **POST** `/v1/wishlists` `{ recipientId?, title, visibility }`
- **GET** `/v1/wishlists?scope=mine|friends|public&recipientId=...`
- **GET** `/v1/wishlists/:id`
- **PATCH** `/v1/wishlists/:id`
- **POST** `/v1/wishlists/:id/items`
- **DELETE** `/v1/wishlist-items/:id`

### 3.8 Taste profiles (user + non-user)
- **POST** `/v1/taste-profiles/start`
- **POST** `/v1/taste-profiles/:id/answer`
- **POST** `/v1/taste-profiles/:id/complete`
- **GET** `/v1/taste-profiles?recipientId=...`

### 3.9 Recommendations
- **POST** `/v1/recommendations`
- **GET** `/v1/recommendations/feed`
- **POST** `/v1/recommendations/:requestId/feedback`

### 3.10 Curated collections
- **GET** `/v1/collections/curated?surface=home`
- **GET** `/v1/collections/:id`
- **POST** `/v1/admin/collections/regenerate?date=YYYY-MM-DD&surface=home` (Internal)

### 3.11 Notifications
- **GET** `/v1/notifications?status=unread|all`
- **POST** `/v1/notifications/:id/read`
- **GET** `/v1/notification-preferences`
- **PATCH** `/v1/notification-preferences`

### 3.12 Telemetry
- **POST** `/v1/telemetry/session/start`
- **POST** `/v1/telemetry/events`

### 3.13 Integrations — Payload → Core (Internal)
- **POST** `/v1/integrations/payload/product-changed`
- **POST** `/v1/integrations/payload/order-status-changed`
- **POST** `/v1/integrations/payload/brand-changed`

---

## 4) Payload → Core mirroring contract

### Webhook payload — product.changed (recommended)
```json
{
  "event": "product.changed",
  "payloadProductId": "123",
  "brand": {
    "payloadBrandId": "9",
    "name": "Brand Name",
    "status": "approved",
    "country": "GB",
    "baseCurrency": "GBP",
    "logoUrl": "https://...",
    "coverImageUrl": "https://..."
  },
  "product": {
    "title": "Product",
    "slug": "product",
    "status": "published",
    "visibleToGifter": true,
    "isFeatured": false,
    "shortDescription": "...",
    "description": "...",
    "specs": "...",
    "primaryImageUrl": "https://...",
    "galleryImageUrls": ["https://..."],
    "defaultPrice": 12900,
    "defaultCurrency": "GBP",
    "giftTags": ["For the ritualist", "Under £50"],
    "occasionFit": ["birthday", "housewarming"],
    "styleTags": ["minimal", "luxurious"]
  },
  "variants": [
    {
      "payloadVariantId": "v1",
      "sku": "SKU-1",
      "optionValues": [{"option":"Size","value":"M"}],
      "price": 12900,
      "currency": "GBP",
      "stock": 10,
      "stripePriceId": "price_..."
    }
  ],
  "ts": "2025-12-21T10:00:00Z"
}
```

### Ingest rules
- Upsert `BrandMirror` by `payloadBrandId`
- Upsert `ProductMirror` by `payloadProductId`
- Upsert `VariantMirror` by `payloadVariantId`
- Enqueue enrichment + embedding jobs for published + visible products

---

## 5) AI/Embeddings/Recommendations

### Embedding pipeline
- Build canonical embedding text (title + descriptions + tags + brand)
- Compute `textHash`
- If unchanged: skip
- Store `ProductEmbedding` (pgvector)

### Recommendation layers
- Layer 0: vector candidate search + filters
- Layer 1: deterministic scoring + diversity
- Layer 2: LLM rerank + explanations (persist + ModelRun)

---

## 6) Curated collections (LLM categories)
- Generate on schedule (daily/6h)
- Persist `CuratedCollection` + items
- Serve instantly from DB

---

## 7) Occasions + reminders + notifications
- Reminder policies store offsets
- Occasion triggers schedule upserts
- Worker dispatches due schedules

---

## 8) Telemetry + ModelRun observability
- Batch telemetry ingestion from iOS
- Persist every LLM call as `ModelRun` with tokens/latency/cost

---

## 9) pgvector + indexes

```sql
CREATE EXTENSION IF NOT EXISTS vector;

CREATE INDEX IF NOT EXISTS product_embedding_hnsw_idx
ON "ProductEmbedding"
USING hnsw ("vector" vector_cosine_ops);

CREATE INDEX IF NOT EXISTS taste_profile_hnsw_idx
ON "TasteProfile"
USING hnsw ("vector" vector_cosine_ops);
```

---

## 10) Prisma schema (Core DB)

> NOTE: vector dims shown as 1536. Adjust to match your embedding model.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum AuthProvider {
  BETTERAUTH
}

enum UserStatus {
  ACTIVE
  DISABLED
  DELETED
}

enum RecipientType {
  USER
  EXTERNAL
}

enum FriendshipStatus {
  PENDING
  ACCEPTED
  DECLINED
  BLOCKED
}

enum WishlistVisibility {
  PRIVATE
  FRIENDS
  PUBLIC
}

enum OccasionType {
  BIRTHDAY
  ANNIVERSARY
  HOUSEWARMING
  WEDDING
  BABY_SHOWER
  THANK_YOU
  JUST_BECAUSE
  OTHER
}

enum OccasionRecurrence {
  NONE
  YEARLY
}

enum NotificationChannel {
  PUSH
  EMAIL
}

enum NotificationStatus {
  QUEUED
  SENT
  FAILED
}

enum ProductPublishStatus {
  DRAFT
  PUBLISHED
  ARCHIVED
}

enum EmbeddingEntityType {
  PRODUCT
  TASTE_PROFILE
}

enum JobStatus {
  QUEUED
  RUNNING
  SUCCEEDED
  FAILED
  CANCELLED
}

enum RecommendationAction {
  IMPRESSION
  CLICK
  LIKE
  DISLIKE
  SAVE
  HIDE
  BOUGHT
}

enum LlmPurpose {
  PRODUCT_ENRICHMENT
  CURATED_COLLECTIONS
  RECOMMENDATION_RERANK
  ONBOARDING_QUESTIONS
  EXPLANATIONS
}

model User {
  id              String     @id @default(cuid())
  status          UserStatus @default(ACTIVE)

  authProvider    AuthProvider
  authUserId      String

  email           String?    @unique
  phone           String?    @unique

  displayName     String?
  avatarUrl       String?
  timezone        String     @default("Europe/London")
  defaultCurrency String     @default("GBP")

  createdAt       DateTime   @default(now())
  updatedAt       DateTime   @updatedAt

  profile         UserProfile?
  devices         Device[]
  prefs           NotificationPreference?

  outgoingFriendRequests FriendRequest[] @relation("OutgoingFriendRequests")
  incomingFriendRequests FriendRequest[] @relation("IncomingFriendRequests")

  friendshipsA    Friendship[] @relation("FriendshipA")
  friendshipsB    Friendship[] @relation("FriendshipB")

  recipients      Recipient[]  @relation("OwnerRecipients")
  occasions       Occasion[]   @relation("OwnerOccasions")
  wishlists       Wishlist[]   @relation("OwnerWishlists")

  tasteProfiles   TasteProfile[] @relation("OwnerTasteProfiles")

  recommendationRequests RecommendationRequest[]
  notifications   Notification[]
  telemetryEvents TelemetryEvent[]

  @@unique([authProvider, authUserId])
  @@index([createdAt])
}

model UserProfile {
  userId     String   @id
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  birthday   DateTime?
  bio        String?
  location   String?
  interests  Json?

  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model Device {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  platform    String
  token       String   @unique
  appVersion  String?
  buildNumber String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([userId])
}

model FriendRequest {
  id          String           @id @default(cuid())
  fromUserId  String
  toUserId    String
  status      FriendshipStatus @default(PENDING)

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  fromUser User @relation("OutgoingFriendRequests", fields: [fromUserId], references: [id], onDelete: Cascade)
  toUser   User @relation("IncomingFriendRequests", fields: [toUserId], references: [id], onDelete: Cascade)

  @@unique([fromUserId, toUserId])
  @@index([toUserId, status])
}

model Friendship {
  id        String           @id @default(cuid())
  userAId   String
  userBId   String
  status    FriendshipStatus @default(ACCEPTED)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  userA User @relation("FriendshipA", fields: [userAId], references: [id], onDelete: Cascade)
  userB User @relation("FriendshipB", fields: [userBId], references: [id], onDelete: Cascade)

  @@unique([userAId, userBId])
  @@index([userAId])
  @@index([userBId])
}

model Recipient {
  id           String        @id @default(cuid())
  ownerUserId  String
  owner        User          @relation("OwnerRecipients", fields: [ownerUserId], references: [id], onDelete: Cascade)

  type         RecipientType
  userId       String?
  user         User?         @relation(fields: [userId], references: [id], onDelete: SetNull)

  name         String?
  relationship String?
  avatarUrl    String?
  birthday     DateTime?
  notes        String?

  isTemporary  Boolean       @default(false)
  expiresAt    DateTime?

  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  occasions    Occasion[]
  wishlists    Wishlist[]
  tasteProfiles TasteProfile[]

  @@index([ownerUserId])
  @@index([userId])
  @@index([isTemporary, expiresAt])
}

model Occasion {
  id           String             @id @default(cuid())
  ownerUserId  String
  owner        User               @relation("OwnerOccasions", fields: [ownerUserId], references: [id], onDelete: Cascade)

  recipientId  String
  recipient    Recipient          @relation(fields: [recipientId], references: [id], onDelete: Cascade)

  type         OccasionType
  title        String?
  date         DateTime
  timezone     String             @default("Europe/London")
  isAllDay     Boolean            @default(true)
  recurrence   OccasionRecurrence @default(NONE)

  reminderPolicyId String?
  reminderPolicy   ReminderPolicy? @relation(fields: [reminderPolicyId], references: [id], onDelete: SetNull)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  schedules    NotificationSchedule[]
  recommendationRequests RecommendationRequest[]

  @@index([ownerUserId, date])
  @@index([recipientId, date])
}

model ReminderPolicy {
  id          String  @id @default(cuid())
  ownerUserId String?
  name        String
  offsets     Json
  channels    Json

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  occasions   Occasion[]

  @@index([ownerUserId])
}

model NotificationPreference {
  userId       String  @id
  user         User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  pushEnabled  Boolean @default(true)
  emailEnabled Boolean @default(false)

  quietHours   Json?
  defaultReminderPolicyId String?
  defaultReminderPolicy   ReminderPolicy? @relation(fields: [defaultReminderPolicyId], references: [id], onDelete: SetNull)

  updatedAt    DateTime @updatedAt
}

model NotificationSchedule {
  id            String              @id @default(cuid())
  userId        String
  user          User                @relation(fields: [userId], references: [id], onDelete: Cascade)

  occasionId    String?
  occasion      Occasion?           @relation(fields: [occasionId], references: [id], onDelete: Cascade)

  channel       NotificationChannel
  scheduledFor  DateTime
  payload       Json
  status        NotificationStatus  @default(QUEUED)

  attempts      Int                 @default(0)
  lastError     String?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([userId, scheduledFor])
  @@index([status, scheduledFor])
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  title     String
  body      String
  data      Json?
  readAt    DateTime?

  createdAt DateTime @default(now())

  @@index([userId, createdAt])
  @@index([userId, readAt])
}

model Wishlist {
  id           String             @id @default(cuid())
  ownerUserId  String
  owner        User               @relation("OwnerWishlists", fields: [ownerUserId], references: [id], onDelete: Cascade)

  recipientId  String?
  recipient    Recipient?         @relation(fields: [recipientId], references: [id], onDelete: SetNull)

  title        String
  visibility   WishlistVisibility  @default(PRIVATE)

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  items        WishlistItem[]

  @@index([ownerUserId])
  @@index([recipientId])
}

model WishlistItem {
  id           String   @id @default(cuid())
  wishlistId   String
  wishlist     Wishlist @relation(fields: [wishlistId], references: [id], onDelete: Cascade)

  productId    String?
  product      ProductMirror? @relation(fields: [productId], references: [id], onDelete: SetNull)

  externalUrl  String?
  notes        String?
  priority     Int?
  desiredPrice Int?

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  @@index([wishlistId, createdAt])
  @@index([productId])
}

model BrandMirror {
  id              String   @id @default(cuid())
  payloadBrandId  String   @unique

  name            String
  slug            String?
  status          String?
  country         String?
  baseCurrency    String?

  logoUrl         String?
  coverImageUrl   String?
  giftFit         String?
  styleTags       Json?

  stripeConnectAccountId String?
  stripeOnboardingStatus String?

  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  products        ProductMirror[]

  @@index([status])
}

model ProductMirror {
  id               String   @id @default(cuid())
  payloadProductId String   @unique

  brandId          String
  brand            BrandMirror @relation(fields: [brandId], references: [id], onDelete: Cascade)

  title            String
  slug             String?
  status           ProductPublishStatus @default(DRAFT)
  visibleToGifter  Boolean  @default(true)
  isFeatured       Boolean  @default(false)

  shortDescription String?
  description      String?
  specs            String?

  primaryImageUrl  String?
  galleryImageUrls Json?

  defaultPrice     Int?
  defaultCurrency  String?

  giftTags         Json?
  occasionFit      Json?
  styleTags        Json?

  enrichment       Json?
  enrichmentVersion Int @default(0)

  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  variants         VariantMirror[]
  embeddings       ProductEmbedding[]

  @@index([brandId, status])
  @@index([status, isFeatured])
}

model VariantMirror {
  id                String @id @default(cuid())
  payloadVariantId  String @unique

  productId         String
  product           ProductMirror @relation(fields: [productId], references: [id], onDelete: Cascade)

  sku               String
  optionValues      Json
  price             Int
  currency          String
  stock             Int?

  stripePriceId     String?

  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([productId])
}

model ProductEmbedding {
  id          String @id @default(cuid())
  productId   String
  product     ProductMirror @relation(fields: [productId], references: [id], onDelete: Cascade)

  provider    String
  model       String
  dims        Int

  vector      Unsupported("vector(1536)")
  textHash    String

  createdAt   DateTime @default(now())

  @@index([productId])
  @@index([model])
}

model TasteProfile {
  id            String @id @default(cuid())
  ownerUserId   String
  owner         User   @relation("OwnerTasteProfiles", fields: [ownerUserId], references: [id], onDelete: Cascade)

  recipientId   String?
  recipient     Recipient? @relation(fields: [recipientId], references: [id], onDelete: SetNull)

  mode          String
  name          String?

  answers       Json?
  facets        Json?

  provider      String?
  model         String?
  dims          Int?

  vector        Unsupported("vector(1536)")
  vectorUpdatedAt DateTime?

  isTemporary   Boolean @default(false)
  expiresAt     DateTime?

  createdAt     DateTime @default(now())
  updatedAt     DateTime @updatedAt

  @@index([ownerUserId])
  @@index([recipientId])
  @@index([isTemporary, expiresAt])
}

model RecommendationRequest {
  id          String @id @default(cuid())
  userId      String
  user        User   @relation(fields: [userId], references: [id], onDelete: Cascade)

  recipientId String?
  recipient   Recipient? @relation(fields: [recipientId], references: [id], onDelete: SetNull)

  occasionId  String?
  occasion    Occasion? @relation(fields: [occasionId], references: [id], onDelete: SetNull)

  budget      Json?
  constraints Json?
  context     Json?

  createdAt   DateTime @default(now())

  items       RecommendationItem[]
  actions     RecommendationEvent[]

  @@index([userId, createdAt])
  @@index([recipientId, createdAt])
}

model RecommendationItem {
  id          String @id @default(cuid())
  requestId   String
  request     RecommendationRequest @relation(fields: [requestId], references: [id], onDelete: Cascade)

  productId   String
  product     ProductMirror @relation(fields: [productId], references: [id], onDelete: Cascade)

  rank        Int
  score       Float
  explanation String?
  badges      Json?

  createdAt   DateTime @default(now())

  @@unique([requestId, productId])
  @@index([requestId, rank])
}

model RecommendationEvent {
  id          String @id @default(cuid())
  requestId   String?
  request     RecommendationRequest? @relation(fields: [requestId], references: [id], onDelete: SetNull)

  userId      String?
  user        User? @relation(fields: [userId], references: [id], onDelete: SetNull)

  productId   String?
  product     ProductMirror? @relation(fields: [productId], references: [id], onDelete: SetNull)

  action      RecommendationAction
  props       Json?
  createdAt   DateTime @default(now())

  @@index([userId, createdAt])
  @@index([productId, createdAt])
}

model CuratedCollection {
  id          String @id @default(cuid())
  key         String?
  title       String
  subtitle    String?
  description String?

  surface     String
  filters     Json?

  generatedBy String?
  modelRunId  String?
  modelRun    ModelRun? @relation(fields: [modelRunId], references: [id], onDelete: SetNull)

  validFrom   DateTime @default(now())
  validTo     DateTime?

  createdAt   DateTime @default(now())

  items       CuratedCollectionItem[]

  @@index([surface, validFrom])
  @@index([key])
}

model CuratedCollectionItem {
  id           String @id @default(cuid())
  collectionId String
  collection   CuratedCollection @relation(fields: [collectionId], references: [id], onDelete: Cascade)

  productId    String
  product      ProductMirror @relation(fields: [productId], references: [id], onDelete: Cascade)

  rank         Int
  note         String?

  @@unique([collectionId, productId])
  @@index([collectionId, rank])
}

model ModelRun {
  id            String @id @default(cuid())
  purpose       LlmPurpose
  provider      String
  model         String

  promptKey     String?
  traceId       String?

  inputTokens   Int?
  outputTokens  Int?
  latencyMs     Int?
  costUsd       Float?

  status        String
  error         String?

  input         Json?
  output        Json?

  createdAt     DateTime @default(now())

  @@index([purpose, createdAt])
  @@index([traceId])
}

model EmbeddingJob {
  id          String @id @default(cuid())
  entityType  EmbeddingEntityType
  entityId    String

  provider    String
  model       String
  dims        Int

  status      JobStatus @default(QUEUED)
  attempts    Int @default(0)
  scheduledAt DateTime @default(now())
  startedAt   DateTime?
  finishedAt  DateTime?

  inputText   String?
  error       String?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([status, scheduledAt])
  @@index([entityType, entityId])
}

model TelemetryEvent {
  id        String   @id @default(cuid())
  userId    String?
  user      User?    @relation(fields: [userId], references: [id], onDelete: SetNull)

  sessionId String?
  deviceId  String?

  name      String
  props     Json?
  ts        DateTime @default(now())

  @@index([name, ts])
  @@index([userId, ts])
  @@index([sessionId, ts])
}
```

The full schema is included in this file’s earlier “Prisma schema” section in the source repository version of this doc.

---

## 11) Env vars
Core:
- `DATABASE_URL`
- `REDIS_URL`
- `BETTERAUTH_ISSUER`
- `BETTERAUTH_AUDIENCE`
- `BETTERAUTH_JWKS_URL`
- `INTERNAL_WEBHOOK_SECRET`
- `LLM_API_KEY`
- `EMBEDDING_MODEL`
- `EMBEDDING_DIMS`

Workers:
- `DATABASE_URL`
- `REDIS_URL`
- `LLM_API_KEY`

---

## 12) Payload hook example
```ts
await fetch(`${CORE_API_URL}/v1/integrations/payload/product-changed`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "X-Internal-Webhook-Secret": process.env.INTERNAL_WEBHOOK_SECRET!,
    "X-Event-Name": "product.changed",
  },
  body: JSON.stringify(payload),
})
```
