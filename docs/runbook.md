# Procurement MVP Workshop Runbook

Use this checklist to deliver the Purchase Order (PO) workshop backlog. The
canonical scope is in [plan.md](./plan.md).

## Scope Guardrails

- [x] Treat Home/Dashboard and the Purchase Requisition (PR) module as the provided baseline.
- [x] Implement only the PO module: list, create, detail, APIs, and validations.
- [x] Do not implement Goods Receipt (GR) during the workshop.
- [x] Keep route handlers thin; put PO rules in the PO service.
- [x] Do not add enterprise features such as SSO, workflow engines, reporting, or notifications.

## 1. Prepare the Workspace

- [ ] Install Docker and a supported Node.js version.
- [ ] Install root dependencies:

  ```bash
  npm install
  ```

- [ ] Install backend and frontend dependencies:

  ```bash
  (cd backend && npm install)
  (cd frontend && npm install)
  ```

- [ ] Create local environment files:

  ```bash
  cp backend/.env.example backend/.env
  cp frontend/.env.example frontend/.env
  ```

- [ ] Start a fresh database. This removes the local workshop database volume:

  ```bash
  docker compose down -v
  docker compose up -d db
  ```

- [ ] Confirm seeded PR data is available:

  ```bash
  docker compose exec -T db psql -U workshop -d procurement_mvp \
    -c "SELECT pr_number, status FROM purchase_requisitions ORDER BY pr_number;"
  ```

- [ ] Start the application:

  ```bash
  npm run dev
  ```

- [ ] Verify the backend on `http://localhost:3000` and frontend on `http://localhost:5173`.
- [ ] Verify the baseline Dashboard and PR list, create, and detail flows before changing code.

## 2. Confirm the PO Contract

- [x] Add or retain `GET /api/purchase-orders` for the PO list page.
- [x] Implement `POST /api/purchase-orders`.
- [x] Implement `POST /api/purchase-orders/:id/submit`.
- [x] Implement `GET /api/purchase-orders/:id`.
- [x] Implement `GET /api/purchase-orders/:id/open-lines`.
- [x] Return `404` when a requested PO does not exist.
- [x] Return `422` with a clear message for invalid PO requests or transitions.

### Create Request Requirements

- [x] Require a non-empty `vendorName`.
- [x] Require at least one line.
- [x] For every line, require `prLineId`, `itemCode`, `itemName`, `uom`, and `siteCode`.
- [x] Require `qtyOrdered > 0`.
- [x] Require `unitPrice >= 0`.
- [x] Accept `requiredDate` as optional.

## 3. Implement PO Business Rules

- [x] Create each PO in `DRAFT` status.
- [x] Allow allocation only from an `APPROVED` PR line.
- [x] Calculate PR remaining quantity as `qty_requested - qty_allocated`.
- [x] Reject an allocation when `qtyOrdered` exceeds the PR line's remaining quantity, including combined allocations for the same PR line in one request.
- [x] Lock every referenced PR line and validate all lines in one database transaction.
- [x] Create one `po_lines` record per request line.
- [x] Create one `pr_line_allocations` record per PO line.
- [x] Increment `pr_lines.qty_allocated` by the allocated quantity in the same transaction.
- [x] Roll back the full transaction if any line fails validation.
- [x] Permit only the `DRAFT -> SUBMITTED` PO status transition.
- [x] Return only lines where `qty_ordered - qty_received > 0` from the PO open-lines endpoint.

## 4. Build the PO UI

- [x] Add a PO list page using `GET /api/purchase-orders`.
- [x] Add a PO create page that uses approved PR open lines as allocation sources.
- [x] Show the PR line's remaining quantity before allocation.
- [x] Prevent obviously invalid quantities in the form, while retaining server-side validation.
- [x] Add a PO detail page showing header, lines, allocations, status, and open quantity.
- [x] Add a submit action visible only for DRAFT POs.
- [x] Surface API validation messages to the user.
- [x] Follow existing baseline navigation, layout, CSS variables, and component patterns.

## 5. Validate the Delivery

- [x] Run focused PO unit tests:

  ```bash
  npm run test:backend
  npm run test:frontend
  ```

- [x] Add Jest coverage for:
  - [x] allocation greater than the PR line remaining quantity is rejected;
  - [x] allocation equal to the remaining quantity is allowed;
  - [x] submitting a non-DRAFT PO is rejected.

- [x] Add Vitest coverage for:
  - [x] PO creation request mapping and client-side allocation validation;
  - [x] PO list loading and error handling;
  - [x] PO detail loading and draft submission.

- [ ] Add a Playwright test for:
  - [ ] seeded approved PR line;
  - [ ] PO creation;
  - [ ] PO submission;
  - [ ] PO detail assertions.

- [ ] Run the end-to-end suite with the app and database running after adding a PO E2E specification:

  ```bash
  npm run test:e2e
  ```

- [ ] Manually verify that a rejected PO creation does not leave a PO, allocation, or PR quantity update behind.

## 6. Review and Handoff

- [ ] Confirm the Dashboard and PR baseline still work.
- [x] Confirm no GR implementation was added.
- [x] Review changed files for focused PO-only scope.
- [ ] Open a pull request and request a Copilot review.
- [ ] Create a GitHub Issue for the optional bookmark exercise; do not include it in the PO backlog.
- [x] Demo flow is available: approved PR line -> PO create -> PO submit -> PO detail.

## Troubleshooting

### Database tables or seed data are missing

```bash
chmod +x docker/postgres/init/00-init-mvp-db.sh
docker compose down -v
docker compose up -d db
docker compose logs --no-color db | tail -n 120
```

Expected database log messages:

- `[initdb] Running baseline migration...`
- `[initdb] Seeding sample data...`
- `[initdb] Database initialization complete.`

### Port is already in use

- [ ] Stop the process using port `3000` or `5173`, then restart `npm run dev`.
- [ ] Ensure Docker can bind PostgreSQL port `5433`.

### PO creation fails unexpectedly

- [ ] Confirm the source PR is `APPROVED`.
- [ ] Recheck the PR line remaining quantity.
- [ ] Confirm every required line field is present.
- [ ] Inspect the API response message before changing the request or service logic.
