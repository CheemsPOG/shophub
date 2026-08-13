# Running ShopHub v2

Three ways to run this app, from easiest to most flexible. Pick **Option A** unless you are editing frontend or backend code.

Nothing else is required for Option A — Java, Maven, and Node all run **inside** Docker.

---

## Option A — Full stack with Docker (recommended)

Runs Postgres, Redis, MinIO, MailHog, the Spring Boot API, the React SPA, and Nginx.

**Step 1 — Open the Compose folder**

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-BE\deploy"
```

**Step 2 — Build and start**

```powershell
docker compose up -d --build
```

First run can take 10–20+ minutes (Maven + npm builds inside Docker). Later `--build` runs are much faster because image layers are cached.

**Step 3 — Watch startup (optional)**

```powershell
docker compose logs -f backend
```

Wait until you see `Started ShopHubApplication`. Press `Ctrl+C` to stop following logs (containers keep running).

**Step 4 — Verify backend health**

```powershell
curl http://localhost:8091/api/v1/health
```

Expected: JSON with `"status":"UP"` and `"phase":11`.

Direct API (bypassing Nginx):

```powershell
curl http://localhost:8082/api/v1/health
curl http://localhost:8082/actuator/health
```

**Step 5 — Open the app**

Go to: **http://localhost:8091**

**Stopping / cleaning up**

```powershell
docker compose down       # stop containers, keep data
docker compose down -v    # stop containers AND wipe Postgres/MinIO data (reseed on next boot)
```

---

## Option B — Infra + API in Docker, Vite on the host

Use this when you are editing the frontend and want hot reload. The API still runs in Docker on port **8082**. Vite proxies `/api` → `http://127.0.0.1:8082`.

**Step 1 — Start infra + backend**

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-BE\deploy"
docker compose up -d --build postgres redis minio mailhog backend
```

**Step 2 — Start the frontend**

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-FE"
npm install
npm run dev
```

Open **http://127.0.0.1:5173** (prefer `127.0.0.1` over `localhost` — Chrome sometimes fails to connect if Vite is bound to IPv4 only).

---

## Option C — Backend on the host (Java 21)

Use this when you are editing backend code and want fast restarts. You still need Postgres + Redis (easiest: start them via Docker).

Host JDK must be **21**. This repo's Docker image uses Temurin 21; a newer local JDK (for example 26) is not what the app is built against.

**Step 1 — Start infra**

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-BE\deploy"
docker compose up -d postgres redis minio mailhog
```

**Step 2 — Run the API**

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-BE"
# Requires JDK 21 + Maven on the PATH
mvn spring-boot:run
```

API: **http://localhost:8082** — health: http://localhost:8082/api/v1/health

If Maven is not installed locally, run tests/builds with the Docker Maven image (see below).

---

## Demo accounts

All demo accounts use the same password: **`demo1234`**

They are seeded automatically on first boot when the `users` table is empty (`DEMO_DATA=true`).

| Role | Email | Password | After login |
|------|-------|----------|-------------|
| Buyer | `alex@shophub.com` | `demo1234` | `/` |
| Seller (Soundwave Store, verified) | `seller@shophub.com` | `demo1234` | `/seller` |
| Admin | `admin@shophub.com` | `demo1234` | `/admin` |

Login pages are role-specific: `/login/buyer`, `/login/seller`, `/login/admin`. The forms are prefilled with the matching demo email.

---

## URLs and ports

Ports are offset from ShopHub v1 so both stacks can run on the same machine.

| Service | Container | URL / host port | Notes |
|---------|-----------|-----------------|-------|
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
# Status
docker compose ps

# Follow logs
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx

# Rebuild one service after a code change
docker compose up -d --build backend
docker compose up -d --build frontend

# Health
curl -s http://localhost:8091/api/v1/health
curl -s http://localhost:8082/actuator/health

# Stop (keep volumes)
docker compose down

# Stop and wipe DB / MinIO (fresh demo seed next boot)
docker compose down -v
```

### Login via the API (optional)

```powershell
curl -X POST http://localhost:8082/api/v1/auth/login `
  -H "Content-Type: application/json" `
  -d "{\"email\":\"alex@shophub.com\",\"password\":\"demo1234\",\"role\":\"buyer\"}"
```

Then call protected routes with `Authorization: Bearer <accessToken>`.

---

## Tests

Host Maven is optional. This command uses Docker + Testcontainers (needs Docker Desktop running):

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-BE"
docker run --rm `
  -v "${PWD}:/app" -w /app `
  -v /var/run/docker.sock:/var/run/docker.sock `
  -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal `
  maven:3.9-eclipse-temurin-21 mvn test
```

Frontend typecheck (from `shophub-FE`):

```powershell
npm run typecheck
```

---

## Resetting to a clean demo state

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-BE\deploy"
docker compose down -v
docker compose up -d --build
```

`down -v` removes the Postgres and MinIO volumes, so Flyway recreates the schema and `DemoDataLoader` seeds the three demo accounts again.

---

## Notes / troubleshooting

- First Docker build is **slow** (Maven downloads + `npm ci` + Vite production build). Later rebuilds reuse layers.
- Backend image is **JDK 21**; frontend image is **Node 22**.
- **"port is already allocated"** — another process (including ShopHub v1) is using a host port in the table above. Stop that stack or change the left-hand side of `"host:container"` in `shophub-BE/deploy/docker-compose.yml`.
- **Chrome cannot open Vite (`localhost:5173`)** — use **http://127.0.0.1:5173**. Option A (`:8091`) does not have this issue.
- **Login fails right after `down -v`** — wait until `Started ShopHubApplication` in backend logs; the seeder runs on first boot.
- **Frontend loads but `/api` fails** — `docker compose ps` and `curl http://localhost:8082/api/v1/health`. Nginx waits until the backend healthcheck passes.
- **Changed code but the UI/API is stale** — images copy source at build time. Rebuild: `docker compose up -d --build backend` or `frontend`.
- **Host Java is newer than 21** — run the API via Docker (Option A/B) or install JDK 21 for Option C.

### Known gaps (not bugs)

Home, shop, and product detail talk to the live catalog API (with mock fallback if the API is down). Cart, checkout, orders, and most seller/admin screens still use the Bolt mock data in `shophub-FE/src/lib/data.ts`. Auth, role gates, and demo login are live.

---

## Where to go next

- [`scope.md`](./scope.md) — architecture, ports, and phase checklist
- [`shophub-BE/README.md`](./shophub-BE/README.md) — backend ports and test command
