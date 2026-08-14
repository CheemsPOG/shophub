# ShopHub v2 — user flows (buyer / seller / admin)

This is the actual behavior of the app today: what works end-to-end against Postgres, and what is still mock or incomplete. Use it to decide what to wire next.

Legend:

- **Works** — UI talks to a real API; data survives (until `docker compose down -v`)
- **Mock UI** — screen looks real but reads/writes `shophub-FE/src/lib/data.ts` (or local React state). Saving does nothing lasting.
- **Missing** — copy or button exists, no backend (or backend exists and UI never calls it)
- **Partial** — some of the path is real

Demo logins (password `demo1234`): `alex@shophub.com` (buyer), `seller@shophub.com` (verified seller), `admin@shophub.com` (admin).

---

## Shared: accounts

### Register

1. `/register` → pick buyer or seller.
2. **Buyer** `POST /api/v1/auth/register` `{ role: "buyer" }` → JWT → lands on `/`. **Works.**
3. **Seller** same endpoint with `{ role: "seller", storeName }` → creates user + shop `status=pending` + seller application `pending` → lands on `/seller`. **Works**, but the shop cannot list products until an admin verifies it.
4. Admin cannot self-register. **By design.**

### Login

1. `/login` → pick portal, or go straight to `/login/buyer|seller|admin`.
2. `POST /api/v1/auth/login` with `{ email, password, role, rememberMe }`. Role must match the account. **Works.**
3. Tokens in `localStorage`; `AuthProvider` refreshes via `POST /auth/refresh`.

### Forgot / reset password — **Partial / broken**

- UI: `/forgot-password` always shows “check your inbox”. **Never calls the API.**
- Backend: `POST /auth/forgot-password` hashes a random token and **throws the raw token away**. No email is sent (MailHog is unused). `POST /auth/reset-password` cannot succeed with a token the user never received.
- Account → Settings → “Change password” links here. Same dead end.

### Profile (`PATCH /me`)

- Buyer account page **Works** (name, phone, gender, DOB).
- **No avatar upload** for anyone (`PATCH /me` has no avatar field; no buyer media endpoint).

---

## 1. Buyer

### 1.1 Browse the storefront — **Works**

| Step | Screen | API | Notes |
|------|--------|-----|--------|
| Open site | `/` | `GET /catalog/home` | Featured = most sales, deals = compare-at > price, trending = rating. Stats are real buyer/seller/product counts. |
| Categories in header | layout | `GET /catalog/categories` | |
| Shop / search | `/shop` | `GET /catalog/products?q&category&maxPrice&deals&sort` | Only **`active`** products. Drafts never appear. |
| Product page | `/product/:id` | `GET /catalog/products/{id}` + reviews | |

**Not real on these screens**

- Top announcement bar: hardcoded “End of Summer Sale up to 40% off”. **Mock copy.**
- Trust row (“30-day returns”, “buyer protection”): marketing only. **Missing** return flow.
- Newsletter email field: no submit. **Missing.**
- Share button on product: no action. **Missing.**

### 1.2 Cart and wishlist — **Works**

- Add to cart: `PUT /cart/items`. Header badge from `CartProvider`.
- Qty / remove: same endpoint / `DELETE /cart/items/{id}`.
- Coupon on cart: `POST /cart/coupon` / `DELETE /cart/coupon` against real `coupons` table (seeded `WELCOME10`, `FREESHIP`). **Works** if the code exists and is active.
- Wishlist toggle: `PUT/DELETE /wishlist/{productId}`. `/wishlist` lists them.

Guest: cart/checkout/wishlist routes are behind `RequireRole role="buyer"` — must log in.

### 1.3 Checkout — **Partial**

1. `/checkout` loads `GET /addresses` and cart. **Works.**
2. Steps: Shipping → Delivery → Payment → Review.
3. Delivery: `standard` $0, `express` $15, `pickup` $5 (UI and `CheckoutService.shippingFor` match).
4. Tax: 8% shown in UI; backend also computes tax at checkout. Displayed total is a preview; **charged total is the backend’s**.
5. `POST /checkout` with `Idempotency-Key`, `{ addressId, deliveryMethod, paymentMethod }`. Splits one cart into **one order per seller**. Clears cart. Notifies seller. **Works.**

**Payment**

- **Card / PayPal fields are decorative.** Copy on the page says so. Choosing `card` stores `paymentMethod=card`, order `processing`, `paymentStatus=paid` — **no Stripe, no charge**.
- **COD** (`paymentMethod` not card): order `pending`, `paymentStatus=pending` until the seller marks delivered.
- Success screen: “A confirmation has been sent to your email” — **Missing** (no mailer).

**Blocked if:** no address, empty cart.

### 1.4 Orders — **Works** (no returns / disputes)

Happy path the buyer sees:

```
placed
  card  → status processing, payment paid
  COD   → status pending,    payment pending
     ↓ seller Confirm order     (COD only)
  processing
     ↓ seller Mark as shipped   (tracking string, optional)
  shipped   (buyer sees tracking number — no carrier lookup)
     ↓ seller Mark as delivered
  delivered (COD flips to payment paid; seller earnings move pending → available)
```

- List: `GET /orders`. Detail: `GET /orders/{id}`.
- Cancel: `POST /orders/{id}/cancel` only while `pending` or `processing`. Restores stock. **Works.**
- After delivered: “Buy again” goes to the product. **Works.**
- **No “Return item”.** Copy promises 30-day returns. **Missing.**
- **No “Open dispute”.** Admin can resolve disputes if rows exist, but buyers cannot create them. **Missing** (`POST /disputes` does not exist).

### 1.5 Reviews — **Works**

- Form on product page: `POST /catalog/products/{id}/reviews`.
- One review per user per product. Rating updates `rating_avg` / `review_count`.
- “Verified” badge only if that buyer has a **delivered** order containing the product. Anyone logged in can still review.

### 1.6 Addresses — **Works**

`GET/POST /addresses`, `PUT /addresses/{id}`, `POST /addresses/{id}/default`, `DELETE`. Used at checkout.

### 1.7 Messages — **Removed from UI**

Buyer/seller messaging screens and nav entry points were removed. Backend `/conversations` APIs may still exist but are unused by the SPA.

### 1.8 Notifications — **Works**

`GET /notifications`, mark read / read-all. Header bell is live.

Created by real events: checkout, seller confirm/ship/deliver/cancel, (seller application approve/reject — only if admin UI were wired).

### 1.9 Account settings — **Partial**

- Profile save: **Works.**
- Notification toggles: **Mock UI** (explicitly “not persisted”).
- Change password: dead forgot-password page.

### 1.10 Help Center `/help` — **Mock UI**

Static FAQ. Search does nothing. Topic cards are not pages.

---

## 2. Seller

Gate: shop `status` must be **`verified`** to list products for sale. Demo `seller@shophub.com` already is. A newly registered seller is `pending` until admin approves the **seller** (not each product).

### 2.1 Dashboard — **Works**

`GET /seller/dashboard`: orders, pending orders, product count, revenue, balances, recent orders.

### 2.2 Products (seller owns listings) — **Works**

**Intended status model (now):**

```
Add product  → active   (live on /shop immediately)
Save as draft → draft   (hidden from shop)
Unpublish     → draft
List for sale → active
Delete        → row removed (blocked if carts/orders reference it)
```

Admin does **not** approve products. There is no `pending` product queue anymore. Leftover `pending` rows are flipped to `active` when the seller opens Products (and via Flyway `V12`).

| Action | API |
|--------|-----|
| List | `GET /seller/products` |
| Create | `POST /seller/products` `{ ..., draft?: boolean }` → `active` unless `draft: true` |
| Update | `PUT /seller/products/{id}` |
| Images | `POST /seller/media` (MinIO), URLs stored on the product |
| Publish draft | `POST /seller/products/{id}/publish` |
| Unpublish | `POST /seller/products/{id}/unpublish` |
| Delete | `DELETE /seller/products/{id}` |

Public catalog query is `status = 'active'` only.

### 2.3 Order fulfillment — **Works**

```
COD order arrives as pending
  → Confirm order     POST /seller/orders/{id}/confirm     → processing
  → Mark as shipped   POST /seller/orders/{id}/ship         → shipped  (any tracking string is stored as-is)
  → Mark as delivered POST /seller/orders/{id}/deliver      → delivered
Card order arrives as processing (skip Confirm)
  → ship → deliver  (same)
Cancel                POST /seller/orders/{id}/cancel       (pending or processing only)
```

Buyer is notified at each step. On deliver: COD marked paid; commission already snapshotted; pending earnings released to available.

**Missing:** live carrier tracking, print label, partial ship, refund from seller UI.

### 2.4 Analytics — **Partial**

`GET /seller/analytics?period=7d|30d|90d` + products for “top sellers”. Revenue/orders are real.

**Missing:** traffic, conversion funnel, referrers (never collected). Old mock charts were removed on purpose.

### 2.5 Payouts — **Works** (simulated money)

- `GET /seller/payouts`: available / pending / history.
- `POST /seller/payouts/withdraw` `{ amount }` if `available >= min` (default $50 from settings).
- Not a real bank transfer — it only moves ledger rows.

**Missing:** payout method CRUD in the UI (billing tab 404s). Withdraw may run without a saved method.

### 2.6 Messages — **Removed from UI** (same as buyer)

### 2.7 Store settings — **Works**

`/seller/settings` is a single store-profile page (no Billing/Security tabs). Loads and saves via `GET/PUT /seller/shop`. Banner and logo upload through `POST /seller/media`.

### 2.8 Billing / Security tabs — **Removed**

Those nav items 404ed and had no APIs. Payouts stay on `/seller/payouts`.

---

## 3. Admin

**Job in this product:** manage **sellers** (applications, ban users), platform catalog **categories**, orders overview, disputes, coupons, settings. **Not** individual product approval.

Most admin **screens are still mock** even though the APIs exist.

### 3.1 Dashboard `/admin` — **Mock UI**

Reads `ADMIN_STATS`, fake charts, fake signups. Real API: `GET /admin/dashboard` (users, products, GMV, open disputes, pending applications). **Not wired.**

### 3.2 Customers `/admin/users` — **Mock UI**

Fake list + random order/spend numbers. Real API: `GET /admin/users`, `POST /admin/users/{id}/ban`, `/unban`. **Not wired.**

### 3.3 Sellers `/admin/sellers` — **Mock UI**  ← highest-leverage admin fix

This is the gate for new shops.

**Should be:**

```
Seller registers → application pending, shop pending
Admin opens Sellers → Applications
  Approve  POST /admin/applications/{id}/approve
           → shop verified, seller can list products as active
  Reject   POST /admin/applications/{id}/reject
           → shop rejected, cannot list
```

Today the page uses `SELLER_APPLICATIONS` / hardcoded `SELLERS`. Approve/Reject buttons do not call the API. Demo seller is pre-approved in the seeder so you can still sell.

### 3.4 Catalog `/admin/products` — **Works** (read-only)

`GET /admin/products`. View listing + seller name. No approve/reject (removed on purpose). Eye icon → public product page.

### 3.5 Categories `/admin/categories` — **Mock UI**

`CATEGORIES` from `data.ts`. Add/Edit do nothing. Real API: `CRUD /admin/categories`. **Not wired.**

### 3.6 Orders `/admin/orders` — **Mock UI**

Duplicated `SELLER_ORDERS`. Real: `GET /admin/orders`, `GET /admin/orders/{id}`. **Not wired.** Admin cannot ship/cancel from this UI (and should not need to — sellers do).

### 3.7 Disputes `/admin/disputes` — **Mock UI** + **Missing buyer create**

Page uses `DISPUTES` mock. Bell count **does** call `GET /admin/disputes?status=open` (usually 0).

Real resolve APIs: `POST /admin/disputes/{id}/resolve`, `/resolve/buyer`, `/resolve/seller`. **Not wired.**

Buyers still cannot open a dispute, so the queue stays empty unless you insert rows by hand.

### 3.8 Coupons `/admin/coupons` — **Mock UI**

`COUPONS` mock. Real `CRUD /admin/coupons`. Cart redeem **does** use the DB, so seeded codes work; creating a coupon in this UI does not.

### 3.9 Settings `/admin/settings` — **Mock UI**

Hardcoded form (commission 8%/5%, min payout $50, toggles). Save does nothing. Real: `GET/PUT /admin/settings`. Checkout **does** read commission/min-payout from the DB if present.

---

## End-to-end happy path (what you can demo today)

```
Admin exists (seeded)
     ↑
Seller (seeded, verified) ── Add product ──► active listing on /shop
     ↑                                         │
     │                                    Buyer adds to cart
     │                                         │
     │                                    Checkout (card = fake paid, or COD)
     │                                         │
     └── Confirm (COD) → Ship → Deliver ───────┘
                                               │
                                          Buyer reviews
                                          Seller withdraws available balance (ledger only)
```

New seller (not demo): stuck after register until **admin applications API is wired** (flow 3.3).

---

## Suggested implementation order (from this file)

1. **Admin sellers / applications** — otherwise only the seeded seller can ever go live.
2. **Seller store settings** — `GET/PUT /seller/shop` + media upload.
3. **Admin coupons / users / dashboard / orders** — swap `data.ts` for the APIs already in the table above.
4. **Forgot password + mailer** — or remove the UI until it works.
5. **Buyer dispute + returns** — or remove the 30-day-return copy.
6. **Real payments** — or default checkout to COD and hide the card form.

Source of mock arrays: `shophub-FE/src/lib/data.ts`. Wired pages import **types** from that file only.
