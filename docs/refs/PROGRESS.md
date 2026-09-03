# Project Progress

Snapshot analysis based on `graphify-out/graph.json` and current source (no running server used for this analysis).

## 1. Module Status Overview

| Module | Backend (routes+service) | Unit Tests | Frontend Pages | Frontend/API Wiring |
|---|---|---|---|---|
| Dashboard | n/a | n/a | `DashboardPage.vue` implemented | Uses `api.getDashboard()` (derived from requisitions) |
| Purchase Requisition (PR) | Implemented (`requisition-routes.js`, `requisition-service.js`) | `requisition-service.test.js` | List/Create/Detail implemented | Wired to real API calls |
| Purchase Order (PO) | Implemented (`purchase-order-routes.js`, `purchase-order-service.js`) | `purchase-order-service.test.js` (29 cases) | Create page + reusable components built; List page is a placeholder | **Not wired** — `POCreatePage.vue` only logs to console, no real `api.createPurchaseOrder()` call yet |
| Goods Receipt (GR) | Not implemented — only DB schema exists (`goods_receipts`, `gr_lines`) | None | None | None (out of workshop scope) |

## 2. Purchase Order API Endpoints (implemented in `backend/src/routes/purchase-order-routes.js`)

| Method | Path | Handler | Notes |
|---|---|---|---|
| GET | `/api/purchase-orders` | `listPurchaseOrders` | Returns `{ items }`, ordered by `created_at DESC` |
| POST | `/api/purchase-orders` | `createPurchaseOrder` | Transactional; locks PR lines `FOR UPDATE`; enforces over-allocation guard and `PR.status === APPROVED`; returns `201` with created PO detail |
| POST | `/api/purchase-orders/:id/submit` | `submitPurchaseOrder` | `DRAFT → SUBMITTED` only; `404` if not found, `422` if not in `DRAFT` |
| GET | `/api/purchase-orders/:id` | `getPurchaseOrderById` | Returns header + lines + allocation source (PR line/number) |
| GET | `/api/purchase-orders/:id/open-lines` | `getOpenPoLines` | Returns lines where `qtyOpenForGr > 0` (for future GR module) |

These match the endpoints required by `docs/specs/001-most-viable-product/plan.md` and `.github/copilot-instructions.md`.

## 3. Known Issue — Route Schema / Service Field Casing Mismatch

`createPurchaseOrderSchema` (Fastify body schema) requires **snake_case** keys:
```
vendor_name, lines[].pr_line_id, lines[].allocated_qty, lines[].unit_price
```
but `validateCreatePayload()` in `purchase-order-service.js` (and the rest of `createPurchaseOrder`) reads **camelCase** keys:
```
payload.vendorName, line.prLineId, line.qtyOrdered, line.unitPrice, line.itemCode, line.itemName, line.uom, line.siteCode
```
The schema also omits `item_code`, `item_name`, `uom`, `site_code`, `required_date` entirely, even though the service requires them.

Effect: a request built to satisfy the Fastify schema (snake_case) will fail service validation (expects camelCase), and a request using camelCase will fail Fastify's own `required` schema check. **`POST /api/purchase-orders` cannot currently succeed over real HTTP.**

The same mismatch pattern exists in the PR module (`createRequisitionSchema` uses snake_case, `requisition-service.js` uses camelCase), so this is a pre-existing baseline issue, not something introduced by the PO work. It is not caught by current tests because tests call service functions directly, bypassing Fastify schema validation.

**Suggested fix (not yet applied):** align route schemas to camelCase (matching service code), or add a request-body mapping layer. Recommend fixing both PR and PO routes together for consistency.

## 4. Frontend State

- `frontend/src/pages/POCreatePage.vue`: composes `POHeaderForm.vue` + `POLineAllocationTable.vue`; `handleSubmit()` currently only logs to console and sets an "API integration pending" message — no call to `api.createPurchaseOrder()`.
- `frontend/src/pages/POListPage.vue`: static placeholder, does not call `api.listPurchaseOrders()`.
- No PO Detail page exists yet.
- `frontend/src/api.js` already defines `listPurchaseOrders`, `createPurchaseOrder`, `getPurchaseOrder`, `submitPurchaseOrder`, `getPurchaseOrderOpenLines` — ready to be wired in once the schema mismatch above is fixed.
- `POHeaderForm.vue`'s PR dropdown uses a hardcoded local list (`prList`), not a real fetch from `/api/requisitions`.

## 5. Test Coverage

- Backend unit tests: `npm test` → 2 suites, 26 tests, all passing (service-layer only, DB mocked).
  - PO tests cover: payload validation, over-allocation guard, PR status check (`APPROVED` required), create success/rollback, submit status transitions (`DRAFT→SUBMITTED`, rejects `SUBMITTED`/`CANCELLED`), list/open-lines mapping.
- Frontend unit tests: no `*.spec.js`/`*.test.js` files found despite Vitest being configured; `frontend/coverage/` HTML reports exist for `POHeaderForm.vue` and `POLineAllocationTable.vue` from a prior run, but no current spec files.
- E2E (Playwright): no spec files found; `playwright.config.js` exists but no test suite is authored yet.

## 6. Remaining Backlog for PO Module Completion

1. Fix the schema/service casing mismatch (Section 3) — blocks all PO API usage.
2. Wire `POCreatePage.vue` to `api.createPurchaseOrder()` and `api.submitPurchaseOrder()`.
3. Replace hardcoded `prList` in `POHeaderForm.vue` with a real `api.listRequisitions()` (or an approved-PR-only endpoint) call.
4. Implement PO Detail page and wire real data into `POListPage.vue`.
5. Add Playwright coverage for the PO create/submit flow.
6. GR module remains explicitly out of scope for this workshop.
