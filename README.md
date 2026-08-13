# ShopHub v2

A multi-vendor marketplace (buyer / seller / admin) built as a learning project: a modular Spring Boot monolith backend behind an Nginx gateway, serving a React SPA, with every screen wired to a real Postgres database — no mock data anywhere in the working paths.

Three portals, one login system, one database:

- **Buyer** — browse, cart, checkout, orders, wishlist, addresses, reviews, messages, notifications
- **Seller** — dashboard, product CRUD with real image uploads, order fulfillment, analytics, payouts
- **Admin** — catalog moderation, seller applications, disputes, coupons, platform settings *(UI still mock — see [Known gaps](#known-gaps-not-bugs))*

---

## Tech stack

**Backend**
- Java 21, Spring Boot 3.4.1 (Web, Security, Validation, Data JPA)
- PostgreSQL 16, Flyway (11 versioned migrations, `V1__identity.sql` → `V11__platform_outbox_audit.sql`)
- JWT auth (`jjwt` 0.12.6) — access + refresh tokens, "remember me", BCrypt password hashing
- MinIO (S3-compatible) for real product image uploads, with a public-read bucket policy
- Redis, Micrometer + Prometheus — wired into Compose but not yet used by any code path (see below)
- Testcontainers (Postgres) + JUnit 5 + Spring Boot Test for integration tests
- Maven

**Frontend**
- React 18 + TypeScript, built with Vite
- React Router v7 for role-gated client-side routing (`/`, `/seller/*`, `/admin/*`)
- Tailwind CSS
- React Context for cross-cutting state (`AuthProvider`, `CartProvider`, `NotificationsProvider`) — no Redux/Zustand needed at this scale
- `lucide-react` icons, native `fetch` wrapper (no axios)

**Infrastructure**
- Docker + Docker Compose: `postgres`, `redis`, `minio`, `mailhog`, `backend`, `frontend`, `nginx`
- Nginx as the single entry point / API gateway — same-origin routing (`/` → SPA, `/api/` + `/actuator/` → backend, `/media/` → MinIO), so the browser never deals with CORS

**Architecture** — a **modular monolith**, not microservices. One deployable Spring Boot app, package-by-feature under `com.shophub`: `identity`, `shop`, `catalog`, `cart`, `order`, `promotion`, `dispute`, `payout`, `messaging`, `notification`, `analytics`, `platform`, `shared`. Full design rationale in [`../scope.md`](../scope.md).

---

## What we learned building this

A few things that only showed up once the app was actually run end-to-end, not while reading the code:

- **A broken YAML indent silently killed the whole stack.** One misaligned key under `backend.environment` in `docker-compose.yml` meant `SPRING_PROFILES_ACTIVE` wasn't applied — Compose parsed the file, so nothing "errored" until the container behaved wrong. Lesson: validate Compose files with `docker compose config`, don't just eyeball indentation.
- **Rebuilding the backend isn't enough — Docker layer caching bites you if you forget the frontend.** Several "fixes" appeared to do nothing because only the `backend` image was rebuilt; the `frontend` image (a separately built, static Vite bundle) was still serving old JS. Any full-stack change needs `docker compose up -d --build backend frontend`, not just one.
- **A `null` in one JPQL parameter silently zeroed an entire query.** `products.search(null, ...)` for the home page's featured/trending/deals looked fine at a glance, but `(:q = '' or lower(title) like ...)` evaluates to `NULL` (not `true`) when `:q` is `null`, so `WHERE` matched **zero rows** — always. It was invisible for a long time because the old frontend code had a mock-data fallback that only replaced state `if (data.length)`, quietly hiding a completely broken endpoint behind fake data. Lesson: guard `null` before it reaches a query, and be suspicious of any "fallback to mock on failure" pattern — it can mask real bugs indefinitely.
- **Denormalized aggregate columns (`rating_avg`, `review_count`, `sales_count`) will lie to you if you seed them independently of the rows they're supposed to summarize.** The original demo seed hand-picked "nice" numbers like `4.8 stars, 1,247 reviews` with zero actual `reviews` rows behind them. The fix wasn't just correcting the seed — it was making sure every one of those numbers is *only ever* written by the same code path that creates the underlying transaction (a review, an order), so they can't drift out of sync again.
- **State machines need every real transition mapped, not just the "happy path."** Cash-on-Delivery orders start at `pending`, but the seller UI only had a "Mark as shipped" action wired for `processing`. COD orders had no way to ever leave `pending` — a whole payment method was silently unshippable until an explicit "Confirm order" transition was added.
- **Documentation drifts from reality fast, and it's not enough to proofread it — you have to run it.** The run guide's setup commands were correct Docker syntax but hardcoded to one machine's absolute file path; every command would have failed verbatim for anyone else cloning the repo. The only way we caught it for certain: clone the repo fresh into an unrelated folder and follow the docs literally, the way a stranger would.
- **Nginx is a perfectly adequate "API gateway" for a monolith.** No need for Kong/Spring Cloud Gateway/etc. when there's one backend — a same-origin reverse proxy with path-based routing solves CORS and gives one clean public entry point, and business logic stays entirely out of the gateway layer.

---

## Running the app

Three ways, from easiest to most flexible. Pick **Option A** unless you're editing frontend or backend code. All commands below are written **relative to the repository root** — the folder containing `shophub-BE/` and `shophub-FE/`, not this `shophub-BE` folder itself.

```powershell
git clone https://github.com/CheemsPOG/shophub.git
cd shophub
```

Nothing else is required for Option A — Java, Maven, and Node all run **inside** Docker. You do **not** need to run `npm install` yourself; the frontend's `Dockerfile` runs `npm ci` during the image build.

**Prerequisites:** Docker Desktop (or Docker Engine + Compose v2) installed and running.

### Option A — Full stack with Docker (recommended)

Runs Postgres, Redis, MinIO, MailHog, the Spring Boot API, the React SPA, and Nginx.

```powershell
cd shophub-BE\deploy
docker compose up -d --build
```

First run can take 10–20+ minutes (Maven + npm builds inside Docker). Later `--build` runs are much faster thanks to layer caching.

Watch startup (optional):

```powershell
docker compose logs -f backend
```

Wait for `Started ShopHubApplication`, then verify:

```powershell
curl http://localhost:8091/api/v1/health
```

Expected: JSON with `"status":"UP"` and `"phase":11`. Direct API (bypassing Nginx): `curl http://localhost:8082/api/v1/health`.

Open the app: **http://localhost:8091**

Stop / clean up:

```powershell
docker compose down       # stop containers, keep data
docker compose down -v    # stop containers AND wipe Postgres/MinIO data (reseed on next boot)
```

### Option B — Infra + API in Docker, Vite on the host

Use this when editing the frontend and you want hot reload. The API still runs in Docker on port **8082**; Vite proxies `/api` → `http://127.0.0.1:8082`.

```powershell
cd shophub-BE\deploy
docker compose up -d --build postgres redis minio mailhog backend
```

```powershell
cd shophub-FE
npm install
npm run dev
```

Open **http://127.0.0.1:5173** (prefer `127.0.0.1` over `localhost` — Chrome sometimes fails to connect if Vite is bound to IPv4 only).

### Option C — Backend on the host (Java 21)

Use this when editing backend code and you want fast restarts. Host JDK must be **21** (this repo's Docker image uses Temurin 21; a newer local JDK isn't what the app is built against).

```powershell
cd shophub-BE\deploy
docker compose up -d postgres redis minio mailhog
```

```powershell
cd shophub-BE
# Requires JDK 21 + Maven on the PATH
mvn spring-boot:run
```

API: **http://localhost:8082** — health: http://localhost:8082/api/v1/health. If Maven isn't installed locally, use the Docker Maven image (see [Tests](#tests) below).

---

## Demo accounts

All demo accounts use the same password: **`demo1234`**. They're seeded automatically on first boot when the `users` table is empty (`DEMO_DATA=true`). Orders, reviews, ratings, and sales counts start genuinely at zero — nothing is pre-populated beyond the accounts, one verified shop, and its catalog.

| Role | Email | After login |
|------|-------|--------------|
| Buyer | `alex@shophub.com` | `/` |
| Seller (Soundwave Store, verified) | `seller@shophub.com` | `/seller` |
| Admin | `admin@shophub.com` | `/admin` |

Login pages are role-specific: `/login/buyer`, `/login/seller`, `/login/admin`.

---

## URLs and ports

Ports are offset from ShopHub v1 so both stacks can run on the same machine.

| Service | Container | URL / host port | Notes |
|---------|-----------|------------------|-------|
| App (frontend + API, via Nginx) | `shophub-v2-nginx` | **http://localhost:8091** | SPA + `/api` proxy |
| Backend API (direct) | `shophub-v2-backend` | http://localhost:8082 | Same API; container listens on 8080 |
| Backend health | `shophub-v2-backend` | http://localhost:8082/api/v1/health | Also via Nginx: `:8091/api/v1/health` |
| Actuator | `shophub-v2-backend` | http://localhost:8082/actuator/health | |
| Postgres | `shophub-v2-postgres` | `localhost:5433` | db `shophub`, user `shophub` / `shophub_secret` |
| Redis | `shophub-v2-redis` | `localhost:6382` | |
| MinIO API | `shophub-v2-minio` | http://localhost:9004 | |
| MinIO console | `shophub-v2-minio` | http://localhost:9005 | user/pass `shophub` / `shophub_secret` |
| MailHog SMTP | `shophub-v2-mailhog` | `localhost:1027` | |
| MailHog UI | `shophub-v2-mailhog` | http://localhost:8027 | Captures outgoing mail |
| Vite (Option B only) | — | http://127.0.0.1:5173 | Proxies `/api` → `:8082` |

Everything under `http://localhost:8091/api/...` is proxied to the backend by Nginx — the browser never talks to a different origin in Option A.

---

## Useful commands

Run these from `shophub-BE\deploy` (or pass `-f` with the compose file path).

```powershell
docker compose ps                          # status
docker compose logs -f backend             # follow logs
docker compose up -d --build backend       # rebuild one service after a code change
docker compose up -d --build frontend
curl -s http://localhost:8091/api/v1/health
docker compose down                        # stop, keep volumes
docker compose down -v                     # stop and wipe DB / MinIO (fresh demo seed next boot)
```

Login via the API:

```powershell
curl -X POST http://localhost:8082/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"alex@shophub.com\",\"password\":\"demo1234\",\"role\":\"buyer\"}"
```

Then call protected routes with `Authorization: Bearer <accessToken>`.

---

## Tests

Host Maven is optional — this uses Docker + Testcontainers (needs Docker Desktop running):

```powershell
cd shophub-BE
docker run --rm `
  -v "${PWD}:/app" -w /app `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal `
  maven:3.9-eclipse-temurin-21 mvn test
```

Frontend typecheck (from `shophub-FE`): `npm run typecheck`. There's no frontend unit test runner configured yet — a known gap, not a bug.

---

## Resetting to a clean demo state

```powershell
cd shophub-BE\deploy
docker compose down -v
docker compose up -d --build
```

`down -v` removes the Postgres and MinIO volumes, so Flyway recreates the schema and the demo seeder runs again from scratch.

---

## Notes / troubleshooting

- First Docker build is **slow** (Maven downloads + `npm ci` + Vite production build). Later rebuilds reuse layers.
- Backend image is **JDK 21**; frontend image is **Node 22**.
- **"port is already allocated"** — another process (including ShopHub v1) is using a host port in the table above. Stop that stack or change the left-hand side of `"host:container"` in `shophub-BE/deploy/docker-compose.yml`.
- **Chrome cannot open Vite (`localhost:5173`)** — use **http://127.0.0.1:5173**. Option A (`:8091`) doesn't have this issue.
- **Login fails right after `down -v`** — wait until `Started ShopHubApplication` in backend logs; the seeder runs on first boot.
- **Frontend loads but `/api` fails** — check `docker compose ps` and `curl http://localhost:8082/api/v1/health`. Nginx waits until the backend healthcheck passes.
- **Changed code but the UI/API is stale** — images copy source at build time, they aren't mounted volumes. Rebuild: `docker compose up -d --build backend` and/or `frontend`.
- **Host Java is newer than 21** — run the API via Docker (Option A/B) or install JDK 21 for Option C.

### Known gaps (not bugs)

The buyer app (home, shop, product detail, cart, checkout, orders, wishlist, addresses, notifications, messages, reviews) and most of the seller portal (dashboard, products, orders, analytics, payouts) are fully wired to the real API and database. The seller store-settings page and the entire admin portal (dashboard, users, sellers, catalog moderation, orders, disputes, coupons, settings) are still backed by mock data in `shophub-FE/src/lib/data.ts`, even though the corresponding backend endpoints already exist. Redis is provisioned in Compose but not yet used by any caching or rate-limiting code.

---

## Where to go next

- [`../scope.md`](../scope.md) — full architecture, data model, and phase-by-phase implementation plan
