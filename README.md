# Procurement MVP Copilot Workshop

Hands-on 5-hour workshop to build a web-based procurement MVP and practice Copilot across SDLC.

## Workshop Scope
- PR: create, submit, approve
- PO: create from approved PR lines, submit
- GR: create from PO lines, post
- Tracking: PR detail shows linked PO/GR and quantities

Canonical workshop document: [docs/plan.md](docs/plan.md)

## Tech Stack
- Backend: Fastify + REST API (JavaScript)
- Database: PostgreSQL in Docker
- Frontend: Vue 3 + Vite (JavaScript)
- Testing: Jest (unit) + Playwright (e2e)

## Quick Start

### 1) Start PostgreSQL
```bash
docker compose up -d db
```

### 2) Backend (to be scaffolded in workshop)
```bash
cd backend
npm install
npm run dev
```

### 3) Frontend (to be scaffolded in workshop)
```bash
cd frontend
npm install
npm run dev
```

## Expected Endpoints
- `POST /api/requisitions`
- `POST /api/requisitions/:id/submit`
- `POST /api/requisitions/:id/approve`
- `GET /api/requisitions/:id`
- `GET /api/requisitions/:id/open-lines`
- `POST /api/purchase-orders`
- `POST /api/purchase-orders/:id/submit`
- `GET /api/purchase-orders/:id`
- `GET /api/purchase-orders/:id/open-lines`
- `POST /api/goods-receipts`
- `POST /api/goods-receipts/:id/post`
- `GET /api/goods-receipts/:id`

## Validation Rules
1. PO allocation qty must not exceed PR line remaining qty.
2. GR received qty must not exceed PO line open qty.
3. Status transition rules must be enforced.

## Suggested Workshop Output
- Running Fastify API + Vue app + Docker PostgreSQL
- One complete PR -> PO -> GR demo
- Jest tests for critical validations
- One Playwright happy-path test
