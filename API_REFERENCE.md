# SafeBuy — Complete REST API Reference

> **Base URL:** `https://api.safebuy.com/api/v1`  
> **Local dev:** `http://localhost:5000/api/v1`  
> **Auth:** Bearer JWT in `Authorization: Bearer <accessToken>` header  
> **Content-Type:** `application/json` (unless stated otherwise)  
> **All success responses** are wrapped:  
> ```json
> { "success": true, "statusCode": 200, "message": "OK", "data": {…}, "timestamp": "…" }
> ```
> **All error responses:**
> ```json
> { "success": false, "statusCode": 4xx|5xx, "message": "…", "path": "…", "timestamp": "…" }
> ```

---

## Legend

| Symbol | Meaning |
|--------|---------|
| 🔓 | Public — no token required |
| 🔑 | Authenticated user (any role) |
| 🛒 | Customer only |
| 🏪 | Seller only |
| 🛡️ | Admin or Super Admin |
| 👑 | Super Admin only |

---

## Table of Contents

1. [Auth](#1-auth)
2. [Users](#2-users)
3. [Sellers](#3-sellers)
4. [Products](#4-products)
5. [Categories](#5-categories)
6. [Cart](#6-cart)
7. [Orders](#7-orders)
8. [Payments](#8-payments)
9. [Reviews](#9-reviews)
10. [Coupons](#10-coupons)
11. [Delivery](#11-delivery)
12. [Notifications](#12-notifications)
13. [Chat](#13-chat)
14. [AI Services](#14-ai-services)
15. [Upload](#15-upload)
16. [Admin](#16-admin)
17. [WebSocket Events](#17-websocket-events)

---

## 1. Auth

Base path: `/auth`  
Rate limits: register/login → 5 req/min; forgot-password → 3 req/min

---

### POST `/auth/register` 🔓

Register a new customer account.

**Request Body**
```json
{
  "name":     "John Doe",           // string, 2–50 chars, required
  "email":    "john@example.com",   // valid email, required
  "phone":    "01712345678",        // string, optional
  "password": "StrongPass@123"      // 8–32 chars, must contain upper+lower+digit+special
}
```

**Response `201`**
```json
{
  "data": {
    "message": "Registration successful. Please verify your email.",
    "userId": "64f1a2b3c4d5e6f7a8b9c0d1"
  }
}
```

**Validation errors `400`**
- `name` < 2 or > 50 chars
- invalid `email`
- `password` fails regex
- duplicate email → `409 Conflict`

---

### POST `/auth/login` 🔓

Login with email + password. Returns JWT pair.

**Request Body**
```json
{
  "email":    "john@example.com",
  "password": "StrongPass@123"
}
```

**Response `200`**
```json
{
  "data": {
    "accessToken":  "eyJhbGci…",
    "refreshToken": "eyJhbGci…",
    "user": {
      "_id":    "64f1…",
      "name":   "John Doe",
      "email":  "john@example.com",
      "role":   "customer",
      "avatar": ""
    }
  }
}
```

**Errors**
- `401` — invalid credentials  
- `403` — account banned  
- `403` — email not verified

---

### GET `/auth/verify-email/:token` 🔓

Verify email address via token sent in welcome email.

**Params:** `token` — UUID token from email link

**Response `200`**
```json
{ "data": { "message": "Email verified successfully." } }
```

**Errors:** `400` token invalid/expired

---

### POST `/auth/forgot-password` 🔓

Send password reset email.

**Request Body**
```json
{ "email": "john@example.com" }
```

**Response `200`** — always returns success to prevent email enumeration
```json
{ "data": { "message": "If this email exists, a reset link has been sent." } }
```

---

### POST `/auth/reset-password/:token` 🔓

Reset password using token from email.

**Params:** `token` — UUID token from email link

**Request Body**
```json
{
  "password": "NewStrongPass@456"   // same rules as registration
}
```

**Response `200`**
```json
{ "data": { "message": "Password reset successfully." } }
```

**Errors:** `400` — token invalid/expired

---

### POST `/auth/refresh` 🔑

Refresh access token using refresh token.

**Request Body**
```json
{ "refreshToken": "eyJhbGci…" }
```

**Response `200`**
```json
{
  "data": {
    "accessToken":  "eyJhbGci…",
    "refreshToken": "eyJhbGci…"
  }
}
```

**Errors:** `401` — refresh token invalid/expired/revoked

---

### POST `/auth/logout` 🔑

Revoke refresh token.

**Response `200`**
```json
{ "data": { "message": "Logged out successfully." } }
```

---

### GET `/auth/google` 🔓

Redirect to Google OAuth consent screen.  
*(Browser redirect — not a JSON endpoint)*

---

### GET `/auth/google/callback` 🔓

Google OAuth callback. Redirects browser to:  
`{FRONTEND_URL}/auth/social-callback?token=<accessToken>&refresh=<refreshToken>`

---

## 2. Users

Base path: `/users`

---

### GET `/users/me` 🔑

Get current user's profile.

**Response `200`**
```json
{
  "data": {
    "_id":              "64f1…",
    "name":             "John Doe",
    "email":            "john@example.com",
    "phone":            "01712345678",
    "avatar":           "https://res.cloudinary.com/…",
    "role":             "customer",
    "isEmailVerified":  true,
    "addresses": [
      {
        "_id":       "64f2…",
        "label":     "Home",
        "fullName":  "John Doe",
        "phone":     "01712345678",
        "street":    "123 Main St",
        "city":      "Dhaka",
        "state":     "Dhaka",
        "zip":       "1212",
        "country":   "Bangladesh",
        "isDefault": true
      }
    ],
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

---

### PUT `/users/me` 🔑

Update user profile.

**Request Body** (all fields optional)
```json
{
  "name":   "John Updated",
  "phone":  "01887654321",
  "avatar": "https://res.cloudinary.com/…"
}
```

**Response `200`** — updated user document

---

### POST `/users/me/addresses` 🔑

Add a new shipping address.

**Request Body**
```json
{
  "label":     "Office",           // string, optional (default "Home")
  "fullName":  "John Doe",         // required
  "phone":     "01712345678",      // required
  "street":    "456 Business Ave", // required
  "city":      "Chittagong",       // required
  "state":     "Chittagong",       // required
  "zip":       "4000",             // optional
  "country":   "Bangladesh",       // optional (default "Bangladesh")
  "isDefault": false               // optional
}
```

**Response `201`** — full user with updated addresses

---

### PUT `/users/me/addresses/:id` 🔑

Update a specific address.

**Params:** `id` — MongoDB ObjectId of address  
**Request Body** — same shape as POST (all fields optional)  
**Response `200`** — updated user

---

### DELETE `/users/me/addresses/:id` 🔑

Delete an address.

**Params:** `id` — address ObjectId  
**Response `200`** — `{ "message": "Address removed." }`

---

### GET `/users/me/wishlist` 🔑

Get user's wishlist.

**Response `200`**
```json
{
  "data": {
    "wishlist": [
      {
        "_id":     "64f3…",
        "title":   "iPhone 15 Pro",
        "slug":    "iphone-15-pro",
        "images":  ["https://…"],
        "basePrice":     150000,
        "discountPrice": 140000
      }
    ]
  }
}
```

---

### POST `/users/me/wishlist/:productId` 🔑

Toggle product in wishlist (add if absent, remove if present).

**Params:** `productId` — MongoDB ObjectId  
**Response `200`**
```json
{ "data": { "added": true, "message": "Added to wishlist." } }
// or
{ "data": { "added": false, "message": "Removed from wishlist." } }
```

---

### GET `/users` 🛡️

List all users (admin).

**Query Parameters**
| Param    | Type    | Default | Description              |
|----------|---------|---------|--------------------------|
| `page`   | number  | 1       | Page number              |
| `limit`  | number  | 20      | Results per page (max 100) |
| `role`   | string  |         | Filter by role           |
| `q`      | string  |         | Search by name/email     |
| `status` | string  |         | `active` / `banned`      |

**Response `200`**
```json
{
  "data": {
    "items": [ {…user…} ],
    "total": 1420,
    "page":  1,
    "limit": 20,
    "totalPages": 71
  }
}
```

---

### PUT `/users/:id/status` 🛡️

Activate or deactivate a user.

**Params:** `id` — user ObjectId  
**Request Body**
```json
{ "isActive": false }
```

**Response `200`** — updated user

---

## 3. Sellers

Base path: `/sellers`

---

### POST `/sellers/register` 🔑

Apply to become a seller (any authenticated user).

**Request Body**
```json
{
  "shopName":        "Tech Haven BD",          // required, 3–100 chars
  "shopSlug":        "tech-haven-bd",          // optional, auto-generated if omitted
  "description":     "Best tech store in BD",  // optional
  "phone":           "01712345678",            // required
  "address": {
    "street":  "12 Gulshan Ave",
    "city":    "Dhaka",
    "state":   "Dhaka",
    "zip":     "1212"
  },
  "bankInfo": {
    "accountHolder": "John Doe",
    "bankName":      "Dutch Bangla Bank",
    "accountNumber": "1234567890",
    "bkashNumber":   "01712345678",
    "nagadNumber":   "01712345678"
  },
  "nidNumber":  "1234567890",    // National ID, optional
  "tradeLicenseNumber": "TL-001" // optional
}
```

**Response `201`**
```json
{
  "data": {
    "message": "Seller application submitted. Pending admin approval.",
    "sellerId": "64f4…"
  }
}
```

**Errors:** `409` — user is already a seller  

---

### GET `/sellers/me` 🏪

Get own seller profile.

**Response `200`** — full seller document including analytics summary

---

### PUT `/sellers/me` 🏪

Update seller profile.

**Request Body** (all optional)
```json
{
  "shopName":    "Updated Shop Name",
  "description": "Updated description",
  "logo":        "https://res.cloudinary.com/…",
  "banner":      "https://res.cloudinary.com/…",
  "phone":       "01887654321",
  "address":     { "city": "Chittagong" },
  "bankInfo":    { "bkashNumber": "01887654321" }
}
```

**Response `200`** — updated seller document

---

### GET `/sellers/me/analytics` 🏪

Seller dashboard analytics.

**Query Parameters**
| Param    | Type   | Default | Description               |
|----------|--------|---------|---------------------------|
| `period` | string | `30d`   | `7d` / `30d` / `90d` / `1y` |

**Response `200`**
```json
{
  "data": {
    "totalRevenue":    45000,
    "totalOrders":     120,
    "pendingOrders":   8,
    "totalProducts":   45,
    "activeProducts":  40,
    "avgRating":       4.6,
    "totalReviews":    89,
    "revenueChart":    [ { "date": "2024-01-01", "amount": 1500 } ],
    "topProducts":     [ { "title": "iPhone 15", "orders": 12, "revenue": 18000 } ]
  }
}
```

---

### GET `/sellers/:slug` 🔓

Public seller store page.

**Params:** `slug` — shop slug  
**Response `200`** — public seller info + top products

---

### GET `/sellers` 🛡️

List all seller applications (admin).

**Query Parameters:** `page`, `limit`, `status` (`pending`/`approved`/`rejected`/`suspended`)

---

### PUT `/sellers/:id/status` 🛡️

Approve, reject, or suspend a seller.

**Params:** `id` — seller ObjectId  
**Request Body**
```json
{
  "status": "approved",            // "approved" | "rejected" | "suspended"
  "note":   "All documents valid"  // optional reason
}
```

---

## 4. Products

Base path: `/products`

---

### GET `/products` 🔓

Browse / search products.

**Query Parameters**
| Param         | Type    | Description                                  |
|---------------|---------|----------------------------------------------|
| `q`           | string  | Full-text search query                       |
| `category`    | string  | Category slug or ObjectId                    |
| `subCategory` | string  | Sub-category slug or ObjectId                |
| `brand`       | string  | Brand name                                   |
| `seller`      | string  | Seller ObjectId                              |
| `minPrice`    | number  | Minimum price (BDT)                          |
| `maxPrice`    | number  | Maximum price (BDT)                          |
| `rating`      | number  | Minimum average rating (1–5)                 |
| `isFeatured`  | boolean | Featured products only                       |
| `isFlashSale` | boolean | Flash-sale products only                     |
| `isDailyDeal` | boolean | Daily-deal products only                     |
| `sort`        | string  | `price_asc` / `price_desc` / `newest` / `rating` / `popular` |
| `page`        | number  | Default 1                                    |
| `limit`       | number  | Default 20, max 100                          |

**Response `200`** — paginated product list with `total`, `page`, `limit`, `totalPages`

---

### GET `/products/featured` 🔓

Featured products (home page spotlight).

**Query:** `limit` (default 10)  
**Response `200`** — array of featured product summaries

---

### GET `/products/flash-sale` 🔓

Active flash-sale products (expires within `flashSaleEnd`).

**Query:** `page`, `limit`  
**Response `200`** — paginated, includes `flashSaleEnd` timestamp per product

---

### GET `/products/daily-deals` 🔓

Today's daily deal products.

**Query:** `page`, `limit`  
**Response `200`** — paginated daily deals

---

### GET `/products/:slug` 🔓

Full product detail page.

**Params:** `slug` — product slug  
**Response `200`**
```json
{
  "data": {
    "_id":           "64f5…",
    "title":         "iPhone 15 Pro 256GB",
    "slug":          "iphone-15-pro-256gb",
    "description":   "Full product description…",
    "images":        ["https://…"],
    "video":         "",
    "basePrice":     180000,
    "discountPrice": 170000,
    "stock":         50,
    "category":      { "_id": "…", "name": "Electronics", "slug": "electronics" },
    "seller":        { "_id": "…", "shopName": "Tech Haven BD", "slug": "tech-haven-bd", "avgRating": 4.7 },
    "variants": [
      {
        "name": "Storage",
        "options": [
          { "value": "256GB", "priceModifier": 0, "stock": 30 },
          { "value": "512GB", "priceModifier": 10000, "stock": 20 }
        ]
      }
    ],
    "specifications": [ { "key": "Display", "value": "6.1\" Super Retina XDR" } ],
    "tags":           ["apple", "smartphone"],
    "avgRating":      4.8,
    "reviewCount":    124,
    "soldCount":      340,
    "status":         "active",
    "createdAt":      "2024-01-10T08:00:00Z"
  }
}
```

---

### POST `/products` 🏪

Create a new product.

**Request Body**
```json
{
  "title":         "Samsung Galaxy S24",    // required, min 3 chars
  "description":   "Flagship Android phone…", // required, min 10 chars
  "category":      "64f6…",                // required, MongoDB ObjectId
  "subCategory":   "64f7…",               // optional ObjectId
  "brand":         "Samsung",             // optional
  "basePrice":     120000,                // required, ≥ 0
  "discountPrice": 110000,                // optional, ≥ 0
  "stock":         100,                   // required, ≥ 0
  "images":        ["https://…"],          // optional array of Cloudinary URLs
  "video":         "https://…",           // optional
  "variants": [
    {
      "name": "Color",
      "options": [
        { "value": "Phantom Black", "priceModifier": 0, "stock": 50, "sku": "S24-BLK" },
        { "value": "Cream", "priceModifier": 0, "stock": 50, "sku": "S24-CRM" }
      ]
    }
  ],
  "specifications": [
    { "key": "Processor", "value": "Exynos 2400" }
  ],
  "tags":         ["samsung", "android"],
  "isFeatured":   false,
  "isFlashSale":  false,
  "isDailyDeal":  false,
  "weight":       0.167
}
```

**Response `201`** — created product document  
**Errors:** `403` seller not approved; `400` validation errors

---

### PUT `/products/:id` 🏪

Update own product.

**Params:** `id` — product ObjectId  
**Request Body** — same as POST (all fields optional for partial update)  
**Errors:** `403` if product belongs to different seller

---

### DELETE `/products/:id` 🏪

Soft-delete own product (status → `deleted`).

**Params:** `id` — product ObjectId  
**Response `200`** — `{ "message": "Product deleted." }`

---

### GET `/products/seller/my-products` 🏪

List authenticated seller's own products.

**Query:** `page`, `limit`, `status` (`active`/`inactive`/`out_of_stock`/`deleted`), `q`

---

## 5. Categories

Base path: `/categories`

---

### GET `/categories` 🔓

All active categories (flat list with parent/level info).

**Response `200`**
```json
{
  "data": [
    {
      "_id":        "64f8…",
      "name":       "Electronics",
      "slug":       "electronics",
      "icon":       "💻",
      "image":      "https://…",
      "parent":     null,
      "level":      0,
      "order":      1,
      "productCount": 412,
      "commissionRate": 8
    }
  ]
}
```

---

### GET `/categories/:slug` 🔓

Single category with children.

**Params:** `slug` — category slug  
**Response `200`** — category document + populated `children` array

---

### POST `/categories` 🛡️

Create a new category.

**Request Body**
```json
{
  "name":           "Tablets",         // required
  "slug":           "tablets",         // optional, auto-generated
  "icon":           "📱",              // optional
  "image":          "https://…",       // optional Cloudinary URL
  "description":    "Tablet devices",  // optional
  "parent":         "64f8…",          // optional ObjectId (null = root)
  "order":          2,                 // optional display order
  "commissionRate": 8,                 // optional 0–100 (default 10)
  "metaTitle":      "Buy Tablets",     // optional SEO
  "metaDescription":"Shop tablets…"   // optional SEO
}
```

**Response `201`** — created category

---

### PUT `/categories/:id` 🛡️

Update a category.

**Params:** `id`  
**Request Body** — any fields from POST  
**Response `200`** — updated category

---

### DELETE `/categories/:id` 🛡️

Delete a category (must have no products or children).

**Response `200`** — `{ "message": "Category deleted." }`  
**Errors:** `409` — category has active products

---

## 6. Cart

Base path: `/cart`

---

### GET `/cart` 🔑

Get current user's cart with populated products.

**Response `200`**
```json
{
  "data": {
    "_id":    "64f9…",
    "items": [
      {
        "_id":      "64fa…",
        "product":  { "_id": "…", "title": "iPhone 15", "images": ["…"], "discountPrice": 140000, "stock": 30 },
        "quantity": 2,
        "variant":  { "Color": "Black" },
        "addedAt":  "2024-01-20T10:00:00Z",
        "savedForLater": false
      }
    ],
    "coupon": null,
    "subtotal":      280000,
    "discount":      0,
    "total":         280000
  }
}
```

---

### POST `/cart/items` 🔑

Add item to cart (merges with existing item if same product+variant).

**Request Body**
```json
{
  "productId": "64f5…",                    // required, ObjectId
  "quantity":  1,                          // required, ≥ 1
  "variant":   { "Color": "Black" }        // optional
}
```

**Response `200`** — updated cart  
**Errors:** `400` — quantity exceeds available stock

---

### PUT `/cart/items/:id` 🔑

Update cart item quantity.

**Params:** `id` — cart item ObjectId  
**Request Body**
```json
{ "quantity": 3 }   // required, ≥ 1
```

**Response `200`** — updated cart

---

### DELETE `/cart/items/:id` 🔑

Remove item from cart.

**Params:** `id` — cart item ObjectId  
**Response `200`** — updated cart

---

### PUT `/cart/items/:id/save-for-later` 🔑

Toggle item between cart and saved-for-later.

**Params:** `id` — cart item ObjectId  
**Response `200`** — updated cart

---

## 7. Orders

Base path: `/orders`

---

### POST `/orders` 🔑

Place a new order (splits into per-seller sub-orders internally).

**Request Body**
```json
{
  "items": [
    {
      "productId": "64f5…",  // required ObjectId
      "quantity":  2,         // required ≥ 1
      "variant":   { "Storage": "256GB" }  // optional
    }
  ],
  "shippingAddress": {
    "label":    "Home",
    "name":     "John Doe",
    "phone":    "01712345678",
    "street":   "123 Main St",
    "city":     "Dhaka",
    "state":    "Dhaka",
    "zip":      "1212",
    "country":  "Bangladesh"
  },
  "paymentMethod": "bkash",         // "bkash"|"nagad"|"rocket"|"bank_transfer"|"cod"
  "couponCode":    "SAVE10"         // optional
}
```

**Response `201`**
```json
{
  "data": {
    "orderNumber":   "SB-20240120-A7F3K",
    "orderId":       "64fb…",
    "paymentMethod": "bkash",
    "total":         280000,
    "status":        "pending",
    "message":       "Order placed. Please complete payment within 30 minutes."
  }
}
```

**Errors:** `400` — out-of-stock item; `404` — product not found

---

### GET `/orders` 🔑

Customer's order history.

**Query Parameters**
| Param    | Type   | Description                           |
|----------|--------|---------------------------------------|
| `status` | string | Filter by order status                |
| `page`   | number | Default 1                             |
| `limit`  | number | Default 10                            |

**Response `200`** — paginated order list

---

### GET `/orders/seller/orders` 🏪

Seller's incoming orders.

**Query Parameters:** `status`, `page`, `limit`  
**Response `200`** — paginated orders for seller's products

---

### GET `/orders/:id` 🔑

Full order details.

**Params:** `id` — order ObjectId  
**Response `200`** — full order with items, shipping address, payment, delivery info

---

### PUT `/orders/:id/cancel` 🔑

Customer cancels an order (only when `pending` or `confirmed`).

**Params:** `id`  
**Request Body**
```json
{ "reason": "Changed my mind" }   // optional
```

**Response `200`** — updated order with `status: "cancelled"`  
**Errors:** `400` — order already shipped

---

### POST `/orders/:id/return` 🔑

Request a return / refund (only when `delivered`).

**Params:** `id`  
**Request Body**
```json
{
  "reason":  "Item damaged on arrival",
  "details": "Box was crushed, screen cracked",
  "images":  ["https://res.cloudinary.com/…"]   // optional evidence
}
```

**Response `200`** — order with `status: "return_requested"`

---

### PUT `/orders/:id/items/:index/status` 🏪

Seller updates the fulfillment status of an order item.

**Params:** `id` — order ObjectId, `index` — item array index  
**Request Body**
```json
{
  "status":         "shipped",              // "confirmed"|"processing"|"shipped"|"delivered"
  "trackingNumber": "PTHAO-987654321",      // required when status = "shipped"
  "courier":        "pathao",              // required when status = "shipped"
  "note":           "Shipped via Pathao"   // optional
}
```

**Response `200`** — updated order

---

## 8. Payments

Base path: `/payments`

---

### GET `/payments/instructions/:method` 🔓

Get payment account details to display on checkout page.

**Params:** `method` — `bkash` | `nagad` | `rocket` | `bank_transfer`

**Response `200`**
```json
{
  "data": {
    "method":         "bkash",
    "accountNumber":  "01752962104",
    "instructions": [
      "Open your bKash app",
      "Go to 'Send Money'",
      "Enter number: 01752962104",
      "Enter the exact order amount",
      "Note the Transaction ID",
      "Submit the Transaction ID below"
    ]
  }
}
```

---

### POST `/payments/submit` 🔑

Submit payment proof after sending money.

**Request Body**
```json
{
  "orderId":       "64fb…",            // required ObjectId
  "method":        "bkash",           // "bkash"|"nagad"|"rocket"|"bank_transfer"
  "transactionId": "8M9KQ7LNPF",      // required, from payment app
  "senderNumber":  "01712345678",      // optional but recommended
  "screenshot":    "https://res.cloudinary.com/…"  // optional Cloudinary URL
}
```

**Response `200`**
```json
{
  "data": {
    "message": "Payment submitted. Auto-verification in progress.",
    "paymentId": "64fc…",
    "status": "pending"
  }
}
```

**Errors:** `409` — transaction ID already used; `404` — order not found

---

### GET `/payments/my-payments` 🔑

Current user's payment history.

**Query:** `page`, `limit`, `status` (`pending`/`confirmed`/`rejected`)  
**Response `200`** — paginated payments list

---

### GET `/payments/admin/all` 🛡️

All payments (admin view).

**Query:** `page`, `limit`, `status`, `method`, `startDate`, `endDate`  
**Response `200`** — paginated payments with order and user info

---

### PUT `/payments/admin/:id/status` 🛡️

Manually confirm or reject a payment.

**Params:** `id` — payment ObjectId  
**Request Body**
```json
{
  "status": "confirmed",            // "confirmed" | "rejected" | "reviewed"
  "note":   "Verified in bKash app" // optional
}
```

**Response `200`** — updated payment; triggers order activation if confirmed

---

## 9. Reviews

Base path: `/reviews`

---

### GET `/reviews/product/:productId` 🔓

Paginated reviews for a product.

**Params:** `productId` — product ObjectId  
**Query Parameters**
| Param    | Type   | Description                             |
|----------|--------|-----------------------------------------|
| `rating` | number | Filter by star rating (1–5)             |
| `sort`   | string | `newest` / `oldest` / `most_helpful`    |
| `page`   | number | Default 1                               |
| `limit`  | number | Default 10                              |

**Response `200`**
```json
{
  "data": {
    "items": [
      {
        "_id":    "64fd…",
        "user":   { "name": "John D.", "avatar": "…" },
        "rating": 5,
        "title":  "Excellent product!",
        "body":   "Works perfectly, fast delivery.",
        "images": ["https://…"],
        "isVerifiedPurchase": true,
        "helpfulCount": 12,
        "sellerReply": null,
        "createdAt": "2024-01-18T09:00:00Z"
      }
    ],
    "total":      124,
    "avgRating":  4.8,
    "ratingBreakdown": { "5": 90, "4": 20, "3": 8, "2": 4, "1": 2 }
  }
}
```

---

### POST `/reviews/product/:productId` 🔑

Submit a review (must have a delivered order for this product).

**Params:** `productId`  
**Request Body**
```json
{
  "rating": 5,                         // required, 1–5
  "title":  "Great phone!",            // optional
  "body":   "Battery life is amazing", // required, min 10 chars
  "images": ["https://…"]              // optional, max 5
}
```

**Response `201`** — created review  
**Errors:** `403` — no delivered order for this product; `409` — already reviewed

---

### PUT `/reviews/:id/helpful` 🔑

Mark a review as helpful (toggle).

**Params:** `id` — review ObjectId  
**Response `200`** — `{ "helpfulCount": 13, "marked": true }`

---

### PUT `/reviews/:id/seller-reply` 🏪

Seller replies to a review on their product.

**Params:** `id` — review ObjectId  
**Request Body**
```json
{ "reply": "Thank you for your kind feedback!" }  // required, min 5 chars
```

**Response `200`** — updated review with `sellerReply`

---

### DELETE `/reviews/:id` 🔑

Delete own review (or admin deletes any review).

**Params:** `id`  
**Response `200`** — `{ "message": "Review deleted." }`

---

## 10. Coupons

Base path: `/coupons`

---

### POST `/coupons/validate` 🔑

Validate and preview discount for a coupon code.

**Request Body**
```json
{
  "code":    "SAVE10",   // required
  "cartTotal": 50000     // required, for minimum order check
}
```

**Response `200`**
```json
{
  "data": {
    "valid":          true,
    "code":           "SAVE10",
    "type":           "percentage",     // "percentage" | "fixed" | "free_shipping"
    "value":          10,               // 10% off
    "discount":       5000,             // BDT discount on this cart
    "newTotal":       45000,
    "expiresAt":      "2024-02-01T00:00:00Z"
  }
}
```

**Errors:** `400` — expired / usage limit reached / minimum order not met

---

### POST `/coupons` 🛡️

Create a coupon.

**Request Body**
```json
{
  "code":              "NEWYEAR25",    // required, unique, uppercase alphanumeric
  "type":              "percentage",   // "percentage" | "fixed" | "free_shipping"
  "value":             25,             // required (discount %)
  "minOrderAmount":    1000,           // optional minimum cart value
  "maxDiscountAmount": 5000,           // optional cap on percentage discount
  "usageLimit":        500,            // optional total uses
  "perUserLimit":      1,              // optional uses per user
  "applicableTo":      "all",          // "all" | "category" | "product" | "seller"
  "applicableIds":     [],             // ObjectIds when not "all"
  "expiresAt":         "2024-12-31T23:59:59Z",  // optional
  "isActive":          true
}
```

**Response `201`** — created coupon

---

### GET `/coupons` 🛡️

List all coupons.

**Query:** `page`, `limit`, `isActive` (boolean), `q` (search code)

---

### PATCH `/coupons/:id` 🛡️

Update coupon (e.g., toggle active, extend expiry).

**Request Body** — any fields from POST  
**Response `200`** — updated coupon

---

### DELETE `/coupons/:id` 🛡️

Delete a coupon.

**Response `200`** — `{ "message": "Coupon deleted." }`

---

## 11. Delivery

Base path: `/delivery`

---

### GET `/delivery/rates` 🔑

Calculate delivery rates from all available couriers.

**Query Parameters**
| Param    | Type   | Required | Description           |
|----------|--------|----------|-----------------------|
| `weight` | number | ✓        | Package weight in kg  |
| `origin` | string | ✓        | Origin city           |
| `dest`   | string | ✓        | Destination city      |

**Response `200`**
```json
{
  "data": [
    { "courier": "pathao",    "rate": 80,  "estimatedDays": 2 },
    { "courier": "steadfast", "rate": 75,  "estimatedDays": 3 },
    { "courier": "delivro",   "rate": 70,  "estimatedDays": 3 },
    { "courier": "manual",    "rate": 0,   "estimatedDays": null }
  ]
}
```

---

### GET `/delivery/track/:courier/:trackingNumber` 🔑

Track a shipment by courier and tracking number.

**Params:** `courier` — `pathao` | `steadfast` | `delivro` | `sundarban`; `trackingNumber`  
**Response `200`**
```json
{
  "data": {
    "trackingNumber": "PTHAO-987654321",
    "courier":        "pathao",
    "status":         "in_transit",
    "location":       "Dhaka Hub",
    "lastUpdated":    "2024-01-20T14:00:00Z",
    "timeline": [
      { "status": "picked_up",  "timestamp": "2024-01-19T10:00:00Z" },
      { "status": "in_transit", "timestamp": "2024-01-20T08:00:00Z" }
    ]
  }
}
```

---

### POST `/delivery/pathao/:orderId` 🏪

Create Pathao shipment for an order.

**Params:** `orderId`  
**Request Body**
```json
{
  "weight":      0.5,
  "itemType":    "parcel",
  "deliveryType": 48       // 48hr delivery
}
```

**Response `201`** — `{ "trackingNumber": "PTHAO-…", "consignmentId": "…" }`

---

### POST `/delivery/manual/:orderId` 🏪

Add manual tracking for couriers not in the system (Sundarban, etc.).

**Params:** `orderId`  
**Request Body**
```json
{
  "courier":        "sundarban",
  "trackingNumber": "SB-2024-001",
  "note":           "Call 01712345678 for pickup"
}
```

**Response `200`** — updated order with tracking info

---

## 12. Notifications

Base path: `/notifications`

---

### GET `/notifications` 🔑

Get user's notifications.

**Query Parameters**
| Param      | Type    | Description                        |
|------------|---------|------------------------------------|
| `unread`   | boolean | `true` = unread only               |
| `type`     | string  | Filter by type (order/payment/etc) |
| `page`     | number  | Default 1                          |
| `limit`    | number  | Default 20                         |

**Response `200`**
```json
{
  "data": {
    "items": [
      {
        "_id":      "64fe…",
        "type":     "order_confirmed",
        "title":    "Order Confirmed",
        "body":     "Your order SB-20240120-A7F3K has been confirmed.",
        "link":     "/orders/64fb…",
        "isRead":   false,
        "createdAt":"2024-01-20T11:00:00Z"
      }
    ],
    "total":       25,
    "unreadCount": 3
  }
}
```

---

### PUT `/notifications/:id/read` 🔑

Mark a single notification as read.

**Params:** `id`  
**Response `200`** — `{ "message": "Marked as read." }`

---

### PUT `/notifications/read-all` 🔑

Mark all notifications as read.

**Response `200`** — `{ "message": "All notifications marked as read." }`

---

## 13. Chat

Base path: `/chat`  
Real-time: WebSocket (see [Section 17](#17-websocket-events))

---

### GET `/chat/conversations` 🔑

List all chat conversations for the current user.

**Response `200`**
```json
{
  "data": [
    {
      "_id":            "64ff…",
      "otherUser":      { "_id": "…", "name": "Tech Haven BD", "avatar": "…" },
      "lastMessage":    { "body": "Is this still available?", "sentAt": "2024-01-20T12:00:00Z" },
      "product":        { "_id": "…", "title": "iPhone 15 Pro", "images": ["…"] },
      "unreadCount":    2
    }
  ]
}
```

---

### GET `/chat/messages/:otherUserId` 🔑

Message history with a specific user.

**Params:** `otherUserId` — the other participant's ObjectId  
**Query:** `page` (default 1), `limit` (default 30)  
**Response `200`** — paginated messages, newest first

---

### GET `/chat/unread-count` 🔑

Total unread message count across all conversations.

**Response `200`** — `{ "data": { "count": 5 } }`

---

## 14. AI Services

Base path: `/ai`

---

### GET `/ai/recommendations` 🔓

Personalised product recommendations.

**Query Parameters**
| Param  | Type   | Description                                          |
|--------|--------|------------------------------------------------------|
| `limit`| number | Number of products (default 10, max 30)              |

Recommendations are personalised when the user is authenticated; falls back to popular products for guests.

**Response `200`** — array of product summaries

---

### GET `/ai/search-suggestions` 🔓

Autocomplete search suggestions.

**Query Parameters**
| Param | Type   | Required | Description               |
|-------|--------|----------|---------------------------|
| `q`   | string | ✓        | Partial search query       |

**Response `200`**
```json
{ "data": { "suggestions": ["iPhone 15 Pro", "iPhone 15 Pro Max", "iPhone 15 case"] } }
```

---

### POST `/ai/chatbot` 🔓

AI customer-support chatbot.

**Request Body**
```json
{
  "message":    "How can I track my order?",  // required
  "sessionId":  "sess_abc123"                 // optional for context continuity
}
```

**Response `200`**
```json
{
  "data": {
    "reply":     "You can track your order at /orders → select your order → View Tracking.",
    "sessionId": "sess_abc123",
    "intent":    "order_tracking"
  }
}
```

---

### POST `/ai/generate-description` 🏪

AI-generate a product description from key specs.

**Request Body**
```json
{
  "title":    "Samsung Galaxy S24 Ultra",   // required
  "category": "Smartphones",               // required
  "specs": [                               // optional array of key points
    "6.8\" Dynamic AMOLED 2X",
    "200MP quad camera",
    "5000mAh battery",
    "S Pen included"
  ]
}
```

**Response `200`**
```json
{
  "data": {
    "description": "Experience the pinnacle of Samsung innovation with the Galaxy S24 Ultra…"
  }
}
```

---

### GET `/ai/fraud-check/:userId` 🛡️

Get fraud risk score for a user.

**Params:** `userId`  
**Response `200`**
```json
{
  "data": {
    "userId":    "64f1…",
    "riskScore": 23,              // 0–100 (>70 = high risk)
    "riskLevel": "low",           // "low" | "medium" | "high"
    "flags": [],
    "checkedAt": "2024-01-20T15:00:00Z"
  }
}
```

---

## 15. Upload

Base path: `/upload`  
Content-Type: `multipart/form-data`

---

### POST `/upload/image` 🔑

Upload a single image.

**Form Data**
| Field   | Type | Description                               |
|---------|------|-------------------------------------------|
| `image` | File | JPEG/PNG/WEBP, max 5 MB                   |
| `folder`| string | Optional Cloudinary folder path         |

**Response `201`**
```json
{
  "data": {
    "url":       "https://res.cloudinary.com/safebuy/image/upload/v1/products/abc123.jpg",
    "publicId":  "products/abc123",
    "width":     1200,
    "height":    1200,
    "format":    "jpg"
  }
}
```

**Errors:** `400` — unsupported file type; `413` — file too large

---

### POST `/upload/images` 🔑

Upload multiple images (up to 10).

**Form Data:** field `images` with multiple files  
**Response `201`** — array of upload results (same shape as single)

---

### POST `/upload/product-image` 🏪

Upload + auto-optimize product image (converts to WebP, resizes to 1200×1200).

**Form Data:** `image` field, same rules as above  
**Response `201`** — optimized Cloudinary URL

---

### POST `/upload/avatar` 🔑

Upload user/seller avatar (resized to 200×200 circle crop).

**Form Data:** `avatar` field  
**Response `200`** — `{ "url": "https://res.cloudinary.com/…", "publicId": "…" }`

---

## 16. Admin

Base path: `/admin`  
All endpoints require `admin` or `super_admin` role.

---

### GET `/admin/dashboard` 🛡️

Platform KPIs.

**Response `200`**
```json
{
  "data": {
    "totalUsers":       14200,
    "totalSellers":     340,
    "pendingSellers":   12,
    "totalProducts":    8900,
    "activeProducts":   8200,
    "totalOrders":      52400,
    "pendingOrders":    320,
    "todayOrders":      145,
    "totalRevenue":     48500000,
    "pendingPayments":  28,
    "fraudAlerts":      5,
    "revenueChart": [ { "date": "2024-01-01", "amount": 150000 } ]
  }
}
```

---

### GET `/admin/users` 🛡️

All users with filtering.

**Query:** `page`, `limit`, `role`, `q` (search name/email), `status` (`active`/`banned`)

---

### GET `/admin/users/:id` 🛡️

Full user profile + order history + fraud score.

---

### PATCH `/admin/users/:id/ban` 🛡️

Ban a user.

**Request Body**
```json
{ "reason": "Fraudulent payment submissions" }  // required
```

**Response `200`** — updated user with `isBanned: true`

---

### PATCH `/admin/users/:id/unban` 🛡️

Remove ban from user.

**Response `200`** — updated user with `isBanned: false`

---

### GET `/admin/sellers` 🛡️

List seller applications.

**Query:** `page`, `limit`, `status` (`pending`/`approved`/`rejected`/`suspended`)

---

### PATCH `/admin/sellers/:id/approve` 🛡️

Approve a seller application.

**Response `200`** — seller status → `approved`; triggers welcome email to seller

---

### PATCH `/admin/sellers/:id/reject` 🛡️

Reject seller application.

**Request Body**
```json
{ "reason": "Incomplete documents" }  // required
```

**Response `200`** — seller status → `rejected`

---

### PATCH `/admin/sellers/:id/suspend` 🛡️

Suspend an approved seller.

**Request Body**
```json
{ "reason": "Multiple fraud reports" }  // required
```

**Response `200`** — seller status → `suspended`

---

### GET `/admin/products` 🛡️

All products.

**Query:** `page`, `limit`, `status`, `category`, `seller`, `q`

---

### PATCH `/admin/products/:id/remove` 🛡️

Remove (soft-delete) a product that violates policy.

**Request Body**
```json
{ "reason": "Counterfeit product report" }  // required
```

---

### PATCH `/admin/products/:id/feature` 🛡️

Toggle featured flag on a product.

**Request Body**
```json
{ "isFeatured": true }
```

---

### GET `/admin/orders` 🛡️

All platform orders.

**Query:** `page`, `limit`, `status`, `startDate`, `endDate`, `seller`, `customer`

---

### GET `/admin/payments` 🛡️

All payment submissions.

**Query:** `page`, `limit`, `status`, `method`, `startDate`, `endDate`

---

### PATCH `/admin/payments/:id/confirm` 🛡️

Confirm a payment manually.

**Request Body**
```json
{ "note": "Verified in bKash portal" }  // optional
```

**Response `200`** — payment confirmed; order activated

---

### PATCH `/admin/payments/:id/reject` 🛡️

Reject a payment.

**Request Body**
```json
{ "note": "Transaction ID not found" }  // required
```

---

### PATCH `/admin/payments/:id/review` 🛡️

Flag payment for further review.

---

### POST `/admin/categories` 🛡️

Same as `POST /categories` — see [Section 5](#5-categories).

---

### PATCH `/admin/categories/:id` 🛡️

Same as `PUT /categories/:id`.

---

### DELETE `/admin/categories/:id` 🛡️

Same as `DELETE /categories/:id`.

---

### GET `/admin/reviews` 🛡️

All reviews across the platform.

**Query:** `page`, `limit`, `rating`, `reported` (boolean)

---

### PATCH `/admin/reviews/:id/remove` 🛡️

Remove a review that violates policy.

**Request Body**
```json
{ "reason": "Review contains inappropriate content" }
```

---

## 17. WebSocket Events

**Namespace:** `wss://api.safebuy.com` (root namespace)  
**Auth:** Pass JWT in handshake query: `?token=<accessToken>`

---

### Client → Server

| Event             | Payload                                             | Description                          |
|-------------------|-----------------------------------------------------|--------------------------------------|
| `join_room`       | `{ roomId: string }`                                | Join a chat room (conversation ID)   |
| `leave_room`      | `{ roomId: string }`                                | Leave a chat room                    |
| `send_message`    | `{ receiverId, body, productId?, fileUrl? }`        | Send a chat message                  |
| `typing_start`    | `{ conversationId: string }`                        | Signal typing indicator              |
| `typing_stop`     | `{ conversationId: string }`                        | Stop typing indicator                |
| `mark_read`       | `{ conversationId: string }`                        | Mark messages as read                |

---

### Server → Client

| Event               | Payload                                                        | Description                          |
|---------------------|----------------------------------------------------------------|--------------------------------------|
| `new_message`       | `{ _id, sender, body, sentAt, fileUrl? }`                      | Incoming message                     |
| `message_delivered` | `{ messageId: string }`                                        | Delivery confirmation                |
| `user_typing`       | `{ userId, conversationId, isTyping }`                         | Typing indicator                     |
| `notification`      | `{ type, title, body, link }`                                  | Real-time push notification          |
| `order_update`      | `{ orderId, status, message }`                                 | Live order status change             |
| `payment_update`    | `{ orderId, paymentStatus }`                                   | Payment confirmed/rejected           |
| `error`             | `{ success: false, message: string }`                          | WsException (from WsExceptionFilter) |

---

## Error Code Reference

| HTTP Status | Meaning                                          |
|-------------|--------------------------------------------------|
| `400`       | Validation failed / bad input                    |
| `401`       | Missing or invalid JWT                           |
| `403`       | Forbidden (wrong role, banned, not verified)     |
| `404`       | Resource not found                               |
| `408`       | Request timeout (> 30 seconds)                   |
| `409`       | Conflict (duplicate email, duplicate transaction)|
| `413`       | File too large (> 5 MB)                          |
| `422`       | Unprocessable entity                             |
| `429`       | Rate limit exceeded                              |
| `500`       | Internal server error                            |

---

## Rate Limits

| Endpoint group         | Limit        |
|------------------------|--------------|
| `POST /auth/register`  | 5 / 60 s     |
| `POST /auth/login`     | 5 / 60 s     |
| `POST /auth/forgot-password` | 3 / 60 s |
| All other endpoints    | 10 / 1 s (burst), 50 / 10 s, 100 / 60 s |

---

## Pagination

All list endpoints return:
```json
{
  "data": {
    "items":      [ … ],
    "total":      1000,
    "page":       1,
    "limit":      20,
    "totalPages": 50
  }
}
```

Standard query params: `page` (default 1), `limit` (default 20, max 100).

---

## Environment & Swagger

Interactive API docs (development/staging only):  
`http://localhost:5000/api/docs`

All endpoints are documented in Swagger UI. Use the **Authorize** button to paste your JWT for authenticated testing.
