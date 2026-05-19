# Procurement MVP Runbook (PO Backlog Focus)

## Purpose
This runbook provides a strict execution sequence with checkpoints for workshop delivery.

Scope is intentionally limited to Purchase Order (PO) backlog implementation:
- PO list/create/detail UI
- Required PO APIs and validation behavior
- PO-focused unit and E2E testing

Out of scope during this runbook:
- Goods Receipt (GR) implementation
- Enterprise features (SSO, workflow engine, advanced reporting/compliance)
- Broad architecture refactors

## Preconditions
1. Baseline repository is checked out and dependencies are installed.
2. PostgreSQL is running with seeded workshop data.
3. Baseline PR module remains unchanged and working.

Bootstrap DB when needed:

```bash
docker compose down -v
docker compose up -d db
```

## Strict Task Sequence With Checkpoints

### Phase 0: Scope Lock
Tasks:
1. Confirm implementation boundary is PO only.
2. Confirm required PO endpoints from `docs/plan.md` are the contract source.

Checkpoint:
- Scope statement is explicit: "PO only, no GR implementation changes."

Exit criteria:
- Team agreement on scope before code edits.

### Phase 1: Baseline Verification
Tasks:
1. Start backend and frontend.
2. Verify dashboard and PR flow still run on baseline.
3. Verify existing PO backend endpoints respond.

Checkpoint:
- Baseline app is healthy and PR is not regressed before PO UI work.

Exit criteria:
- No blocker in startup, seed data, or baseline navigation.

### Phase 2: API Contract Alignment
Tasks:
1. Align frontend PO API helper methods with backend routes.
2. Confirm payload/response fields for list/create/detail/submit/open-lines.
3. Keep backend behavior unchanged unless a defect is proven.

Checkpoint:
- PO field mapping table is complete and agreed by backend/frontend.

Exit criteria:
- Frontend has clear contract for implementation.

### Phase 3: Navigation and Router Wiring
Tasks:
1. Add PO routes (list/create/detail).
2. Add PO navigation entry in app shell.
3. Ensure direct URL access works for PO pages.

Checkpoint:
- Navigation to PO URLs works without runtime errors.

Exit criteria:
- Route skeleton is stable and ready for page implementation.

### Phase 4: PO List Page
Tasks:
1. Implement PO list page using existing PR list page pattern.
2. Render loading, empty, and error states.
3. Link PO identifier to PO detail route.

Checkpoint:
- List page shows API data and click-through to detail works.

Exit criteria:
- List page is functionally complete and consistent with baseline UI style.

### Phase 5: PO Create Page
Tasks:
1. Implement create form with line allocation workflow.
2. Source approved PR open lines for allocation.
3. Validate required fields and numeric constraints.
4. Submit to `POST /api/purchase-orders`.

Checkpoint:
- Valid create reaches PO detail in DRAFT.
- Invalid over-allocation is rejected with clear user feedback.

Exit criteria:
- Create flow is reliable for both happy and failure paths.

### Phase 6: PO Detail Page and Submit Action
Tasks:
1. Implement PO detail display (header, lines, allocation context).
2. Show submit action only for DRAFT PO.
3. Submit via `POST /api/purchase-orders/:id/submit`.
4. Refresh UI state after submit.

Checkpoint:
- DRAFT -> SUBMITTED transition is visible in UI and enforced.

Exit criteria:
- Submit behavior matches service rule and invalid repeat submit is handled.

### Phase 7: PO Unit Test Hardening
Tasks:
1. Keep tests focused in PO service test file.
2. Ensure over-allocation rejection remains covered.
3. Ensure status transition validation remains covered.
4. Add focused gap tests only if needed (for example multi-line create behavior).

Checkpoint:
- PO service tests pass with explicit business-rule assertions.

Exit criteria:
- Unit coverage supports PO rule confidence without test complexity creep.

### Phase 8: PO End-to-End Coverage
Tasks:
1. Add PO Playwright spec for list/create/detail/submit.
2. Add one integrated journey from approved PR lines to submitted PO.
3. Keep assertions deterministic against workshop seed assumptions.

Checkpoint:
- PO E2E spec passes consistently.

Exit criteria:
- UI flow confidence established for workshop demo and participant validation.

### Phase 9: Regression and Scope Audit (Release Gate)
Tasks:
1. Re-run PO unit tests.
2. Re-run PO E2E tests.
3. Run PR smoke flow to confirm no cross-module regression.
4. Confirm no GR implementation changes were introduced.

Checkpoint:
- Test results and scope audit both pass.

Exit criteria:
- PO backlog accepted as done for MVP workshop scope.

## Recommended File Touch Map
- `frontend/src/api.js`
- `frontend/src/router/index.js`
- `frontend/src/App.vue`
- `frontend/src/pages/PurchaseOrderListPage.vue`
- `frontend/src/pages/PurchaseOrderCreatePage.vue`
- `frontend/src/pages/PurchaseOrderDetailPage.vue`
- `backend/tests/services/purchase-order-service.test.js`
- `tests/e2e/po-module.spec.js`

## Acceptance Checklist (Definition of Done)
1. PO routes required by plan are available and behaviorally correct.
2. PO UI pages (list/create/detail) are navigable and functional.
3. Over-allocation rule is enforced and user-visible on failure.
4. PO submit transition is explicit and invalid transitions are rejected.
5. PO unit tests cover core validation and transition rules.
6. PO E2E flow validates create and submit journey.
7. PR baseline behavior remains intact.
8. No GR implementation work is introduced.

## Notes for Workshop Delivery
1. Prefer workshop clarity over abstraction-heavy implementation.
2. Keep route handlers thin and place PO rules in service logic.
3. When defects appear, patch the specific PO rule and add a matching focused test before continuing.
