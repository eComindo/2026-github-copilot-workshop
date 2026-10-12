# Procurement MVP Workshop Runbook

Use this checklist to deliver the Purchase Order (PO) workshop backlog. The
canonical scope is in [plan.md](./plan.md).

## Scope Guardrails

- [ ] Treat Home/Dashboard and the Purchase Requisition (PR) module as the provided baseline.
- [ ] Implement only the PO module: list, create, detail, APIs, and validations.
- [ ] Do not implement Goods Receipt (GR) during the workshop.
- [ ] Keep route handlers thin; put PO rules in the PO service.
- [ ] Do not add enterprise features such as SSO, workflow engines, reporting, or notifications.

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

- [ ] Add or retain `GET /api/purchase-orders` for the PO list page.
- [ ] Implement `POST /api/purchase-orders`.
- [ ] Implement `POST /api/purchase-orders/:id/submit`.
- [ ] Implement `GET /api/purchase-orders/:id`.
- [ ] Implement `GET /api/purchase-orders/:id/open-lines`.
- [ ] Return `404` when a requested PO does not exist.
- [ ] Return `422` with a clear message for invalid PO requests or transitions.

### Create Request Requirements

- [ ] Require a non-empty `vendorName`.
- [ ] Require at least one line.
- [ ] For every line, require `prLineId`, `itemCode`, `itemName`, `uom`, and `siteCode`.
- [ ] Require `qtyOrdered > 0`.
- [ ] Require `unitPrice >= 0`.
- [ ] Accept `requiredDate` as optional.

## 3. Implement PO Business Rules

- [ ] Create each PO in `DRAFT` status.
- [ ] Allow allocation only from an `APPROVED` PR line.
- [ ] Calculate PR remaining quantity as `qty_requested - qty_allocated`.
- [ ] Reject an allocation when `qtyOrdered` exceeds the PR line's remaining quantity.
- [ ] Lock every referenced PR line and validate all lines in one database transaction.
- [ ] Create one `po_lines` record per request line.
- [ ] Create one `pr_line_allocations` record per PO line.
- [ ] Increment `pr_lines.qty_allocated` by the allocated quantity in the same transaction.
- [ ] Roll back the full transaction if any line fails validation.
- [ ] Permit only the `DRAFT -> SUBMITTED` PO status transition.
- [ ] Return only lines where `qty_ordered - qty_received > 0` from the PO open-lines endpoint.

## 4. Build the PO UI

- [ ] Add a PO list page using `GET /api/purchase-orders`.
- [ ] Add a PO create page that uses approved PR open lines as allocation sources.
- [ ] Show the PR line's remaining quantity before allocation.
- [ ] Prevent obviously invalid quantities in the form, while retaining server-side validation.
- [ ] Add a PO detail page showing header, lines, allocations, status, and open quantity.
- [ ] Add a submit action visible only for DRAFT POs.
- [ ] Surface API validation messages to the user.
- [ ] Follow existing baseline navigation, layout, CSS variables, and component patterns.

## 5. Validate the Delivery

- [ ] Run unit tests:

  ```bash
  npm run test:backend
  npm run test:frontend
  ```

- [ ] Add Jest coverage for:
  - [ ] allocation greater than the PR line remaining quantity is rejected;
  - [ ] allocation equal to the remaining quantity is allowed;
  - [ ] submitting a non-DRAFT PO is rejected.

- [ ] Add a Playwright test for:
  - [ ] seeded approved PR line;
  - [ ] PO creation;
  - [ ] PO submission;
  - [ ] PO detail assertions.

- [ ] Run the end-to-end suite with the app and database running:

  ```bash
  npm run test:e2e
  ```

- [ ] Manually verify that a rejected PO creation does not leave a PO, allocation, or PR quantity update behind.

## 6. Review and Handoff

- [ ] Confirm the Dashboard and PR baseline still work.
- [ ] Confirm no GR implementation was added.
- [ ] Review changed files for focused PO-only scope.
- [ ] Open a pull request and request a Copilot review.
- [ ] Create a GitHub Issue for the optional bookmark exercise; do not include it in the PO backlog.
- [ ] Demo: approved PR line -> PO create -> PO submit -> PO detail.

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
