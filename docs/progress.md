# Project Progress

Date: 2026-09-02

## Current State

The repository already has a working procurement MVP baseline with a Fastify backend, a Vue 3 + Vite frontend, PostgreSQL schema/seed bootstrapping, and Swagger UI exposed at `/api-docs`.

The following pieces are implemented:

- Backend app bootstrap with CORS, Swagger, database plugin wiring, and `/health`.
- Purchase Requisition module endpoints and UI, including list, create, detail, submit, approve, and open-lines flows.
- Purchase Order module routes, service logic, and frontend pages for list, create, and detail.
- PO business validation for required payload fields, draft submission rules, and over-allocation protection against PR remaining quantity.
- Jest coverage for the PO service validation and allocation rules.
- Frontend navigation for Dashboard, Requisitions, and Purchase Orders.

Goods Receipt is still out of scope for this workshop baseline and is not implemented yet.

## Purchase Order API Endpoints

The PO module currently exposes these endpoints:

- `GET /api/purchase-orders` - list purchase orders.
- `POST /api/purchase-orders` - create a purchase order from approved PR allocations.
- `POST /api/purchase-orders/:id/submit` - submit a draft PO.
- `GET /api/purchase-orders/:id` - fetch PO header, lines, and linked PR allocations.
- `GET /api/purchase-orders/:id/open-lines` - fetch open PO lines with remaining quantities.

## Notes

- PO creation is transactional and prevents allocation beyond the remaining quantity on each PR line.
- PO submission is limited to records in `DRAFT` status.
- The frontend PO create page currently captures vendor and line allocation data, then navigates to the new PO detail page after save.
- The frontend PO detail page can submit a draft PO from the page.

## Verification Snapshot

- The frontend build has already completed successfully in the current workspace state.
- The backend app bootstraps successfully and registers the API routes.