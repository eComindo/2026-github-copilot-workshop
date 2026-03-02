# PO Module Implementation Runbook

## Pre-flight

- DB schema and seed data already exist — no migration changes needed.
- `plan.md` section 5 matches the actual DB schema. Use it as reference.
- All PKs are UUID. PO number format: `PO-2026-XXXX`.
- Schema source of truth: `db/migrations/001_init_procurement_mvp.sql`

### Seed Data Reference

| Entity | Key | Status | Notes |
|---|---|---|---|
| PR-2026-0001 | `...1001` | APPROVED | Line 1: 8 open (Bearing), Line 2: 30 open (Gloves) |
| PR-2026-0002 | `...1002` | SUBMITTED | Not eligible for PO |
| PR-2026-0003 | `...1003` | DRAFT | Not eligible for PO |
| PO-2026-0001 | `...3001` | SUBMITTED | 12 Bearings + 20 Gloves allocated |
| GR-2026-0001 | `...6001` | DRAFT | 5 Bearings received (not posted) |

### Key Schema Reminders

- `purchase_orders` header has only `vendor_name` (no date/currency/terms/notes)
- `po_lines` FK is `po_id`, uses `site_code` + `required_date`
- `pr_line_allocations` qty column is `allocated_qty`
- `pr_lines` has denormalized `qty_allocated` — must UPDATE atomically on PO creation
- `po_lines` has denormalized `qty_received` — must UPDATE atomically on GR posting

---

## Phase 1 — Backend: PO Service

> File: `backend/src/services/purchase-order-service.js`

- [ ] `mapHeader(row)` — snake_case to camelCase (`id`, `poNumber`, `status`, `vendorName`, `createdAt`, `updatedAt`)
- [ ] `mapLine(row)` — include computed `qtyOpenForGr: qty_ordered - qty_received`
- [ ] `createPoNumber(count)` — `PO-2026-XXXX`
- [ ] `listPurchaseOrders(db)` — SELECT all, ORDER BY `created_at DESC`
- [ ] `getPurchaseOrderById(db, id)` — header + lines, return null if not found
- [ ] `getPurchaseOrderOpenLines(db, id)` — lines where `qtyOpenForGr > 0`
- [ ] `validateCreatePayload(payload)` — require `vendorName`, `lines[]` each with `prLineId`, `itemCode`, `itemName`, `qtyOrdered > 0`, `uom`, `unitPrice >= 0`, `siteCode`
- [ ] `createPurchaseOrder(db, payload)` — transactional:
  - Validate payload
  - For each line: check parent PR is APPROVED
  - For each line: check `qty_allocated + qtyOrdered <= qty_requested` (over-allocation guard)
  - INSERT `purchase_orders` + `po_lines` + `pr_line_allocations`
  - UPDATE `pr_lines SET qty_allocated = qty_allocated + qtyOrdered`
  - Return full PO via `getPurchaseOrderById`
- [ ] `submitPurchaseOrder(db, id)` — DRAFT to SUBMITTED only, throw 422 otherwise

## Phase 2 — Backend: PO Routes + Registration

> File: `backend/src/routes/purchase-order-routes.js`

- [ ] `GET /api/purchase-orders` → `{ items }`
- [ ] `POST /api/purchase-orders` → 201 + full PO
- [ ] `POST /api/purchase-orders/:id/submit` → PO or 404
- [ ] `GET /api/purchase-orders/:id` → PO or 404
- [ ] `GET /api/purchase-orders/:id/open-lines` → payload or 404
- [ ] Error handling: same `error.statusCode` pattern as PR routes

> File: `backend/src/app.js`

- [ ] Import and register `purchaseOrderRoutes`

### Checkpoint 1 — Backend API functional

```bash
# Verify with curl against running server + fresh DB
curl localhost:3000/api/purchase-orders
curl -X POST localhost:3000/api/purchase-orders -H 'Content-Type: application/json' -d '{...}'
# Confirm over-allocation returns 422
# Confirm submit transitions DRAFT -> SUBMITTED
```

---

## Phase 3 — Frontend: API Client + Router + Nav

> File: `frontend/src/api.js`

- [ ] `listPurchaseOrders()`
- [ ] `createPurchaseOrder(payload)`
- [ ] `getPurchaseOrder(id)`
- [ ] `submitPurchaseOrder(id)`
- [ ] `getPurchaseOrderOpenLines(id)`

> File: `frontend/src/router/index.js`

- [ ] `/purchase-orders` → `purchase-orders-list`
- [ ] `/purchase-orders/new` → `purchase-orders-create`
- [ ] `/purchase-orders/:id` → `purchase-orders-detail` (props: true)

> File: `frontend/src/App.vue`

- [ ] Add "Purchase Orders" nav link
- [ ] Active state: `route.path.startsWith('/purchase-orders')`

## Phase 4 — Frontend: PO Pages

> File: `frontend/src/pages/PurchaseOrderListPage.vue`

- [ ] Mirror `RequisitionListPage` pattern
- [ ] Table columns: PO Number, Vendor, Status, Created At
- [ ] Status badges (`.draft`, `.submitted`)
- [ ] Row click → detail, page header with back button to `/`

> File: `frontend/src/pages/PurchaseOrderCreatePage.vue`

- [ ] Header section: `vendorName` input
- [ ] PR picker: dropdown of approved PRs → load open lines via `api.getRequisitionOpenLines(prId)`
- [ ] Per line: `qtyOrdered` (max = `qtyOpenForPo`), `unitPrice`, `siteCode`, `requiredDate`
- [ ] Submit: build payload, POST, navigate to detail

> File: `frontend/src/pages/PurchaseOrderDetailPage.vue`

- [ ] Two card panels: header info + lines table
- [ ] Lines columns: Line, Item Code, Item Name, Qty Ordered, Qty Received, UOM, Unit Price, Site
- [ ] "Submit PO" button when status is DRAFT

### Checkpoint 2 — Full PO UI flow working

```
Dashboard → PO List → Create PO (from PR-2026-0001 open lines)
→ PO Detail → Submit PO → status shows SUBMITTED
```

---

## Phase 5 — Jest Unit Tests

> File: `backend/src/services/__tests__/purchase-order-service.test.js`

- [ ] Configure Jest for ESM: `NODE_OPTIONS=--experimental-vm-modules`
- [ ] Test: reject over-allocation (qty exceeds remaining)
- [ ] Test: reject invalid status transition (submit non-DRAFT)
- [ ] Test: reject PO from non-APPROVED PR
- [ ] Test: valid PO creation succeeds

### Checkpoint 3 — Jest tests pass

```bash
cd backend && npm test
```

## Phase 6 — Playwright E2E Tests

> File: `tests/e2e/po-module.spec.js`

- [ ] PO List Page: table renders seed PO, status badge, navigation
- [ ] PO Create Page: select approved PR, see open lines, create PO, redirect to detail
- [ ] PO Workflow: create PO from remaining open lines → submit → verify status
- [ ] Over-allocation rejection: attempt excess qty, verify error

### Checkpoint 4 — E2E tests pass

```bash
npx playwright test tests/e2e/po-module.spec.js
```

---

## Final Verification

| Check | Command / Action |
|---|---|
| Backend API | `curl` all 5 PO endpoints; over-allocation returns 422 |
| UI flow | Dashboard → PO List → Create → Detail → Submit |
| Jest | `cd backend && npm test` |
| Playwright PO | `npx playwright test tests/e2e/po-module.spec.js` |
| Baseline intact | `npx playwright test tests/e2e/pr-module.spec.js` (no regressions) |
