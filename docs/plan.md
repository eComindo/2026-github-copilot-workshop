# Copilot Workshop Plan: Procurement MVP (5 Hours)

## 1) Goal
Build a realistic but small procurement web app to practice using Copilot across SDLC phases.

MVP flow:
1. Purchase Requisition (PR) create + submit + approve
2. Purchase Order (PO) create from approved PR lines + submit
3. Goods Receipt (GR) create from PO lines + post
4. PR detail shows linked PO/GR and quantities

Out of scope: production hardening, SSO, advanced approval matrix, reporting, notifications, and full enterprise compliance controls.

---

## 2) Final Tech Stack
- Backend: Fastify (JavaScript), REST API
- Database: PostgreSQL in Docker (`postgres:16-alpine`)
- Frontend: Vue 3 + Vite (JavaScript)
- Unit test: Jest
- E2E/UI test: Playwright

Why this works for workshop:
- Fastify is lightweight and easy to scaffold with Copilot
- REST keeps backend/frontend contract simple
- PostgreSQL in Docker is stable and realistic for local teams
- Vue + Vite has very fast startup for participants
- Jest + Playwright demonstrates both API/unit and end-to-end testing

---

## 3) Architecture

```mermaid
flowchart LR
    U[Participant Browser] --> V[Vue App]
    V -->|HTTP REST| B[Fastify API]
    B --> D[(PostgreSQL Docker)]
```

```mermaid
flowchart LR
    PR[PR: DRAFT -> SUBMITTED -> APPROVED] --> PO[PO: DRAFT -> SUBMITTED]
    PO --> GR[GR: DRAFT -> POSTED]
    GR --> VIEW[PR Detail Tracking]
```

## 3.1) Web App Pages and Navigation

Use this as the mental model of what we are building in the frontend.

```mermaid
flowchart TD
  HOME[Home / Dashboard]
  PRC[PR Create Page]
  PRD[PR Detail Page]
  POC[PO Create Page]
  POD[PO Detail Page]
  GRC[GR Create Page]
  GRD[GR Detail Page]

  HOME --> PRC
  HOME --> POC
  HOME --> GRC

  PRC --> PRD
  PRD --> POC
  POC --> POD
  POD --> GRC
  GRC --> GRD
  GRD --> PRD
```

```mermaid
flowchart LR
  A[1. User creates PR] --> B[2. Submit + Approve PR]
  B --> C[3. Create PO from PR open lines]
  C --> D[4. Submit PO]
  D --> E[5. Create GR from PO open lines]
  E --> F[6. Post GR]
  F --> G[7. Open PR Detail to see linked PO/GR and quantities]
```

Page purpose summary:
- `PR Create`: enter requisition header + line items
- `PR Detail`: show PR status, lines, and fulfillment summary
- `PO Create`: pick approved PR lines and allocate order quantities
- `PO Detail`: review PO status and open quantities
- `GR Create`: receive items against PO lines
- `GR Detail`: confirm posted receipt details

---

## 4) API Scope (REST)

### Requisition
- `POST /api/requisitions`
- `POST /api/requisitions/:id/submit`
- `POST /api/requisitions/:id/approve`
- `GET /api/requisitions/:id`
- `GET /api/requisitions/:id/open-lines`

### Purchase Order
- `POST /api/purchase-orders`
- `POST /api/purchase-orders/:id/submit`
- `GET /api/purchase-orders/:id`
- `GET /api/purchase-orders/:id/open-lines`

### Goods Receipt
- `POST /api/goods-receipts`
- `POST /api/goods-receipts/:id/post`
- `GET /api/goods-receipts/:id`

---

## 5) Data Model (Minimal)
- `PurchaseRequisition`, `PRLine`
- `PurchaseOrder`, `POLine`
- `PRLineAllocation` (for PR line split to PO line)
- `GoodsReceipt`, `GRLine`

Required business rules:
1. PO allocated qty <= PR line remaining qty
2. GR received qty <= PO line open qty
3. Status transitions follow workshop flow only

---

## 6) Workshop Agenda (5 Hours)

### Hour 1 — Setup + Skeleton
- Create backend/frontend folders
- Start PostgreSQL via Docker Compose
- Scaffold Fastify + Vue + base routes

### Hour 2 — PR Module
- Implement PR create/submit/approve
- Add PR detail endpoint
- Add first Jest unit tests

### Hour 3 — PO Module
- Implement open PR lines + PO creation
- Implement allocation validation
- Add Jest tests for edge cases

### Hour 4 — GR Module + UI
- Implement GR create/post
- Build Vue pages/forms for PR, PO, GR
- Show linked documents in PR detail page

### Hour 5 — Playwright + Demo
- Add 1 Playwright happy-path spec (PR -> PO -> GR)
- Run full demo
- Recap Copilot prompting patterns and refactoring flow

---

## 7) Testing Strategy
- Jest for service-level and route validation tests
- Playwright for one end-to-end journey

Suggested minimum:
1. Jest: reject over-allocation
2. Jest: reject over-receiving
3. Playwright: complete happy path and verify final PR tracking values

---

## 8) Local Run Baseline

### Docker
```yaml
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: procurement_mvp
      POSTGRES_USER: workshop
      POSTGRES_PASSWORD: workshop
    ports:
      - "5432:5432"
```

### Backend env
```env
PORT=3000
DATABASE_URL=postgres://workshop:workshop@localhost:5432/procurement_mvp
```

### Frontend env
```env
VITE_API_BASE_URL=http://localhost:3000
```

---

## 9) Copilot Usage by SDLC Phase
1. Requirements: turn broad business asks into strict MVP boundaries
2. Design: generate schema and endpoint skeletons
3. Build: scaffold handlers/services/components
4. Test: generate Jest and Playwright cases
5. Refactor: improve naming, validation, and error handling

---

## 10) Done Criteria
- App runs locally with Docker PostgreSQL + Fastify + Vue
- End-to-end flow works: PR -> PO -> GR
- Quantity validations are enforced
- Jest and Playwright each run at least one meaningful test
