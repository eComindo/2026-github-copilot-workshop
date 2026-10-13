# Project Progress

**Assessed:** 2026-10-12  
**Scope:** Procurement MVP workshop repository

## Current implementation

The repository contains a runnable procurement MVP foundation built with a Vue 3 frontend, a Fastify REST API, and PostgreSQL initialized through Docker.

### Platform and data

- PostgreSQL schema and seed data are present in [db/migrations/001_init_procurement_mvp.sql](../db/migrations/001_init_procurement_mvp.sql) and [db/seeds/002_seed_procurement_mvp.sql](../db/seeds/002_seed_procurement_mvp.sql).
- The schema supports the complete PR -> PO -> GR data flow, including PO lines, PR-to-PO allocations, and GR tables.
- The Fastify app registers CORS, PostgreSQL access, requisition routes, purchase-order routes, and a `GET /health` endpoint.
- The frontend uses Vue Router and a shared REST client in [frontend/src/api.js](../frontend/src/api.js).

### Purchase requisition baseline

The prebuilt PR module is implemented:

- Dashboard with PR status counts and recent PRs.
- PR list, create, and detail pages.
- API support for listing, creating, submitting, approving, retrieving, and viewing open PR lines.
- Jest/Vitest coverage for the PR service and key PR/dashboard frontend pages.

### Purchase order module

#### Implemented backend

- PO routes are registered in [backend/src/app.js](../backend/src/app.js).
- The service lists PO headers; retrieves PO headers, lines, and source PR allocations; and calculates open PO quantity for GR.
- PO creation runs in a transaction, locks each referenced PR line with `FOR UPDATE`, writes the PO header/lines/allocation records, and increments `pr_lines.qty_allocated`.
- PO creation requires an approved source PR and prevents allocation beyond the line's remaining quantity.
- PO submission permits only the `DRAFT -> SUBMITTED` transition.
- Service tests cover payload validation, approved-PR requirements, missing PR lines, over-allocation protection, successful creation, listing, open lines, and submission transitions in [backend/tests/services/purchase-order-service.test.js](../backend/tests/services/purchase-order-service.test.js).

#### Implemented frontend

- Navigation includes a Purchase Orders entry.
- A PO creation route exists at `/purchase-orders/new`.
- The creation page loads open lines from approved PRs, lets users select a source line, and creates a draft PO through `POST /api/purchase-orders`.
- The PO list page loads PO headers through `GET /api/purchase-orders` and links to each PO detail page.
- The PO detail page loads lines and PR allocations through `GET /api/purchase-orders/:id`, shows ordered/received/open quantities, and submits drafts through `POST /api/purchase-orders/:id/submit`.
- Creating a draft PO now redirects directly to its detail page.
- The allocation input has a client-side maximum based on the selected PR line's remaining quantity. The page also prevents duplicate source lines and shows clear validation messages before submitting.
- Server-side validation remains authoritative: the PO service locks source lines, enforces remaining quantity across the full request, and returns a clear `422` response for business-rule violations.
- The allocation table has focused Vitest coverage in [frontend/src/components/purchase-orders/PurchaseOrderLineAllocationTable.test.js](../frontend/src/components/purchase-orders/PurchaseOrderLineAllocationTable.test.js).
- The creation page has Vitest coverage for PR-line loading, over-allocation prevention, and PO request mapping in [frontend/src/pages/PurchaseOrderCreatePage.test.js](../frontend/src/pages/PurchaseOrderCreatePage.test.js).
- The list and detail pages have Vitest coverage for API loading, errors, and draft submission in [frontend/src/pages/PurchaseOrderListPage.test.js](../frontend/src/pages/PurchaseOrderListPage.test.js) and [frontend/src/pages/PurchaseOrderDetailPage.test.js](../frontend/src/pages/PurchaseOrderDetailPage.test.js).

#### Not yet wired or implemented

- No Playwright PO flow exists. The repository has no PO E2E specification.

### Goods receipt module

GR tables exist in the schema, but GR routes, services, frontend pages, and tests are not implemented. This remains outside the workshop implementation scope.

## Available PO API endpoints

Routes are defined in [backend/src/routes/purchase-order-routes.js](../backend/src/routes/purchase-order-routes.js).

| Method | Endpoint | Current behavior |
|---|---|---|
| `GET` | `/api/purchase-orders` | Returns `{ items }`, ordered by newest PO first. |
| `POST` | `/api/purchase-orders` | Creates a draft PO and returns it with lines and PR allocations (`201`). Validation failures return `422`. |
| `POST` | `/api/purchase-orders/:id/submit` | Changes a draft PO to `SUBMITTED`. Returns `404` when absent and `422` unless its current status is `DRAFT`. |
| `GET` | `/api/purchase-orders/:id` | Returns the PO header, lines, and each line's source PR allocations. Returns `404` when absent. |
| `GET` | `/api/purchase-orders/:id/open-lines` | Returns the PO identity and lines whose `qtyOrdered - qtyReceived` is positive. Returns `404` when absent. |

### Create-PO request contract

`POST /api/purchase-orders` expects:

```json
{
  "vendorName": "PT Supplier Jaya",
  "lines": [
    {
      "prLineId": "uuid",
      "itemCode": "BRG-001",
      "itemName": "Safety Helmet",
      "qtyOrdered": 5,
      "unitPrice": 150000,
      "uom": "PCS",
      "siteCode": "WH-JKT",
      "requiredDate": "2026-10-30"
    }
  ]
}
```

Required values are `vendorName`, at least one line, and each line's `prLineId`, item code, item name, positive order quantity, non-negative unit price, UOM, and site code. `requiredDate` is optional.

When a request violates PO business rules, the route returns `422` with `{ "message": "..." }`. Covered rule violations include allocating from a missing or non-approved PR line, allocating more than its remaining quantity, and allocating more than the remaining quantity through multiple entries for the same PR line.

## Test tooling

- `npm test` runs backend Jest and frontend Vitest unit tests.
- `npm run test:e2e` runs Playwright tests when specifications are available.
- The current PO-focused validation consists of 24 passing backend Jest tests, 7 passing frontend Vitest tests, and a passing frontend production build.
- No PO E2E flow exists yet.
