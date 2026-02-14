# Cloudflare Accounting API

This Worker exposes billing/accounting APIs used by the frontend.

## 1) Prerequisites

- Node.js 18+
- Wrangler CLI (`npm i -g wrangler` or `npx wrangler`)
- Cloudflare account with D1 enabled

## 2) Configure

Edit `cloudflare/worker/wrangler.toml`:

- Set `name` (worker name)
- Confirm `database_name`
- Confirm `database_id` (currently set to `1b0134b8-950a-426f-8934-26734c1a89dc`)

## 3) Apply migrations

From repository root:

```bash
wrangler d1 migrations apply clinic-software-db --config cloudflare/worker/wrangler.toml --local
wrangler d1 migrations apply clinic-software-db --config cloudflare/worker/wrangler.toml --remote
```

## 4) Run/deploy API

```bash
wrangler dev --config cloudflare/worker/wrangler.toml
wrangler deploy --config cloudflare/worker/wrangler.toml
```

## 5) Connect frontend

Set `VITE_API_BASE_URL` in a root `.env` file:

```bash
VITE_API_BASE_URL=https://<your-worker-domain>/api
```

Then run frontend:

```bash
npm run dev
```

## API routes

- `GET /health`
- `GET /api/invoices`
- `POST /api/invoices`
- `PATCH /api/invoices/:id/status`
- `GET /api/accounting/summary`
