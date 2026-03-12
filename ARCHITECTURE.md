# SafeBuy — Complete System Architecture
> Production-grade multi-vendor marketplace (Web + Android + iOS)
> Super Admin: majbauddin.personal@gmail.com

> 📖 **Complete REST API Reference** → [`API_REFERENCE.md`](./API_REFERENCE.md)

---

## 1. HIGH-LEVEL SYSTEM DIAGRAM

```
+==============================================================================+
|                           SAFEBUY PLATFORM                                   |
+==============+==================+==================+==========================+
|  WEB CLIENT  |  ANDROID CLIENT  |   iOS CLIENT     |   ADMIN PANEL (Web)     |
|  Next.js 14  |  React Native    |  React Native    |   Next.js (Admin)       |
|  (Vercel)    |  (Expo)          |  (Expo)          |   (Vercel)              |
+======+========+=========+========+=========+========+============+============+
       |                  |                  |                   |
       +------------------+------------------+-------------------+
                                    | HTTPS / WSS
                         +----------v----------+
                         |   API GATEWAY        |
                         |   Rate Limit / CORS  |
                         |   Auth Middleware    |
                         +----------+----------+
                                    |
       +----------------------------+----------------------------+
       |                            |                            |
+------v------+           +---------v--------+        +---------v--------+
|  NestJS API  |           |  WebSocket Srv   |        |  Job Queue       |
|  (Railway/   |           |  (Socket.io)     |        |  (Bull/BullMQ)   |
|   Render)   |           |  Chat / Notif    |        |  Email / Notif   |
+------+------+           +---------+--------+        +---------+--------+
       |                            |                            |
       +----------------------------+----------------------------+
                                    |
       +----------------------------+----------------------------+
       |                            |                            |
+------v------+           +---------v--------+        +---------v--------+
|  MongoDB     |           |  Cloudinary      |        |  Firebase FCM    |
|  Atlas       |           |  (Images/Videos) |        |  (Push Notif)    |
|  (Free Tier) |           |  (Free Tier)     |        |  (Free Tier)     |
+-------------+           +------------------+        +------------------+
```

---

## 2. BACKEND MODULE ARCHITECTURE

```
NestJS API Server
|
+-- AppModule (root)
|   +-- ConfigModule          -> .env / environment variables
|   +-- MongooseModule        -> MongoDB Atlas connection
|   +-- ThrottlerModule       -> Rate limiting (5/min auth, 100/min general)
|   +-- ScheduleModule        -> Cron jobs (flash sale expiry, fraud scans)
|
+-- AuthModule
|   +-- JWT Strategy          -> Access token (15min)
|   +-- Refresh Token         -> httpOnly cookie (7 days)
|   +-- Google OAuth          -> passport-google-oauth20
|   +-- JwtAuthGuard          -> Protects all routes
|   +-- RolesGuard            -> RBAC (customer/seller/admin/super_admin)
|
+-- UsersModule               -> Profile, addresses, wishlist, recently viewed
+-- SellersModule             -> Registration, approval, analytics, shop
+-- ProductsModule            -> CRUD, variants, search, flash sales, AI tags
+-- CategoriesModule          -> Hierarchical tree (parent -> children)
+-- CartModule                -> Persistent cart, coupon application
+-- OrdersModule              -> Multi-seller splitting, state machine, invoices
+-- PaymentsModule            -> bKash/Nagad/Rocket/Bank/COD + auto-match
+-- DeliveryModule            -> Pathao, Steadfast, DeliVro, Sundarban
+-- ReviewsModule             -> Verified purchase reviews, seller reply
+-- CouponsModule             -> Platform + seller coupons, validation engine
+-- NotificationsModule       -> Email (Gmail SMTP), Firebase push, in-app
+-- ChatModule (WebSocket)    -> Real-time buyer-seller messaging
+-- AiModule                  -> Recommendations, fraud detection, chatbot, desc gen
+-- UploadModule              -> Cloudinary (images, videos)
+-- AdminModule               -> Dashboard, moderation, analytics, fraud alerts
```

---

## 3. FRONTEND WEB ARCHITECTURE (Next.js 14)

```
app/
+-- (public)/
|   +-- page.tsx              -> Homepage: hero, categories, flash sale, featured
|   +-- products/             -> Product listing + smart search
|   +-- product/[slug]/       -> Product detail, reviews, related products
|   +-- seller/[slug]/        -> Seller store page
|   +-- category/[slug]/      -> Category browsing
|   +-- search/               -> Search results with filters
|   +-- auth/                 -> Login, Register, Verify, Forgot/Reset Password
|
+-- (buyer)/
|   +-- cart/                 -> Shopping cart
|   +-- checkout/             -> Address -> Payment -> Confirm
|   +-- payment/              -> bKash/Nagad/Rocket/Bank instructions + TxID form
|   +-- orders/               -> Order history, tracking, cancel/return
|   +-- wishlist/             -> Saved products
|   +-- profile/              -> Profile & address management
|   +-- notifications/        -> Notification center
|
+-- (seller)/
|   +-- dashboard/            -> Revenue, orders, views overview
|   +-- products/             -> Add/edit/delete products
|   +-- orders/               -> Manage incoming orders
|   +-- analytics/            -> Charts: sales, revenue, traffic
|   +-- chat/                 -> Customer messages
|   +-- settings/             -> Shop info, bank details
|
+-- (admin)/
    +-- dashboard/            -> Platform KPIs
    +-- users/                -> Manage all users
    +-- sellers/              -> Approve/suspend sellers
    +-- products/             -> Moderate products
    +-- orders/               -> All platform orders
    +-- payments/             -> Payment queue (Pending -> Confirm/Reject)
    +-- delivery/             -> Courier management
    +-- categories/           -> Category tree management
    +-- coupons/              -> Platform coupon management
    +-- fraud/                -> Fraud alerts & risk scores
    +-- analytics/            -> Revenue, user growth, product performance
    +-- settings/             -> Platform settings
```

---

## 4. MOBILE APP ARCHITECTURE (React Native + Expo)

```
app/                          <- Expo Router file-based navigation
+-- (tabs)/
|   +-- index.tsx             -> Home (hero, categories, deals)
|   +-- search.tsx            -> Search & browse
|   +-- cart.tsx              -> Cart
|   +-- orders.tsx            -> My orders
|   +-- profile.tsx           -> Profile & settings
|
+-- auth/                     -> Login, Register, OTP Verify
+-- product/[id].tsx          -> Product detail
+-- category/[slug].tsx       -> Category products
+-- seller/[id].tsx           -> Seller store
+-- checkout/                 -> Checkout flow
+-- payment/                  -> Payment method + TxID submission
+-- order/[id].tsx            -> Order tracking
+-- chat/[id].tsx             -> Chat screen
+-- notifications.tsx         -> Push notification center
+-- seller-dashboard/         -> Seller screens (product add, orders, analytics)
```

---

## 5. PAYMENT AUTOMATION WORKFLOW

```
Customer selects bKash / Nagad / Rocket / Bank Transfer
          |
          v
+--------------------------+
|  PAYMENT INSTRUCTIONS    |
|  bKash:  01752962104     |
|  Nagad:  01752962104     |
|  Rocket: 01752962104     |
|  Bank: Islami Bank BD    |
|  Acc:  20501306700352701 |
|  Routing: 125264097      |
+---------+----------------+
          | Customer sends money externally
          v
+--------------------------+
|  Customer submits:       |
|  - Transaction ID        |
|  - Sender number         |
|  - Amount                |
|  - Screenshot (optional) |
+---------+----------------+
          |
          v
+--------------------------+
|  Backend saves Payment   |
|  Status: PENDING         |
|  Starts auto-match job   |
+---------+----------------+
          |
    +-----v------+
    | RETRY LOOP |<--------------------------+
    | Attempt 1/3|                           |
    +-----+------+                           |
          |                                  |
    +-----v----------------------------------+--+
    | Check transaction ID:                     |
    | - Admin-entered payment logs              |
    | - Pattern match (amount + sender number)  |
    | - Duplicate check                         |
    +-------+--------------------------+--------+
            | MATCH                    | NO MATCH
            v                          v
    +--------------+           +---------------+
    | AUTO CONFIRM |           | Wait 40 sec   |
    | Order Active |           | Retry (max 3) |
    +--------------+           +-------+-------+
                                       | After 3 failures
                                       v
                              +------------------+
                              | Status: PENDING  |
                              | Notify Admin     |
                              | Admin Reviews    |
                              +------------------+
                                       |
              +------------------------+------------------------+
              v                        v                        v
         CONFIRMED                 REJECTED                 REVIEWED
         (Order live)            (Note added)           (Manual check)
```

---

## 6. ORDER STATE MACHINE

```
PENDING -> CONFIRMED -> PROCESSING -> SHIPPED -> DELIVERED
   |             |            |
   v             v            v
CANCELLED    CANCELLED    CANCELLED

After DELIVERED:
RETURN_REQUESTED -> RETURNED -> REFUNDED
```

---

## 7. COURIER INTEGRATION

```
DeliveryModule
+-- CourierFactory.getProvider(name)   -> returns correct adapter
+-- PathaoAdapter     (REST API)
+-- SteadfastAdapter  (REST API)
+-- DelivroAdapter    (REST API)
+-- ManualAdapter     (Sundarban - manual tracking entry)

Each adapter implements:
  authenticate()  -> get access token
  createShipment(order) -> returns tracking number
  trackShipment(trackingNumber) -> returns status + location
  calculateRate(weight, zone) -> returns delivery cost
```

---

## 8. AI FEATURES

```
AiModule
+-- ProductRecommender
|   - Collaborative filtering on user purchase history
|   - Content-based filtering on product tags/category
|   - Trending/popularity scoring
|   - Cold start: featured + popular products
|
+-- FraudDetector
|   - Multiple orders from same IP in short time
|   - Multiple failed payment attempts
|   - Unusual quantities or order values
|   - Risk score 0-100 (>70 = flagged)
|
+-- Chatbot
|   - Rule-based FAQ (order status, payment, returns)
|   - HuggingFace inference API for NLP queries
|   - Escalation to human support
|
+-- DescriptionGenerator
    - HuggingFace text-generation (flan-t5 or similar)
    - Input: product title + category + key specs
    - Output: SEO-optimized product description
```

---

## 9. SECURITY LAYERS

```
1. Transport     -> HTTPS/TLS + HSTS via Helmet.js
2. Authentication -> JWT (15min) + Refresh Token (7d httpOnly cookie)
3. Authorization  -> RBAC Guards (customer/seller/admin/super_admin)
4. Validation    -> class-validator on all DTOs + sanitize-html
5. File Uploads  -> Type whitelist (jpg/png/webp) + 5MB max
6. Rate Limiting -> ThrottlerModule (5/min auth, 100/min API)
7. Database      -> Mongoose schema validation, no raw queries
8. Monitoring    -> Fraud scoring + error logging
```

---

## 10. FREE SERVICES CONFIGURATION

| Service          | Purpose              | Free Limit             | Setup                       |
|-----------------|----------------------|------------------------|-----------------------------|
| MongoDB Atlas    | Database             | 512MB, shared cluster  | atlas.mongodb.com           |
| Cloudinary       | Image/Video storage  | 25GB, 25k transforms   | cloudinary.com              |
| Vercel           | Frontend hosting     | Unlimited              | vercel.com                  |
| Railway/Render   | Backend hosting      | 500hrs/month           | railway.app / render.com    |
| Gmail SMTP       | Transactional email  | 500/day                | Google App Password         |
| Firebase FCM     | Push notifications   | Unlimited              | console.firebase.google.com |
| Google OAuth     | Social login         | Free                   | console.cloud.google.com    |
| HuggingFace API  | AI/NLP features      | Free inference API     | huggingface.co              |
| GitHub Actions   | CI/CD pipeline       | 2000 min/month         | github.com                  |

---

## 11. COMPLETE FOLDER STRUCTURE

```
SafeBuy/
+-- ARCHITECTURE.md
+-- API_REFERENCE.md               <- Complete REST API documentation
+-- README.md
|
+-- Backend/                        <- NestJS API (deploy to Railway/Render)
|   +-- src/
|   |   +-- main.ts                 <- Bootstrap, Swagger, Helmet, graceful shutdown
|   |   +-- app.module.ts           <- Root module + middleware registration + Joi validation
|   |   +-- config/
|   |   |   +-- configuration.ts    <- Typed config factory (all env vars)
|   |   |   +-- env.validation.ts   <- Joi schema for startup env validation
|   |   +-- database/
|   |   |   +-- seeds/
|   |   |       +-- seeder.ts       <- Standalone seed: super admin + root categories
|   |   +-- common/
|   |   |   +-- decorators/
|   |   |   |   +-- current-user.decorator.ts
|   |   |   |   +-- public.decorator.ts
|   |   |   |   +-- roles.decorator.ts
|   |   |   +-- guards/
|   |   |   |   +-- jwt-auth.guard.ts
|   |   |   |   +-- roles.guard.ts
|   |   |   +-- filters/
|   |   |   |   +-- http-exception.filter.ts  <- HttpException + Mongoose + duplicate key
|   |   |   |   +-- ws-exception.filter.ts    <- WebSocket WsException filter
|   |   |   +-- interceptors/
|   |   |   |   +-- transform.interceptor.ts  <- Wrap { success, data, statusCode }
|   |   |   |   +-- logging.interceptor.ts    <- Log controller+handler+duration
|   |   |   |   +-- timeout.interceptor.ts    <- 30 s request timeout
|   |   |   +-- middleware/
|   |   |   |   +-- request-id.middleware.ts  <- X-Request-ID UUID on every req
|   |   |   |   +-- logger.middleware.ts      <- Coloured HTTP access log
|   |   |   |   +-- ban-check.middleware.ts   <- 403 if user is banned/inactive
|   |   |   +-- pipes/
|   |   |   |   +-- parse-objectid.pipe.ts    <- Validate MongoDB ObjectId params
|   |   |   |   +-- sanitize-html.pipe.ts     <- Strip HTML from string inputs
|   |   |   +-- interfaces/
|   |   |   |   +-- jwt-payload.interface.ts
|   |   |   |   +-- pagination.interface.ts
|   |   |   +-- dto/
|   |   |   |   +-- pagination.dto.ts         <- page + limit DTO
|   |   |   |   +-- id-param.dto.ts           <- @IsMongoId() id param
|   |   |   +-- constants/
|   |   |   |   +-- app.constants.ts          <- BCRYPT_ROUNDS, ROLES, limits
|   |   |   |   +-- error-messages.constants.ts <- Typed error strings
|   |   |   +-- utils/
|   |   |       +-- slug.util.ts              <- slugify() + uniqueSlug()
|   |   |       +-- pagination.util.ts        <- buildPaginatedResult() + toSkipLimit()
|   |   |       +-- order-number.util.ts      <- generateOrderNumber() SB-YYYYMMDD-XXXXX
|   |   +-- modules/
|   |       +-- auth/          (controller, service, module, strategies, dto)
|   |       +-- users/         (controller, service, module, schema, dto)
|   |       +-- sellers/       (controller, service, module, schema, dto)
|   |       +-- products/      (controller, service, module, schema, dto)
|   |       +-- categories/    (controller, service, module, schema, dto)
|   |       +-- cart/          (controller, service, module, schema, dto)
|   |       +-- orders/        (controller, service, module, schema, dto)
|   |       +-- payments/      (controller, service, module, schema, dto)
|   |       +-- reviews/       (controller, service, module, schema, dto)
|   |       +-- coupons/       (controller, service, module, schema, dto)
|   |       +-- delivery/      (controller, service, module — courier adapters)
|   |       +-- notifications/ (controller, service, module, schema)
|   |       +-- chat/          (controller, gateway, service, module, schemas)
|   |       +-- ai/            (controller, service, module)
|   |       +-- upload/        (controller, service, module — Cloudinary)
|   |       +-- admin/         (controller, service, module)
|   +-- .env.example
|   +-- tsconfig.json
|   +-- package.json
|
+-- Frontend/                       <- Next.js 14 (deploy to Vercel)
|   +-- app/
|   |   +-- (public)/
|   |   +-- (buyer)/
|   |   +-- (seller)/
|   |   +-- (admin)/
|   +-- components/
|   +-- store/                      (Redux Toolkit)
|   +-- hooks/
|   +-- lib/
|   +-- types/
|   +-- public/
|   +-- next.config.ts
|   +-- tailwind.config.ts
|   +-- package.json
|
+-- Mobile/                         <- React Native Expo
    +-- app/
    |   +-- (tabs)/
    |   +-- auth/
    |   +-- product/
    |   +-- checkout/
    |   +-- payment/
    |   +-- seller-dashboard/
    +-- components/
    +-- store/
    +-- hooks/
    +-- lib/
    +-- app.json
    +-- package.json
```
