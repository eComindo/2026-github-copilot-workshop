# Project Progress

Last updated: 2026-09-02

## What's implemented

### Backend (Fastify + PostgreSQL)
- App bootstrap in [backend/src/app.js](../backend/src/app.js): CORS, `@fastify/swagger` + `@fastify/swagger-ui` (docs at `/api-docs`), DB plugin, `/health`.
- **Requisition (PR) module** — fully implemented (routes, service, validation, status transitions DRAFT → SUBMITTED → APPROVED).
- **Purchase Order (PO) module** — fully implemented (routes, service, over-allocation guard, DRAFT → SUBMITTED transition). See endpoint list below.
- **Goods Receipt (GR) module** — not implemented (out of workshop scope, left for self-paced exploration).
- DB schema/seed/docker bootstrap present and match `docs/plan.md` (`db/migrations/001_init_procurement_mvp.sql`, `db/seeds/002_seed_procurement_mvp.sql`, `docker/postgres/init/00-init-mvp-db.sh`).

### Backend tests
- Jest, run via `npm test` in `backend/`.
- [requisition-service.test.js](../backend/tests/services/requisition-service.test.js) and [purchase-order-service.test.js](../backend/tests/services/purchase-order-service.test.js) cover list functions (`listRequisitions`, `getRequisitionOpenLines`, `listPurchaseOrders`, `getOpenPoLines`, incl. empty-list cases), PO validation rules, over-allocation guard, and status transitions.
- 29 backend tests passing as of last run.

### Frontend (Vue 3 + Vite)
- **PR pages** — fully wired: `DashboardPage`, `RequisitionListPage`, `RequisitionCreatePage`, `RequisitionDetailPage`, all routed in [router/index.js](../frontend/src/router/index.js).
- **PO pages** — partially built, **not yet wired**:
  - [PurchaseOrderCreatePage.vue](../frontend/src/pages/PurchaseOrderCreatePage.vue) exists with reusable [PoHeaderForm.vue](../frontend/src/components/PoHeaderForm.vue) and [PoLineAllocationTable.vue](../frontend/src/components/PoLineAllocationTable.vue) components (structure only, no API calls yet, local placeholder state).
  - **Missing**: `PurchaseOrderListPage.vue`, `PurchaseOrderDetailPage.vue`, PO routes in the router, PO client functions in [api.js](../frontend/src/api.js).
- Frontend tests use **Vitest** (not Jest — no Jest dependency in `frontend/package.json`), run via `npm test`.
  - New rendering tests: `DashboardPage.spec.js`, `RequisitionListPage.spec.js`, `PoHeaderForm.spec.js`, `PoLineAllocationTable.spec.js`, `PurchaseOrderCreatePage.spec.js` — 11 tests passing.
- Playwright is configured ([playwright.config.js](../playwright.config.js)) but `tests/e2e/` has no spec files yet.

## PO module API endpoints

Defined in [backend/src/routes/purchase-order-routes.js](../backend/src/routes/purchase-order-routes.js):

| Method | Path | Description | Success | Errors |
|---|---|---|---|---|
| GET | `/api/purchase-orders` | List all purchase orders (header fields only) | 200 `{ items: [...] }` | — |
| POST | `/api/purchase-orders` | Create a PO from approved PR lines; validates payload and enforces allocation ≤ remaining PR qty | 201 PO detail | 422 validation/allocation error |
| GET | `/api/purchase-orders/:id` | Get PO detail incl. lines and PR line allocations | 200 PO detail | 404 not found |
| GET | `/api/purchase-orders/:id/open-lines` | Get PO lines still open for goods receipt (`qtyOrdered - qtyReceived > 0`) | 200 `{ purchaseOrder, openLines }` | 404 not found |
| POST | `/api/purchase-orders/:id/submit` | Transition PO from DRAFT → SUBMITTED | 200 PO detail | 404 not found, 422 invalid transition |

## Known gaps / next steps
1. Wire PO pages into the router and add PO functions to `frontend/src/api.js`.
2. Connect `PurchaseOrderCreatePage.vue` to real PR open-lines and PO create/submit APIs (currently stubbed).
3. Build `PurchaseOrderListPage.vue` and `PurchaseOrderDetailPage.vue` (not started).
4. Add Playwright e2e spec for the PR → PO → submit flow (`tests/e2e/` is empty).
5. GR module remains unimplemented, per plan.
