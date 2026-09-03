# Workshop Runbook: PO Backlog Task Sequence

Validation note: PO backend (routes, service, over-allocation rule, Jest tests) is already
fully implemented in baseline. The actual participant backlog is PO frontend pages,
router wiring, API client, and a Playwright e2e test.

## Phase A — Baseline Verify (blocks all else)
- [ ] `docker compose down -v && docker compose up -d db`
- [ ] Start backend dev server (`npm run dev` in `backend/`)
- [ ] Start frontend dev server (`npm run dev` in `frontend/`)
- [ ] **Checkpoint A**: Dashboard + PR list/create/detail load; `GET /api/purchase-orders/:id` returns seeded PO

## Phase B — PO Frontend Pages (primary backlog, depends on A)
- [ ] Create `frontend/src/pages/PurchaseOrderListPage.vue` (mirror `RequisitionListPage.vue`)
- [ ] Create `frontend/src/pages/PurchaseOrderCreatePage.vue` — select APPROVED PR open lines, allocate qty/unit price, `POST /api/purchase-orders`
- [ ] Create `frontend/src/pages/PurchaseOrderDetailPage.vue` — show status/lines, `POST /api/purchase-orders/:id/submit`
- [ ] Wire PO routes in `frontend/src/router/index.js`; add nav links from `DashboardPage.vue` and `RequisitionDetailPage.vue`
- [ ] Extend `frontend/src/api.js` with PO client calls (list/create/get/submit/open-lines)
- [ ] **Checkpoint B**: manual walk PR(APPROVED) -> PO create -> PO submit -> PO detail; confirm `qty_allocated` updates on PR side

## Phase C — Testing (depends on B)
- [ ] Confirm existing `backend/tests/services/purchase-order-service.test.js` passes (`npm test` in `backend/`) — no new backend tests expected
- [ ] Add Playwright spec `tests/e2e/po-flow.spec.js`: baseline PR -> PO create -> submit -> detail assertions
- [ ] **Checkpoint C**: `npx playwright test` passes

## Phase D — Review (depends on C)
- [ ] Open GitHub PR, run Copilot code review
- [ ] **Checkpoint D**: no blocking review comments; Done Criteria in `docs/plan.md` §10 satisfied for PO scope

## Out of scope
GR module, SSO, notifications, reporting, production hardening. Bookmark/GitHub-Issue feature
remains optional Hour 5 stretch, not part of this sequence.
