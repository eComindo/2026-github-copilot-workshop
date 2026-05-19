# Project Progress

Last updated: 2026-05-19

## Current Implementation Summary

This repository contains a working Procurement MVP baseline with:

- PostgreSQL schema and seed bootstrap via Docker init script.
- Backend Fastify API with PR and PO modules.
- Frontend Vue app with Dashboard and PR pages fully wired to backend APIs.
- Frontend PO create page and reusable PO form components (currently local-state driven).
- Unit and e2e tests focused on PR baseline and PO service validations.

## Module Status

### Purchase Requisition (PR)

Status: Implemented end-to-end.

Implemented capabilities:

- PR list, create, detail pages in frontend.
- PR backend APIs for create, submit, approve, detail, and open lines.
- Business rules for required fields, numeric validations, and status transitions.

### Purchase Order (PO)

Status: Backend implemented; frontend partially implemented.

Implemented capabilities:

- Backend APIs for list/create/detail/submit/open-lines.
- PO create business validations in service layer:
  - Required payload and line fields.
  - PR line existence check.
  - PR must be APPROVED before allocation.
  - Allocation guard: allocation qty cannot exceed PR line remaining qty.
  - Submit transition guard: only DRAFT can be submitted.
- PO create page exists in frontend with header and line allocation components.

Current frontend limitation:

- PO create page currently saves draft locally and shows notice; it does not call PO backend API yet.
- PO list and PO detail frontend pages are not present yet.

### Goods Receipt (GR)

Status: Out of implementation scope for workshop backlog.

- GR tables are present in database schema.
- GR backend routes/services and frontend pages are not implemented in this repository state.

## Available PO API Endpoints

From current backend route registration, the PO module exposes:

- GET /api/purchase-orders
- POST /api/purchase-orders
- POST /api/purchase-orders/:id/submit
- GET /api/purchase-orders/:id
- GET /api/purchase-orders/:id/open-lines

## Testing Status

Implemented tests include:

- Backend Jest service tests:
  - requisition service tests.
  - purchase order service tests (including over-allocation and status transition validation).
- Frontend Vitest tests:
  - PO create page rendering/behavior tests.
  - PO header form component validation/emit tests.
  - PO line allocation table rendering/emit tests.
  - PR list page rendering/error tests.
- Playwright e2e tests:
  - PR module flows and dashboard navigation/behaviors.

Latest execution status observed in workspace context:

- npm run test:coverage completed successfully (exit code 0).

## Notes on Scope Alignment

This state aligns with workshop guidance:

- Baseline PR module available and working.
- PO backend backlog substantially implemented.
- GR remains intentionally unimplemented for workshop core scope.
