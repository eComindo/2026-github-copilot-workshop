# Copilot Workshop Plan: Procurement MVP (5 Hours)

## 1) Goal
Build a realistic but small procurement web app to practice using Copilot across SDLC phases.

MVP flow:
1. Purchase Requisition (PR) create + submit + approve
2. Purchase Order (PO) create from approved PR lines + submit
3. Goods Receipt (GR) create from PO lines + post
4. PR detail shows linked PO/GR and quantities

Out of scope: production hardening, SSO, advanced approval matrix, reporting, notifications, and full enterprise compliance controls.

Workshop implementation strategy:
1. Core schema migration from this ERD is pre-provided in repository and applied by participants.
2. Home/Dashboard + PR module (list/create/detail + PR APIs) are prebuilt and working.
3. Participant backlog focus is PO module only (PO list/create/detail + PO APIs + PO validations).
4. GR module is not implemented during workshop and is left for further exploration.
5. Bookmark feature is post-backlog and practiced via GitHub Issue-driven development.

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
  PRL[PR List Page]
  POL[PO List Page]
  GRL[GR List Page]
  PRC[PR Create Page]
  PRD[PR Detail Page]
  POC[PO Create Page]
  POD[PO Detail Page]
  GRC[GR Create Page]
  GRD[GR Detail Page]

  HOME --> PRL
  HOME --> POL
  HOME --> GRL

  PRL --> PRC
  PRL --> PRD
  POL --> POC
  POL --> POD
  GRL --> GRC
  GRL --> GRD

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

Target system APIs (full procurement flow):

### Requisition
- `POST /api/requisitions`
- `POST /api/requisitions/:id/submit`
- `POST /api/requisitions/:id/approve`
- `GET /api/requisitions/:id`
- `GET /api/requisitions/:id/open-lines`

Workshop status: prebuilt in baseline.

### Purchase Order
- `POST /api/purchase-orders`
- `POST /api/purchase-orders/:id/submit`
- `GET /api/purchase-orders/:id`
- `GET /api/purchase-orders/:id/open-lines`

Workshop status: participant implementation backlog (primary focus).

### Goods Receipt
- `POST /api/goods-receipts`
- `POST /api/goods-receipts/:id/post`
- `GET /api/goods-receipts/:id`

Workshop status: out of implementation scope (further exploration).

---

## 5) Data Model (MVP)

The model is intentionally small and only supports PR -> PO -> GR flow.

### 5.1) Core Tables

1. `purchase_requisitions` (PR header)
  - `id` (PK)
  - `pr_number` (UNIQUE)
  - `requester_name`
  - `department`
  - `title`
  - `needed_by_date`
  - `notes` (nullable)
  - `status` (`DRAFT | SUBMITTED | APPROVED`)
  - `created_at`, `updated_at`

2. `pr_lines` (PR item lines)
  - `id` (PK)
  - `requisition_id` (FK -> `purchase_requisitions.id`)
  - `line_no`
  - `item_code`, `item_name`
  - `qty_requested` (numeric > 0)
  - `uom`
  - `est_unit_price` (numeric >= 0)
  - `site`
  - `required_date`
  - `budget_center`
  - `created_at`, `updated_at`
  - UNIQUE(`requisition_id`, `line_no`)

3. `purchase_orders` (PO header)
  - `id` (PK)
  - `po_number` (UNIQUE)
  - `vendor_name`
  - `po_date`
  - `currency_code`
  - `payment_terms`
  - `notes` (nullable)
  - `status` (`DRAFT | SUBMITTED`)
  - `created_at`, `updated_at`

4. `po_lines` (PO item lines)
  - `id` (PK)
  - `purchase_order_id` (FK -> `purchase_orders.id`)
  - `line_no`
  - `item_code`, `item_name`
  - `qty_ordered` (numeric > 0)
  - `uom`
  - `unit_price` (numeric >= 0)
  - `delivery_address`
  - `delivery_date`
  - `created_at`, `updated_at`
  - UNIQUE(`purchase_order_id`, `line_no`)

5. `pr_line_allocations` (bridge PR line -> PO line)
  - `id` (PK)
  - `pr_line_id` (FK -> `pr_lines.id`)
  - `po_line_id` (FK -> `po_lines.id`)
  - `qty_allocated` (numeric > 0)
  - `created_at`
  - UNIQUE(`pr_line_id`, `po_line_id`)

6. `goods_receipts` (GR header)
  - `id` (PK)
  - `gr_number` (UNIQUE)
  - `purchase_order_id` (FK -> `purchase_orders.id`)
  - `receipt_date`
  - `notes` (nullable)
  - `status` (`DRAFT | POSTED`)
  - `created_at`, `updated_at`

7. `gr_lines` (GR item lines)
  - `id` (PK)
  - `goods_receipt_id` (FK -> `goods_receipts.id`)
  - `po_line_id` (FK -> `po_lines.id`)
  - `line_no`
  - `qty_received` (numeric > 0)
  - `created_at`, `updated_at`
  - UNIQUE(`goods_receipt_id`, `line_no`)

### 5.2) ERD (MVP)

```mermaid
erDiagram
   purchase_requisitions ||--|{ pr_lines : has
   purchase_orders ||--|{ po_lines : has
   pr_lines ||--o{ pr_line_allocations : allocated_to
   po_lines ||--o{ pr_line_allocations : receives_allocation
   purchase_orders ||--o{ goods_receipts : has
   goods_receipts ||--|{ gr_lines : has
   po_lines ||--o{ gr_lines : received_by

   purchase_requisitions {
    bigint id PK
    string pr_number UK
    string requester_name
    string department
    string title
    date needed_by_date
    string notes
    string status
    timestamp created_at
    timestamp updated_at
   }

   pr_lines {
    bigint id PK
    bigint requisition_id FK
    int line_no
    string item_code
    string item_name
    numeric qty_requested
    string uom
    numeric est_unit_price
    string site
    date required_date
    string budget_center
    timestamp created_at
    timestamp updated_at
   }

   purchase_orders {
    bigint id PK
    string po_number UK
    string vendor_name
    date po_date
    string currency_code
    string payment_terms
    string notes
    string status
    timestamp created_at
    timestamp updated_at
   }

   po_lines {
    bigint id PK
    bigint purchase_order_id FK
    int line_no
    string item_code
    string item_name
    numeric qty_ordered
    string uom
    numeric unit_price
    string delivery_address
    date delivery_date
    timestamp created_at
    timestamp updated_at
   }

   pr_line_allocations {
    bigint id PK
    bigint pr_line_id FK
    bigint po_line_id FK
    numeric qty_allocated
    timestamp created_at
   }

   goods_receipts {
    bigint id PK
    string gr_number UK
    bigint purchase_order_id FK
    date receipt_date
    string notes
    string status
    timestamp created_at
    timestamp updated_at
   }

   gr_lines {
    bigint id PK
    bigint goods_receipt_id FK
    bigint po_line_id FK
    int line_no
    numeric qty_received
    timestamp created_at
    timestamp updated_at
   }
```

### 5.3) Rule Mapping to Data Model

1. PO allocated qty <= PR line remaining qty  
  - Check: SUM(`pr_line_allocations.qty_allocated`) per `pr_line_id` <= `pr_lines.qty_requested`

2. GR received qty <= PO line open qty  
  - Check: SUM(`gr_lines.qty_received`) per `po_line_id` <= `po_lines.qty_ordered`

3. Status transitions follow workshop flow only  
  - PR: `DRAFT -> SUBMITTED -> APPROVED`  
  - PO: `DRAFT -> SUBMITTED`  
  - GR: `DRAFT -> POSTED`

---

## 6) Workshop Agenda (5 Hours)

### Hour 1 — Setup + Baseline Boot
- Clone repo, start PostgreSQL via Docker Compose
- Apply pre-provided core migration script
- Configure backend/frontend `.env` and run baseline app
- Verify Home/Dashboard + PR module are already working

### Hour 2 — PO Backlog: API + Data Rules
- Implement PO create/submit/detail/open-lines endpoints
- Implement allocation validation (allocated qty <= PR remaining qty)
- Keep handlers thin and move rules to PO service

### Hour 3 — PO Backlog: UI Pages
- Build PO list/create/detail pages on top of baseline navigation
- Connect pages to PO APIs
- Validate create-from-approved-PR-line flow

### Hour 4 — PO-focused Testing + GitHub Review
- Add Jest tests focused on PO rules and status transitions
- Add Playwright flow for PO pages integrated with baseline PR data
- Open PR and use Copilot review + code quality checks

### Hour 5 — Optional Extension + Exploration
- Implement Bookmark feature from GitHub Issue (optional, post-backlog)
- Demo completed PO backlog
- GR module left as self-paced exploration using this plan

---

## 7) Testing Strategy
- Jest for service-level and route validation tests
- Playwright for PO-focused end-to-end journey on top of baseline PR

Suggested minimum:
1. Jest: reject over-allocation
2. Jest: reject invalid PO status transition
3. Playwright: PR baseline data -> PO create -> PO submit -> PO detail assertions

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
- Baseline Home/Dashboard + PR pages/APIs run without modification
- PO backlog is implemented (PO list/create/detail + required PO endpoints)
- PO quantity validations are enforced
- Jest and Playwright each run at least one PO-focused meaningful test
- Bookmark feature is captured as a GitHub Issue (or implemented if time allows)
