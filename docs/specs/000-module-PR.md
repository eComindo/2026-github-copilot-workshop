# Module Specification: Purchase Requisition (PR)

## Overview
The Purchase Requisition (PR) module handles the creation, submission, and approval of purchase requisitions. It serves as the entry point to the procurement workflow and enables requesters to specify what items need to be purchased, by when, and for how much budget.

**Module Status:** ✓ Implemented and production-ready  
**Last Updated:** 2026-11-23

---

## Business Purpose

PR is the first step in a three-stage procurement flow:
1. **PR (Requisition):** Request to buy items
2. **PO (Purchase Order):** Order confirmation from vendor
3. **GR (Goods Receipt):** Receiving and posting the goods

A requisition begins in DRAFT status and must pass through SUBMITTED and APPROVED states before PO lines can reference it. Each PR line tracks:
- Quantity requested
- Quantity allocated to POs
- Quantity received via goods receipts
- Open quantity available for future PO allocation

---

## User Workflows

### Create a New Requisition
1. User navigates to PR List page
2. Clicks "+ New PR" button
3. Fills in requisition header (requester, department, title, needed-by date, notes)
4. Adds one or more line items with:
   - Item code, name, quantity, unit of measure
   - Estimated unit price
   - Site code, required date, budget center
5. Saves requisition as DRAFT
6. System auto-generates a unique PR number (e.g., PR-2026-0001)

### Submit a Requisition
1. User views DRAFT requisition detail
2. Clicks "Submit PR" button
3. Status changes to SUBMITTED
4. Requisition is now visible to approvers

### Approve a Requisition
1. User views SUBMITTED requisition detail
2. Clicks "Approve PR" button
3. Status changes to APPROVED
4. Approved PR lines become available for PO creation

### View Requisition Details
1. User navigates to PR List or detail view
2. Views all header information and line items
3. See allocation and receipt summaries on each line:
   - `qtyOpenForPo`: Quantity still available for PO allocation
4. From detail page, user can navigate to create PO against open lines

---

## API Endpoints

### List Requisitions
```
GET /api/requisitions
```
Returns all requisitions in reverse chronological order.

**Response (200):**
```json
{
  "items": [
    {
      "id": "uuid",
      "prNumber": "PR-2026-0001",
      "status": "APPROVED",
      "requesterName": "John Doe",
      "departmentName": "Engineering",
      "title": "Office Supplies Replenishment",
      "neededByDate": "2026-12-15",
      "createdAt": "2026-11-23T08:00:00Z",
      "updatedAt": "2026-11-23T09:30:00Z"
    }
  ]
}
```

---

### Create Requisition
```
POST /api/requisitions
```
Creates a new DRAFT requisition with header and line items in a single atomic transaction.

**Request Body:**
```json
{
  "requesterName": "John Doe",
  "departmentName": "Engineering",
  "title": "Office Supplies Replenishment",
  "neededByDate": "2026-12-15",
  "notes": "Urgent: needed for Q4 planning",
  "lines": [
    {
      "itemCode": "ITEM-001",
      "itemName": "A4 Printer Paper",
      "qtyRequested": 100,
      "uom": "REAM",
      "estUnitPrice": 5.50,
      "siteCode": "SG-01",
      "requiredDate": "2026-12-01",
      "budgetCenter": "ENG-CAPEX"
    }
  ]
}
```

**Validation Rules:**
- `requesterName`, `departmentName`, `title` are required text fields
- `lines` array must contain at least one line item
- Each line must have: `itemCode`, `itemName`, `uom`, `siteCode`
- `qtyRequested` must be > 0
- `estUnitPrice` must be >= 0
- `neededByDate`, `requiredDate`, `budgetCenter`, `notes` are optional

**Response (201):**
Returns complete requisition object with all header and line details (see GET by ID response).

**Error Responses:**
- `422`: Validation error (missing required field, invalid data)
  ```json
  { "message": "qtyRequested must be greater than 0" }
  ```

---

### Get Requisition by ID
```
GET /api/requisitions/{id}
```
Returns full requisition with all header information and line items.

**Response (200):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "prNumber": "PR-2026-0001",
  "status": "APPROVED",
  "requesterName": "John Doe",
  "departmentName": "Engineering",
  "title": "Office Supplies Replenishment",
  "neededByDate": "2026-12-15",
  "notes": "Urgent: needed for Q4 planning",
  "createdAt": "2026-11-23T08:00:00Z",
  "updatedAt": "2026-11-23T09:30:00Z",
  "lines": [
    {
      "id": "uuid",
      "lineNo": 1,
      "itemCode": "ITEM-001",
      "itemName": "A4 Printer Paper",
      "qtyRequested": 100,
      "qtyAllocated": 60,
      "qtyReceived": 30,
      "qtyOpenForPo": 40,
      "uom": "REAM",
      "estUnitPrice": 5.50,
      "siteCode": "SG-01",
      "requiredDate": "2026-12-01",
      "budgetCenter": "ENG-CAPEX"
    }
  ]
}
```

**Line Field Calculations:**
- `qtyOpenForPo` = `qtyRequested` - `qtyAllocated`
- Only lines with `qtyOpenForPo > 0` can be allocated to new POs

**Response (404):**
```json
{ "message": "Requisition not found" }
```

---

### Submit Requisition
```
POST /api/requisitions/{id}/submit
```
Transitions a DRAFT requisition to SUBMITTED status.

**Validation:**
- Requisition must exist
- Requisition must be in DRAFT status

**Response (200):**
Returns complete updated requisition (same format as GET by ID).

**Error Responses:**
- `404`: Requisition not found
  ```json
  { "message": "Requisition not found" }
  ```
- `422`: Invalid status transition
  ```json
  { "message": "Only DRAFT requisition can be submitted" }
  ```

---

### Approve Requisition
```
POST /api/requisitions/{id}/approve
```
Transitions a SUBMITTED requisition to APPROVED status.

**Validation:**
- Requisition must exist
- Requisition must be in SUBMITTED status

**Response (200):**
Returns complete updated requisition (same format as GET by ID).

**Error Responses:**
- `404`: Requisition not found
  ```json
  { "message": "Requisition not found" }
  ```
- `422`: Invalid status transition
  ```json
  { "message": "Only SUBMITTED requisition can be approved" }
  ```

---

### Get Requisition Open Lines
```
GET /api/requisitions/{id}/open-lines
```
Returns the requisition header plus only the lines with `qtyOpenForPo > 0`. Used by PO create page to show available lines for allocation.

**Response (200):**
```json
{
  "requisition": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "prNumber": "PR-2026-0001",
    "status": "APPROVED"
  },
  "openLines": [
    {
      "id": "uuid",
      "lineNo": 1,
      "itemCode": "ITEM-001",
      "itemName": "A4 Printer Paper",
      "qtyRequested": 100,
      "qtyAllocated": 60,
      "qtyReceived": 30,
      "qtyOpenForPo": 40,
      "uom": "REAM",
      "estUnitPrice": 5.50,
      "siteCode": "SG-01",
      "requiredDate": "2026-12-01",
      "budgetCenter": "ENG-CAPEX"
    }
  ]
}
```

**Response (404):**
```json
{ "message": "Requisition not found" }
```

---

## Data Model

### purchase_requisitions (Header Table)
| Column | Type | Key | Notes |
|--------|------|-----|-------|
| `id` | UUID | PK | Auto-generated |
| `pr_number` | VARCHAR(30) | UNIQUE | Format: `PR-YYYY-NNNN`, auto-generated on create |
| `status` | ENUM | | DRAFT → SUBMITTED → APPROVED |
| `requester_name` | VARCHAR(120) | | Required |
| `department_name` | VARCHAR(120) | | Required |
| `title` | VARCHAR(255) | | Required |
| `notes` | TEXT | | Optional |
| `needed_by_date` | DATE | | Optional |
| `created_at` | TIMESTAMP | | Auto-set on create |
| `updated_at` | TIMESTAMP | | Auto-set on create/update |

### pr_lines (Line Items Table)
| Column | Type | Key | Notes |
|--------|------|-----|-------|
| `id` | UUID | PK | Auto-generated |
| `pr_id` | UUID | FK | References `purchase_requisitions.id` |
| `line_no` | INT | | 1-based line number |
| `item_code` | VARCHAR(60) | | Required |
| `item_name` | VARCHAR(255) | | Required |
| `qty_requested` | NUMERIC(14,2) | | > 0, required |
| `qty_allocated` | NUMERIC(14,2) | | >= 0, default 0, denormalized; updated when PO lines are created |
| `qty_received` | NUMERIC(14,2) | | >= 0, default 0, denormalized; updated when GR lines are posted |
| `uom` | VARCHAR(20) | | Unit of measure, required |
| `est_unit_price` | NUMERIC(14,2) | | >= 0, default 0 |
| `site_code` | VARCHAR(50) | | Required |
| `required_date` | DATE | | Optional |
| `budget_center` | VARCHAR(60) | | Optional |
| `created_at` | TIMESTAMP | | Auto-set on create |
| `updated_at` | TIMESTAMP | | Auto-set on create/update |
| `(pr_id, line_no)` | | UNIQUE | Ensures unique line numbering per PR |

---

## State Transitions

### Requisition Status Flow
```
DRAFT → SUBMITTED → APPROVED
  ↓         ↓           ↓
 submit   approve    (can be used by PO module)
```

**Validation Rules:**
- Only DRAFT requisitions can be submitted
- Only SUBMITTED requisitions can be approved
- Status transitions are one-way; no reversal or sideways transitions
- Once APPROVED, a PR is frozen and cannot be edited; allocations happen in the PO module

---

## Integrations

### Outbound (PR → PO Module)
- PO create page calls `/api/requisitions/{id}/open-lines` to fetch approved PR lines
- PO create form pre-populates item details from PR lines
- When a PO line is created, the `qty_allocated` field on the referenced PR line is incremented atomically by the PO module

### Inbound (GR Module → PR)
- When a GR line is posted, the `qty_received` field on the referenced PR line is incremented by the GR module
- PR detail page displays cumulative quantities to show fulfillment progress

---

## UI Components

### Pages
1. **Requisition List Page** (`RequisitionListPage.vue`)
   - Shows paginated table of all requisitions
   - Columns: PR Number, Requester, Department, Title, Status, Needed By Date
   - Each row is a link to detail page
   - Action: "+ New PR" button

2. **Requisition Create Page** (`RequisitionCreatePage.vue`)
   - Form with PR header fields
   - Dynamic line items table with add/remove row buttons
   - Validation on submit (shows inline errors)
   - Actions: Cancel, Save As Draft

3. **Requisition Detail Page** (`RequisitionDetailPage.vue`)
   - Read-only display of all PR header and line data
   - Status badge
   - Conditional action buttons:
     - "Submit PR" (if DRAFT)
     - "Approve PR" (if SUBMITTED)
   - Navigation to create PO (future enhancement)

### Styling
- Uses CSS variables from baseline (colors, spacing, typography)
- Status badges: `.status-badge` with `.draft`, `.submitted`, `.approved` classes
- Form validation: error messages in red, required fields marked
- Table styling: `.card-panel` wrapper with responsive table

---

## Business Rules

### Validation Rules
1. **On Create:**
   - All header required fields must be populated
   - At least one line item must be provided
   - Each line must have required fields: itemCode, itemName, uom, siteCode
   - qtyRequested must be > 0
   - Atomic transaction: either all data is saved or none

2. **On Submit:**
   - Requisition must exist and be in DRAFT status
   - Idempotent: submitting an already-submitted PR returns 422

3. **On Approve:**
   - Requisition must exist and be in SUBMITTED status
   - Idempotent: approving an already-approved PR returns 422

4. **On Allocation (via PO module):**
   - Total allocated qty per PR line cannot exceed `qtyRequested`
   - Allocation is tracked in `pr_line_allocations` bridge table
   - `qty_allocated` denormalized field is updated atomically

### Business Constraints
- PR number is auto-generated and unique
- Status transitions are unidirectional and irreversible
- Once APPROVED, PR data is immutable (read-only via API and UI)
- Open quantity = qtyRequested - qtyAllocated

---

## Error Handling

### HTTP Status Codes
- **201:** Create successful
- **200:** Get/submit/approve successful
- **404:** Resource not found
- **422:** Validation or state error (bad input, invalid status transition)

### Error Message Format
All errors return JSON with a `message` field:
```json
{ "message": "Human-readable error description" }
```

### Common Errors
| Condition | Status | Message |
|-----------|--------|---------|
| Requisition not found | 404 | "Requisition not found" |
| Missing required field | 422 | "requesterName is required" |
| Invalid quantity | 422 | "qtyRequested must be greater than 0" |
| Cannot submit non-DRAFT | 422 | "Only DRAFT requisition can be submitted" |
| Cannot approve non-SUBMITTED | 422 | "Only SUBMITTED requisition can be approved" |

---

## Testing

### Unit Tests (Jest)
- Validation of create payload (required fields, quantity > 0)
- Status transition validation (DRAFT → SUBMITTED → APPROVED only)
- Error handling for missing requisitions
- Atomic transaction rollback on line insert failure

### Integration Tests
- Full flow: create → submit → approve
- Verify PR number is unique
- Verify open lines endpoint filters correctly
- Verify updated_at timestamp changes on submit/approve

### E2E Tests (Playwright)
- Create a new PR, verify it appears in list
- Submit DRAFT PR, verify status changes
- Approve SUBMITTED PR, verify status changes
- Verify list page pagination and sorting

---

## Implementation Notes

### Key Files
- **Routes:** `backend/src/routes/requisition-routes.js`
- **Service:** `backend/src/services/requisition-service.js`
- **Frontend (Vue):**
  - `frontend/src/pages/RequisitionListPage.vue`
  - `frontend/src/pages/RequisitionCreatePage.vue`
  - `frontend/src/pages/RequisitionDetailPage.vue`
- **API Client:** `frontend/src/api.js`
- **Database Schema:** `db/migrations/001_init_procurement_mvp.sql`

### Design Decisions
1. **Atomic Transactions:** Line items are inserted within a transaction to ensure data consistency
2. **Denormalized Fields:** `qty_allocated` and `qty_received` are denormalized on PR lines for query performance; they are updated by PO/GR modules
3. **Auto-generated PR Numbers:** Sequence-style numbering (PR-YYYY-NNNN) provides human-readable, unique identifiers
4. **Status Immutability:** Once a requisition transitions out of DRAFT, it cannot be edited, ensuring audit trail integrity
5. **Open Lines Endpoint:** Separate endpoint for PO create workflow to avoid filtering in the frontend

---

## Future Enhancements

Out of scope for MVP but recommended for production:
- Requisition amendment / approval workflow restart
- Multi-level approval chains
- Budget center validation and cost center integration
- Requisition templates
- Attachment support (RFQ, specifications)
- Requisition search and advanced filtering
- Requisition history and audit log
