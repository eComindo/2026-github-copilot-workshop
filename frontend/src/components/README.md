# PO Create Page - Vue Components

## Overview

This folder contains the PO (Purchase Order) Create page implementation with reusable, composable Vue 3 components. The structure follows a **parent-child component hierarchy** with **prop-down, event-up** data flow pattern.

**Status:** UI scaffolding complete. API integration points are marked with `TODO` comments.

---

## Component Architecture

```
POCreatePageNew.vue (Main Page Container)
├── POHeaderForm.vue (Vendor info)
├── PRLineSelector.vue (Approved PR lines multi-select)
└── POLineAllocationTable.vue (PO lines with quantities)
```

### Hierarchy Diagram

```
┌─ POCreatePageNew ────────────────────────────────┐
│  Form state + submission logic                   │
│  Refs to child components for validation         │
│                                                   │
│  ┌─ POHeaderForm ───────────────────────────┐   │
│  │ Vendor name input + validation           │   │
│  │ Emits: update:vendor-name                │   │
│  │ Exposes: validateVendorName(), isValid   │   │
│  └───────────────────────────────────────────┘   │
│                                                   │
│  ┌─ PRLineSelector ──────────────────────────┐  │
│  │ Available PR lines table (multi-select)    │  │
│  │ Emits: update:selected-line-ids            │  │
│  │ Exposes: getSelectedLines()                │  │
│  └───────────────────────────────────────────┘  │
│                                                   │
│  ┌─ POLineAllocationTable ───────────────────┐  │
│  │ PO line items (qty, price, dates)         │  │
│  │ Emits: remove-line, validation-change     │  │
│  │ Exposes: validateAll(), getLineErrors()   │  │
│  └───────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
```

---

## Component Specifications

### 1. POHeaderForm.vue

**Purpose:** Vendor name input and validation  
**Props:**
- `vendorName` (String) — Current vendor name value
- `validateOnChange` (Boolean) — Whether to validate on input change

**Emits:**
- `update:vendor-name` — Vendor name changed

**Exposed Methods:**
- `validateVendorName()` — Manual validation; returns boolean
- `isValid` — Computed property; true if vendor name is non-empty

**Validation Rules:**
- Vendor name is required (non-empty)

**Usage Example:**
```vue
<POHeaderForm
  ref="headerFormRef"
  v-model:vendor-name="formData.vendorName"
/>

<!-- Later, before submit: -->
if (!headerFormRef.value.validateVendorName()) {
  // Handle error
}
```

---

### 2. PRLineSelector.vue

**Purpose:** Display available PR lines; allow multi-select  
**Props:**
- `lines` (Array) — Array of PR line objects with: `id, pr_number, line_no, item_code, item_name, qty_requested, qty_allocated, est_unit_price, uom, site_code, required_date`
- `selectedLineIds` (Array) — Currently selected PR line IDs
- `loading` (Boolean) — Show loading state
- `error` (String) — Error message, if any

**Emits:**
- `update:selected-line-ids` — Array of newly selected IDs

**Exposed Methods:**
- `getSelectedLines()` — Returns full PR line objects for selected IDs

**Features:**
- Checkbox-based multi-select
- Select All / Deselect All with indeterminate state
- Displays "Open Qty" (qty_requested - qty_allocated)
- Highlights lines with no open qty in red
- Selection summary at bottom
- Responsive table with horizontal scroll on mobile

**Column Definitions:**
| Column | Type | Notes |
|--------|------|-------|
| PR # | text | Requisition number |
| Line | number | Line item number |
| Item Code | text | Item identifier (monospace) |
| Item Name | text | Item description (truncated) |
| Qty Req | number | Total qty requested |
| Qty Alloc | number | Already allocated qty |
| Open Qty | number | Available for new PO (green or red) |
| UOM | text | Unit of measure |
| Est Price | currency | Estimated unit price |

---

### 3. POLineAllocationTable.vue

**Purpose:** Display and edit PO line items (quantities, prices, dates)  
**Props:**
- `lines` (Array) — Array of PO line objects with: `id, item_code, item_name, openQty, qtyOrdered, unitPrice, uom, site_code, required_date`

**Emits:**
- `remove-line` — Index of line to remove
- `validation-change` — Boolean indicating if all lines are valid

**Exposed Methods:**
- `validateAll()` — Validate all line quantities; returns boolean
- `getLineErrors()` — Returns object with error messages per line index

**Features:**
- Qty Ordered input with max validation (≤ openQty)
- Unit Price input (currency)
- In-line error messages on validation
- Remove button per line
- Total value summary at bottom
- Calculates and displays estimated total

**Validation Rules:**
- Qty Ordered must be > 0
- Qty Ordered ≤ Open Qty (from PR line)
- Unit Price must be ≥ 0 (not validated, but input allows)

**Column Definitions:**
| Column | Type | Editable | Notes |
|--------|------|----------|-------|
| Item Code | text | No | From PR line (monospace) |
| Item Name | text | No | From PR line (truncated) |
| Open Qty | number | No | Read-only from PR |
| Qty Order | number | Yes | **Required input** |
| Unit Price | number | Yes | **Required input** |
| UOM | text | No | From PR line |
| Site Code | text | No | From PR line |
| Required Date | date | No | From PR line |
| Action | button | — | Remove line button |

---

## Data Flow

### Initial Load
```
POCreatePageNew mounts
  ↓
loadApprovedPrLines() [TODO: replace with api.listRequisitions()]
  ↓
availablePrLines populated
  ↓
PRLineSelector displays available lines
```

### PR Line Selection
```
User clicks checkbox in PRLineSelector
  ↓
PRLineSelector emits update:selected-line-ids
  ↓
POCreatePageNew receives event
  ↓
handlePrLinesSelected() called
  ↓
formData.lines populated with selected lines
  ↓
POLineAllocationTable re-renders with new lines
```

### Line Quantity Update
```
User types qty in POLineAllocationTable
  ↓
validateLineQuantity() called
  ↓
Error state updated (local to component)
  ↓
validation-change emitted
  ↓
POCreatePageNew updates isLineDataValid
  ↓
Submit button enabled/disabled based on isFormValid
```

### Form Submission
```
User clicks Create PO
  ↓
handleSubmit() called
  ↓
Validate all sections (header, lines)
  ↓
[TODO] Call api.createPurchaseOrder(payload)
  ↓
On success: router.push(`/po/${createdPo.id}`)
On error: Show submitError message
```

---

## API Integration Points

All API calls are marked with `// TODO:` comments. Replace mock implementations:

### 1. Load Approved PR Lines

**Location:** `POCreatePageNew.vue`, `loadApprovedPrLines()` function

**Current (Mock):**
```javascript
// Mock data for development
availablePrLines.value = [
  { id: 'pr-line-1', pr_number: 'PR-2026-0001', ... }
]
```

**Replace With:**
```javascript
const response = await api.listRequisitions();
const allLines = [];
for (const pr of response) {
  if (pr.status === 'APPROVED') {
    const prDetails = await api.getRequisition(pr.id);
    const openLines = prDetails.pr_lines.filter(
      (line) => line.qty_requested > line.qty_allocated
    );
    allLines.push(
      ...openLines.map((line) => ({
        ...line,
        pr_number: prDetails.pr_number,
        pr_id: pr.id,
      }))
    );
  }
}
availablePrLines.value = allLines;
```

### 2. Create Purchase Order

**Location:** `POCreatePageNew.vue`, `handleSubmit()` function

**Current (Mock):**
```javascript
// Mock success - remove after API integration
console.log('PO Data ready for submission:', { ... });
await new Promise((resolve) => setTimeout(resolve, 500));
router.push('/po-list');
```

**Replace With:**
```javascript
const payload = {
  vendorName: formData.vendorName,
  lines: formData.lines.map((line) => ({
    prLineId: line.pr_line_id,
    qtyOrdered: line.qtyOrdered,
    unitPrice: line.unitPrice,
  })),
};
const createdPo = await api.createPurchaseOrder(payload);
router.push(`/po/${createdPo.id}`);
```

**Expected Response:**
```javascript
{
  id: 'po-uuid',
  po_number: 'PO-2026-XXXX',
  vendor_name: 'Acme Supplies',
  status: 'DRAFT',
  created_at: '2026-09-02T08:00:00Z',
  updated_at: '2026-09-02T08:00:00Z',
  po_lines: [
    {
      id: 'line-uuid',
      po_id: 'po-uuid',
      line_no: 1,
      item_code: 'ITEM-001',
      qty_ordered: 50,
      unit_price: 5.50,
      ...
    }
  ]
}
```

---

## Validation Strategy

### Component-Level
- Each component validates its own inputs
- Errors stored locally; parent notified via events
- No async validation (all sync)

### Page-Level
- `isFormValid` computed property aggregates all sections
- Validated before submit
- User-friendly error messages displayed at page level

### Error Handling
- Input-level errors shown inline (red border, error text)
- Form-level errors shown as alert box
- Submit button disabled if any section invalid

---

## Styling

**Design System:**
- Color scheme: Blue (#007bff) for primary, red (#d32f2f) for errors
- Font: Default system font (sans-serif)
- Spacing: 20px panels, 12px fields, 8px gap
- Border radius: 4px for form elements, 8px for panels

**Responsive:**
- `@media (max-width: 768px)` breakpoint
- Form stack vertically on mobile
- Tables scroll horizontally if needed
- Action buttons stack on small screens

---

## Testing Notes

### Manual Testing Checklist
- [ ] Load page; PR lines populate
- [ ] Select / deselect individual PR lines
- [ ] Select all / deselect all works
- [ ] Selecting line populates PO line table
- [ ] Open Qty displays correctly (qty_requested - qty_allocated)
- [ ] Qty Order input validates (≤ open qty)
- [ ] Unit Price input accepts currency
- [ ] Remove button removes line from table
- [ ] Submit disabled until form complete
- [ ] Submit calls API and redirects to PO detail
- [ ] Error messages clear on correction

### Component Testing
- Props: Verify each prop type and default
- Events: Mock parent, verify emitted events
- Methods: Call exposed methods; verify return values
- Validation: Test edge cases (0 qty, exceed open qty, empty vendor)

---

## Future Enhancements

1. **Paginate PR lines** if list becomes very large
2. **Search/filter** PR lines by item code, vendor, etc.
3. **Drag-to-reorder** PO lines (change line_no)
4. **Import from PO template** (copy previous PO)
5. **Calculate totals per site code** (multi-warehouse)
6. **Bulk edit** quantities (% or fixed amount)
7. **Schedule delivery dates** per line
8. **Attach notes** to PO header or lines

---

## Files Structure

```
frontend/src/
├── components/
│   ├── POHeaderForm.vue               ← Vendor name input
│   ├── PRLineSelector.vue             ← Multi-select PR lines
│   └── POLineAllocationTable.vue      ← Qty/price editor
├── pages/
│   └── POCreatePageNew.vue            ← Main page container
└── api.js                              ← [TODO] Add PO API methods
```

**Integration:** Wire `POCreatePageNew.vue` into router as `/po-create` route (see runbook for details).

---

**Last Updated:** September 2, 2026  
**Status:** UI structure complete, awaiting API integration
