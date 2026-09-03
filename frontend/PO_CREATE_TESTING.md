# PO Create Page - Quick Testing Guide

## Setup (5 minutes)

1. **Start frontend dev server:**
   ```bash
   cd frontend
   npm install  # if not already done
   npm run dev
   ```

2. **Navigate to:** http://localhost:5173/purchase-orders/new

3. **Verify page loads** without console errors

---

## Component Verification Checklist

### VendorHeadingForm
- [ ] Page title: "Create Purchase Order"
- [ ] "Allocate approved requisition lines to a new purchase order" subtitle visible
- [ ] Vendor Name input field present
- [ ] Required label (*) on Vendor Name
- [ ] Input accepts text and updates placeholder
- [ ] Input focuses with border highlight

### PRLinePicker
- [ ] Section title: "Select PR Lines to Allocate"
- [ ] Table with columns: Checkbox, PR Number, Line #, Item Code, Item Name, Qty Requested, Qty Allocated, Qty Remaining
- [ ] Two mock PR lines visible:
  - [ ] PR-2026-0001, Line 1: BRG-001 Safety Helmet (qty: 10/0/10)
  - [ ] PR-2026-0001, Line 2: HSJ-002 Hi-Vis Jacket (qty: 20/5/15)
- [ ] "Select All" checkbox in table header
- [ ] Clicking checkbox selects/deselects individual line (row highlights in blue)
- [ ] Clicking "Select All" selects all lines (or deselects if all already selected)
- [ ] Qty Remaining column has green background highlight

### LineAllocationForm
- [ ] Form does NOT appear initially (no lines selected)
- [ ] After selecting 1 line in picker:
  - [ ] Section title: "Allocate Quantities"
  - [ ] One card appears with:
    - [ ] Item Code (monospace, uppercase)
    - [ ] Item Name (below code)
    - [ ] Remove button (X) in top-right corner
  - [ ] Card body shows:
    - [ ] "Qty Remaining" label + value in green box (read-only)
    - [ ] Shows "10 requested − 0 allocated" below
    - [ ] "Qty Ordered" input with error state (if qty > remaining)
    - [ ] "Unit Price" input (pre-filled from PR line if available)
    - [ ] "Required Date" date picker (optional, pre-filled from PR line)

### Form Validation
- [ ] Create button **disabled** if:
  - [ ] Vendor Name is empty
  - [ ] No PR lines selected
  - [ ] Any selected line has qty = 0
  - [ ] Any selected line has qty > remaining
- [ ] Create button **enabled** when:
  - [ ] Vendor Name filled
  - [ ] ≥1 line selected
  - [ ] All lines have qty: 0 < qty ≤ remaining
  - [ ] All lines have price ≥ 0

### Error States
- [ ] Try to click Create without filling vendor → Error message: "Please fix the errors above"
- [ ] Select line, enter qty = 0 → Validation error below Qty Ordered field
- [ ] Select line with remaining = 10, enter qty = 15 → Error: "Quantity cannot exceed remaining 10"
- [ ] Click Remove button (X) → Line card disappears, line deselected in picker

### Form Actions
- [ ] Cancel button: Links to `/purchase-orders` (test in separate browser tab)
- [ ] Create PO button: 
  - [ ] Fills vendor + 1 line with valid qty/price
  - [ ] Click Create
  - [ ] Button shows "Creating..." (test responsiveness)
  - [ ] Open browser DevTools → Console tab
  - [ ] Verify payload logged: `PO Create Payload (ready for API):`
  - [ ] Error message shows: "API call not yet implemented. Payload logged to console."

---

## Mock Data Verification

In browser DevTools Console, verify mock PR lines are loaded:

```javascript
// Check what was logged:
// [PO Create Payload (ready for API): Object {
//   vendorName: "Test Vendor",
//   lines: [
//     {
//       prLineId: "pr-line-001",
//       itemCode: "BRG-001",
//       itemName: "Safety Helmet",
//       qtyOrdered: 10,
//       unitPrice: 150000,
//       uom: "PCS",
//       siteCode: "",
//       requiredDate: "2026-09-15"
//     }
//   ]
// }]
```

**Expected payload structure:**
```javascript
{
  vendorName: string,
  lines: [
    {
      prLineId: string,
      itemCode: string,
      itemName: string,
      qtyOrdered: number,
      unitPrice: number,
      uom: string,
      siteCode: string,
      requiredDate: string | null
    }
  ]
}
```

---

## UI/UX Checks

### Layout
- [ ] All sections stack vertically with consistent spacing (20px gaps)
- [ ] Back button in top-left corner
- [ ] Page header has border-bottom separator
- [ ] Form sections have rounded corners + background color
- [ ] Form actions (Cancel/Create) right-aligned at bottom

### Responsive
- [ ] On mobile (< 768px):
  - [ ] PR table scrolls horizontally (overflow-x)
  - [ ] Line allocation form grid adapts to single column
  - [ ] Buttons stay clickable size (≥40px tall)

### Colors
- [ ] Primary button (Create) = blue (`--color-primary`)
- [ ] Secondary button (Cancel) = outline style
- [ ] Error text = red (`--color-error`)
- [ ] Success highlights (Qty Remaining) = green accent
- [ ] Borders = light gray (`--color-border`)

### Accessibility
- [ ] All inputs have associated `<label>` elements
- [ ] Form labels bold/emphasized
- [ ] Error messages directly below problematic fields
- [ ] Tab navigation: vendor → PR table → line forms → buttons

---

## Debugging Tips

### If page doesn't load:
```bash
# Check for console errors
# Open browser DevTools → Console
# Look for import/component errors

# Check Hot Module Reload (HMR)
# Should see "VITE v5.x" message in console after startup

# Verify component imports
# Search for "PRLinePicker" or "VendorHeadingForm" in console errors
```

### If mock data doesn't appear:
```javascript
// In Frontend (browser console):
// Check if availablePrLines has data:
console.log(availablePrLines.value);

// Should show:
// [
//   { id: 'pr-line-001', prNumber: 'PR-2026-0001', ... },
//   { id: 'pr-line-002', prNumber: 'PR-2026-0001', ... }
// ]
```

### If form submission doesn't work:
```javascript
// Verify payload structure in console:
// Look for log: "PO Create Payload (ready for API):"
// Copy payload and compare to API contract in docs/plan.md
```

---

## Test Scenarios

### Scenario 1: Happy Path
1. Load PO Create page
2. Enter vendor name: "Test Vendor"
3. Select first PR line (checkbox)
4. Enter Qty Ordered: 5
5. Leave Unit Price as-is (default from PR)
6. Click Create
7. ✅ Expected: Payload logged, success message shown

### Scenario 2: Multi-line Order
1. Load page
2. Enter vendor: "Multi-Line Supplier"
3. Select ALL lines (Select All checkbox)
4. For line 1: qty = 8 (required date: today)
5. For line 2: qty = 10 (leave required date empty)
6. Click Create
7. ✅ Expected: Payload has 2 lines, both with correct data

### Scenario 3: Validation Failure
1. Load page
2. Select a PR line
3. Enter qty = 0
4. Try to click Create
5. ✅ Expected: Button disabled, no submission

### Scenario 4: Over-allocation Error
1. Load page
2. Select line with remaining = 10
3. Enter qty = 15
4. ✅ Expected: Error message appears: "Quantity cannot exceed remaining 10"

### Scenario 5: Line Deselection
1. Load page
2. Select 2 lines
3. 2 cards appear in allocation form
4. Click Remove (X) on first card
5. ✅ Expected: First card disappears, first line deselected in picker

---

## Ready for API Integration

Once all checks pass, the component structure is ready for backend integration:

1. Replace `loadPrLines()` with real API call:
   ```javascript
   const payload = await api.listRequisitionsOpenLines();
   ```

2. Replace `handleSubmit()` with real API call:
   ```javascript
   const result = await api.createPurchaseOrder(payload);
   router.push(`/purchase-orders/${result.id}`);
   ```

3. Remove console.log statements
4. Add loading spinners for async operations
5. Add toast/notification for success/error messages

See [PO_CREATE_COMPONENTS.md](PO_CREATE_COMPONENTS.md) → "API Integration (TODO)" for full example.
