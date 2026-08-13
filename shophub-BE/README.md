# ShopHub v2 backend

Modular Spring Boot monolith. Architecture: [`../scope.md`](../scope.md).

## Ports (offset from ShopHub v1)

| What | URL |
|---|---|
| App via Nginx (FE + API) | http://localhost:8091 |
| Vite (local FE, proxies `/api`) | http://127.0.0.1:5173 |
| Backend directly | http://localhost:8082 |
| API health | http://localhost:8082/api/v1/health |
| Postgres | localhost:5433 (`shophub` / `shophub_secret`) |
| Redis | localhost:6382 |
| MinIO console | http://localhost:9005 (`shophub` / `shophub_secret`) |
| MailHog | http://localhost:8027 |

## Demo accounts (password `demo1234`)

| Role | Email | After login |
|---|---|---|
| Buyer | alex@shophub.com | `/` |
| Seller | seller@shophub.com | `/seller` |
| Admin | admin@shophub.com | `/admin` |

## Run tests

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-BE"
docker run --rm -v "${PWD}:/app" -w /app -v /var/run/docker.sock:/var/run/docker.sock -e TESTCONTAINERS_HOST_OVERRIDE=host.docker.internal maven:3.9-eclipse-temurin-21 mvn test
```

## Run locally (recommended for UI)

1. Start infra + API:

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-BE\deploy"
docker compose up --build postgres redis minio mailhog backend
```

2. In another terminal, start the frontend:

```powershell
cd "d:\Personal Projects\New\shophub_v2\shophub-FE"
npm run dev
```

3. Open **http://127.0.0.1:5173** (not `localhost` if Chrome fails to connect).

Vite proxies `/api` to the backend on port 8082.
