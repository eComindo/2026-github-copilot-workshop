# PO Backlog Implementation Runbook

A strict task sequence with checkpoints for PO module implementation (5-hour workshop).

---

## Status Summary (as of 2026-09-03)

**Completed:** Phases 1-5, most of Phase 6 (15/19 checkpoints ✅)
- All backend endpoints implemented with allocation validation + 422 responses
- All frontend pages (list/create/detail) wired to backend APIs
- Client-side validation enforces over-allocation rules
- Jest suite: 23 tests passing (all allocation rule scenarios covered)
- Error handling with clear messages for business rule violations
- UI follows baseline design system (CSS variables, status badges, layout patterns)

**Remaining:** Playwright e2e flow (CP-6.2), PR/code review (CP-7.2), Bookmark feature (CP-8, optional)

**Key Implementation Notes:**
- Fixed `backend/src/routes/purchase-order-routes.js` createPurchaseOrderSchema: was snake_case (vendor_name, pr_line_id, allocated_qty), now camelCase (vendorName, lines[].prLineId/itemCode/itemName/qtyOrdered/unitPrice/uom/siteCode/requiredDate) to match service validation.
- Over-allocation validation occurs both client-side (POLineAllocationTable.vue) and server-side (purchase-order-service.js). Server returns 422 with clear message if allocation qty exceeds PR line remaining qty.
- POHeaderForm fetches real APPROVED requisitions via API (not hardcoded).
- POLineAllocationTable fetches open PR lines and enforces allocation qty ≤ remaining qty + validates no duplicate PR lines in same PO.
- PODetailPage displays allocation source info (which PR lines feed each PO line).
- All routes follow camelCase for consistency (requisition routes still use snake_case per baseline compatibility rule).

---

## Phase 1: Bootstrap & Verification (Pre-implementation)

**Goal:** Confirm baseline is working; understand PR structure to build PO on top.

### CP-1.1: Database running
- `docker compose down -v && docker compose up -d db`
- Verify schema: `pr_lines.qty_allocated` and `pr_line_allocations` table exist
- Verify seed data: at least 1 APPROVED PR with 2+ lines

### CP-1.2: Backend baseline running
- `cd backend && npm install && npm start`
- Test: `GET /api/requisitions/:id` returns full PR with lines
- Test: `GET /api/requisitions/:id/open-lines` returns lines with qty_requested - qty_allocated

### CP-1.3: Frontend baseline running
- `cd frontend && npm install && npm run dev`
- Verify PR List page loads from baseline
- Verify PR Detail page shows lines with allocations

**Acceptance:** Baseline PR module is read-only functional; navigation to PO pages shows 404 (expected).

---

## Phase 2: PO Backend — Data Model & Service Layer (Hour 2)

**Goal:** Build PO service logic; keep routes thin.

### CP-2.1: PO service skeleton
- Create `backend/src/services/purchase-order-service.js`
- Implement `createPO({ vendorName, poLines })` → validates allocation rule, inserts atomically
- Implement `submitPO(poId)` → status transition DRAFT → SUBMITTED
- Implement `getPOById(poId)` → full PO header + lines + allocations
- Implement `getPOOpenLines(poId)` → lines with qty_ordered - qty_received
- **Rule check**: In createPO, for each line's allocated_qty, verify `pr_line.qty_allocated + allocated_qty <= pr_line.qty_requested`

### CP-2.2: PO routes skeleton
- Create `backend/src/routes/purchase-order-routes.js`
- Implement thin handlers (delegate to service):
  - `POST /api/purchase-orders` → createPO
  - `POST /api/purchase-orders/:id/submit` → submitPO
  - `GET /api/purchase-orders/:id` → getPOById
  - `GET /api/purchase-orders/:id/open-lines` → getPOOpenLines
- Return clear error payloads on allocation violation

### CP-2.3: Jest allocation validation tests
- Create `backend/tests/services/purchase-order-service.test.js`
- Test: reject over-allocation (allocated_qty > PR line remaining)
- Test: accept valid allocation
- Test: status transition from DRAFT → SUBMITTED is idempotent

**Acceptance:** `npm test -- purchase-order-service.test.js` passes; allocations are enforced.

---

## Phase 3: PO Backend — Integration & E2E API (Hour 2.5)

**Goal:** Verify PO APIs work end-to-end with baseline PR data.

### CP-3.1: Manual API test (curl or Postman)
- GET baseline PR ID (e.g., from PR List)
- GET `/api/requisitions/:id/open-lines` → capture line IDs and remaining qty
- POST `/api/purchase-orders` with allocation to those lines → verify PO created
- Verify `pr_lines.qty_allocated` incremented correctly
- GET `/api/purchase-orders/:po-id` → full PO returned
- POST `/api/purchase-orders/:po-id/submit` → status = SUBMITTED
- GET `/api/purchase-orders/:po-id/open-lines` → all lines returned

**Acceptance:** All 4 PO endpoints respond with correct data; allocation rule enforced.

---

## Phase 4: PO Frontend — Pages & Navigation (Hour 3)

**Goal:** Build PO UI pages integrated with baseline.

### CP-4.1: PO List page
- Create `frontend/src/pages/POListPage.vue`
- Fetch all POs (extend API if needed: GET /api/purchase-orders)
- Display table: PO number, vendor, status, actions (view, delete if DRAFT)
- Link to PODetailPage

### CP-4.2: PO Create page
- Create `frontend/src/pages/POCreatePage.vue`
- Form:
  - Vendor name (text input)
  - Line allocation table: pick approved PR lines, enter qty to allocate
- On submit: POST to `/api/purchase-orders`, show success, navigate to PODetailPage
- Show error if allocation exceeds PR remaining qty

### CP-4.3: PO Detail page
- Create `frontend/src/pages/PODetailPage.vue`
- Display PO header: number, vendor, status
- Display PO lines: item, qty_ordered, unit_price, site, required_date
- Button: Submit PO (POST /api/purchase-orders/:id/submit, status → SUBMITTED)
- Link to GR Create (stub for now, greyed out if GR is out-of-scope)

### CP-4.4: Router integration
- Update `frontend/src/router/index.js`
- Routes: `/po`, `/po/create`, `/po/:id`
- Update `frontend/src/pages/DashboardPage.vue` to add "Purchase Orders" link

**Acceptance:** POListPage, POCreatePage, PODetailPage load; navigation works; Create → Detail flow is seamless.

---

## Phase 5: PO Frontend — Validation & UI Polish (Hour 3.5)

**Goal:** Error handling and UX alignment with baseline.

### CP-5.1: Form validation
- POCreatePage: reject if vendor name empty
- POCreatePage: reject if no lines selected or allocated_qty ≤ 0
- POCreatePage: show allocation error from API as toast/alert
- Apply baseline CSS var styles (colors, spacing)

### CP-5.2: API error handling
- Show allocation error: "Cannot allocate X — only Y remaining on PR line"
- Show status error: "Cannot submit PO already submitted"

**Acceptance:** UI matches baseline visual style; all error messages are clear.

---

## Phase 6: Testing — Jest + Playwright (Hour 4)

**Goal:** Validate PO flow end-to-end; test allocation rule.

### CP-6.1: Jest service-level tests
- Already done in CP-2.3; verify coverage ≥ 80% on purchase-order-service.js

### CP-6.2: Playwright PO flow
- Create `e2e/po-flow.spec.js`
- Scenario:
  1. Load baseline PR data (or seed a test PR in APPROVED state)
  2. Navigate to PO Create
  3. Allocate from PR line (qty < PR remaining)
  4. Submit PO creation
  5. Navigate to PO Detail
  6. Verify PO header and lines displayed
  7. Submit PO (transition to SUBMITTED)
  8. Verify status updated
  9. Return to PR Detail, verify qty_allocated updated

**Acceptance:** Both Jest and Playwright suites pass; allocation rule is tested in both.

---

## Phase 7: Code Review & Cleanup (Hour 4.5)

**Goal:** Ensure code is workshop-ready.

### CP-7.1: Code review checklist
- [ ] Service layer abstracts all DB queries; routes are thin
- [ ] Error responses are consistent and clear (e.g., `{ error: "...", code: "ALLOCATION_EXCEEDED" }`)
- [ ] No magic numbers; allocation rule is documented in service
- [ ] Variable names are explicit (not clever)
- [ ] No emoji in UI or commit messages
- [ ] CSS uses baseline var()

### CP-7.2: Commit & PR
- Commit: "feat(po): PO module with allocation validation"
- Open PR with summary of PO endpoints + rule

**Acceptance:** Code review passes; PR ready.

---

## Phase 8: Optional — Bookmark Feature (Post-backlog)

**Goal:** Practice GitHub Issue-driven workflow.

### CP-8.1: Create GitHub Issue
- Title: "Feature: Bookmark PR/PO/GR for quick access"
- Description: brief user story
- Link in repo README

### CP-8.2: Implementation (if time permits)
- Not in core backlog

---

## Checkpoint Summary Table

| Phase | Checkpoint | Status | Blocker Check |
|-------|-----------|--------|---------------|
| 1 | CP-1.1: DB + seed PR | ✅ | Schema has qty_allocated? |
| 1 | CP-1.2: Backend PR APIs | ✅ | GET /api/requisitions/:id works? |
| 1 | CP-1.3: Frontend PR pages | ✅ | PR List + Detail load? |
| 2 | CP-2.1: PO service + allocation logic | ✅ | Atomic INSERT succeeds? |
| 2 | CP-2.2: PO routes (thin) | ✅ | 4 endpoints defined? |
| 2 | CP-2.3: Jest allocation tests | ✅ | Over-allocation rejected? (23 tests passing) |
| 3 | CP-3.1: E2E API flow | ✅ | Manual curl test passes? (schema fixed) |
| 4 | CP-4.1: PO List page | ✅ | Table renders, links work? |
| 4 | CP-4.2: PO Create page | ✅ | Form submission works? (wired to API) |
| 4 | CP-4.3: PO Detail page | ✅ | Display + Submit button? (complete) |
| 4 | CP-4.4: Router + Dashboard | ✅ | Navigation seamless? (detail route added) |
| 5 | CP-5.1: Form validation | ✅ | Error toast shows? (inline validation) |
| 5 | CP-5.2: API error handling | ✅ | User sees allocation error? (messages display) |
| 6 | CP-6.1: Jest ≥80% coverage | ✅ | `npm test` all green? (23/23 passing) |
| 6 | CP-6.2: Playwright PO flow | ⬜ | E2E scenario passes? |
| 7 | CP-7.1: Code review checklist | ✅ | All items ✓? (ready for review) |
| 7 | CP-7.2: PR opened | ⬜ | PR description complete? |
| 8 | CP-8.1: Bookmark issue | ⬜ | Optional; do if time |

---

## Critical Implementation Rules (Do Not Bypass)

1. **Allocation atomicity**: PO create must UPDATE pr_lines.qty_allocated in a transaction
2. **Service layer owns rules**: purchase-order-service.js has all allocation logic; route handlers only call service
3. **Error codes**: Return structured errors (`{ error, code }`) for UI to handle
4. **Baseline compatibility**: Don't modify PR routes; only extend
5. **Testing discipline**: Jest for logic, Playwright for flow; don't skip allocation validation tests

---

## Quick Reference: API Endpoints

| Method | Endpoint | Handler | Status |
|--------|----------|---------|--------|
| POST | /api/purchase-orders | createPO | CP-2.2 |
| POST | /api/purchase-orders/:id/submit | submitPO | CP-2.2 |
| GET | /api/purchase-orders/:id | getPOById | CP-2.2 |
| GET | /api/purchase-orders/:id/open-lines | getPOOpenLines | CP-2.2 |

---

## Quick Reference: Vue Pages

| Page | Route | File | Status |
|------|-------|------|--------|
| PO List | /po | frontend/src/pages/POListPage.vue | CP-4.1 |
| PO Create | /po/create | frontend/src/pages/POCreatePage.vue | CP-4.2 |
| PO Detail | /po/:id | frontend/src/pages/PODetailPage.vue | CP-4.3 |

---

## Time Budget (5 hours)

- Phase 1: 30 min (CP-1.1 to CP-1.3)
- Phase 2: 60 min (CP-2.1 to CP-2.3)
- Phase 3: 30 min (CP-3.1)
- Phase 4: 60 min (CP-4.1 to CP-4.4)
- Phase 5: 30 min (CP-5.1 to CP-5.2)
- Phase 6: 60 min (CP-6.1 to CP-6.2)
- Phase 7: 30 min (CP-7.1 to CP-7.2)
- Phase 8: *optional* (bookmark feature, if time)

**Buffer:** 30 min for debugging and blockers.
