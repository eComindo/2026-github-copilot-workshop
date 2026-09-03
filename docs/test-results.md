# Unit Test Results

Last run: 2026-09-02

## Backend (Jest)

Command: `npm test` in `backend/`

**Summary: 2 test suites passed, 29 tests passed**

### `tests/services/purchase-order-service.test.js`

| Group | Test | Result |
|---|---|---|
| createPurchaseOrder – payload validation | rejects when body is null | ✅ |
| createPurchaseOrder – payload validation | rejects when vendorName is missing | ✅ |
| createPurchaseOrder – payload validation | rejects when vendorName is empty string | ✅ |
| createPurchaseOrder – payload validation | rejects when lines is empty array | ✅ |
| createPurchaseOrder – payload validation | rejects when lines is not an array | ✅ |
| createPurchaseOrder – payload validation | rejects when prLineId is missing | ✅ |
| createPurchaseOrder – payload validation | rejects when required line fields are missing | ✅ |
| createPurchaseOrder – payload validation | rejects when qtyOrdered is zero | ✅ |
| createPurchaseOrder – payload validation | rejects when unitPrice is negative | ✅ |
| createPurchaseOrder – over-allocation guard | rejects when allocation qty exceeds PR line remaining qty | ✅ |
| createPurchaseOrder – over-allocation guard | allows allocation when qty equals exact remaining | ✅ |
| createPurchaseOrder – over-allocation guard | rejects when PR line does not exist | ✅ |
| createPurchaseOrder – PR status check | rejects when PR is in DRAFT status | ✅ |
| createPurchaseOrder – PR status check | rejects when PR is in SUBMITTED status | ✅ |
| createPurchaseOrder – success path | creates PO and returns detail with DRAFT status | ✅ |
| createPurchaseOrder – success path | rolls back and releases client on unexpected error | ✅ |
| submitPurchaseOrder – status transition | returns null when PO does not exist | ✅ |
| submitPurchaseOrder – status transition | submits a DRAFT PO successfully | ✅ |
| submitPurchaseOrder – status transition | rejects submit when PO is already SUBMITTED | ✅ |
| submitPurchaseOrder – status transition | rejects submit when PO is CANCELLED | ✅ |
| purchase-order-service list functions | listPurchaseOrders returns an empty array when there are no purchase orders | ✅ |
| purchase-order-service list functions | listPurchaseOrders returns mapped header fields | ✅ |
| purchase-order-service list functions | getOpenPoLines returns null when PO not found | ✅ |
| purchase-order-service list functions | getOpenPoLines returns only lines with qtyOpenForGr greater than 0 | ✅ |
| purchase-order-service list functions | getOpenPoLines returns an empty array when all lines are fully received | ✅ |

### `tests/services/requisition-service.test.js`

| Group | Test | Result |
|---|---|---|
| requisition-service list functions | listRequisitions returns mapped header fields | ✅ |
| requisition-service list functions | getRequisitionOpenLines returns null when requisition not found | ✅ |
| requisition-service list functions | getRequisitionOpenLines filters only qtyOpenForPo greater than 0 | ✅ |
| requisition-service list functions | listRequisitions returns an empty array when there are no requisitions | ✅ |

---

## Frontend (Vitest)

Command: `npm test` in `frontend/`

**Summary: 5 test files passed, 11 tests passed**

| File | Test | Result |
|---|---|---|
| RequisitionListPage.spec.js | renders a table row for each requisition | ✅ |
| RequisitionListPage.spec.js | shows an empty table when there are no requisitions | ✅ |
| RequisitionListPage.spec.js | shows an error message when the API call fails | ✅ |
| DashboardPage.spec.js | renders stat cards with values from the dashboard payload | ✅ |
| DashboardPage.spec.js | renders one row per recent requisition | ✅ |
| PoHeaderForm.spec.js | renders vendor, delivery address, and delivery date fields | ✅ |
| PoHeaderForm.spec.js | updates the bound form when the vendor name input changes | ✅ |
| PoLineAllocationTable.spec.js | renders one row per PR line with read-only quantity columns | ✅ |
| PoLineAllocationTable.spec.js | disables order qty, unit price, and delivery inputs until the line is selected | ✅ |
| PoLineAllocationTable.spec.js | computes line amount as order qty times unit price | ✅ |
| PurchaseOrderCreatePage.spec.js | renders the header form and line allocation table | ✅ |

---

## Totals

| Suite | Test files/suites | Tests passed | Tests failed |
|---|---|---|---|
| Backend (Jest) | 2 | 29 | 0 |
| Frontend (Vitest) | 5 | 11 | 0 |
| **Grand total** | **7** | **40** | **0** |
