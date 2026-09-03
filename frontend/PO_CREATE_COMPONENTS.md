# PO Create Page Vue Components

This document describes the new reusable Vue components and main page for the Purchase Order creation flow.

## Overview

The PO Create page is built from three reusable components designed to handle vendor information, PR line selection, and order allocation:

1. **VendorHeadingForm** — Vendor name input
2. **PRLinePicker** — Table to select approved PR lines
3. **LineAllocationForm** — Quantity and price input per selected line
4. **PurchaseOrderCreatePage** — Main page composing the above

## Architecture

```
PurchaseOrderCreatePage (main page)
├── VendorHeadingForm (vendor input)
├── PRLinePicker (PR line selection)
└── LineAllocationForm (allocation details)
```

All components are **stateless** and use Vue 3 `<script setup>` with standard v-model patterns.

---

## Component: VendorHeadingForm

**Path**: `frontend/src/components/VendorHeadingForm.vue`

**Purpose**: Input field for vendor name.

### Props
- `vendorName` (String): Current vendor name value
- `errors` (Object): Error map with `vendorName` key if validation fails

### Emits
- `update:vendorName` — When vendor name changes

### Usage
```vue
<VendorHeadingForm
  v-model:vendorName="form.vendorName"
  :errors="fieldErrors"
/>
```

### Features
- Clean, simple vendor name input
- Error display below field
- Focused styling with border-color change
- Reuses baseline CSS variables

---

## Component: PRLinePicker

**Path**: `frontend/src/components/PRLinePicker.vue`

**Purpose**: Table for browsing and selecting approved PR lines. Shows:
- PR Number, Line #, Item Code, Item Name
- Qty Requested, Qty Allocated, Qty Remaining
- Checkbox to toggle line selection

### Props
- `prLines` (Array): Available PR line objects with:
  - `id`, `prNumber`, `lineNo`, `itemCode`, `itemName`
  - `qtyRequested`, `qtyAllocated`, `uom`, `unitPrice`, `requiredDate`
- `selectedLineIds` (Array): Currently selected line IDs
- `loading` (Boolean): Show loading state
- `error` (String): Error message if loading failed

### Emits
- `update:selectedLineIds` — When selection checkbox state changes
- `retry` — When user clicks retry button (on error)

### Usage
```vue
<PRLinePicker
  :prLines="availablePrLines"
  :selectedLineIds="selectedLineIds"
  :loading="loadingPrLines"
  :error="errorLoadingPrLines"
  @update:selectedLineIds="selectedLineIds = $event"
  @retry="loadPrLines"
/>
```

### Features
- Table with checkboxes for multi-select
- Select-all checkbox in header
- Qty Remaining calculated and highlighted (green accent)
- Loading, error, and empty states
- Responsive design with horizontal scroll on mobile

### Loading PR Lines

Mock data is hardcoded in `PurchaseOrderCreatePage.onMounted()`. Replace `loadPrLines()` with actual API call:

```javascript
// TODO: Replace with actual API call
const payload = await api.listRequisitionsOpenLines();
```

Expected API response format:
```javascript
{
  items: [
    {
      id: 'pr-line-001',
      prNumber: 'PR-2026-0001',
      lineNo: 1,
      itemCode: 'BRG-001',
      itemName: 'Safety Helmet',
      qtyRequested: 10,
      qtyAllocated: 0,
      uom: 'PCS',
      unitPrice: 150000,
      requiredDate: '2026-09-15',
    },
    // ...
  ]
}
```

---

## Component: LineAllocationForm

**Path**: `frontend/src/components/LineAllocationForm.vue`

**Purpose**: Card-based form for entering order quantity and unit price for each selected PR line.

### Props
- `selectedLines` (Array): Lines with user input for:
  - `id`, `itemCode`, `itemName`, `qtyRemaining`
  - `qtyOrdered`, `unitPrice`, `requiredDate`
- `errors` (Array): Error map per line, keyed by line index

### Emits
- `update:selectedLines` — When line data changes
- `remove-line` — When user clicks remove button

### Usage
```vue
<LineAllocationForm
  :selectedLines="selectedLines"
  :errors="lineAllocationErrors"
  @update:selectedLines="selectedLines = $event"
  @remove-line="onRemoveLine"
/>
```

### Features
- One card per selected PR line
- Qty Remaining shown as **read-only** (highlighted in green)
- Qty Ordered input with validation hint (must be ≤ Qty Remaining)
- Unit Price input (default from PR line if available)
- Optional Required Date picker
- Remove button (X) to deselect line
- Inline validation errors below each field
- Card highlights on hover

### Validation

Validation happens in the parent (PurchaseOrderCreatePage) via `validateForm()`:

```javascript
selectedLines.value.forEach((line, index) => {
  const errors = {};
  
  if (!line.qtyOrdered || line.qtyOrdered <= 0) {
    errors.qtyOrdered = 'Quantity must be greater than 0';
  }
  
  if (line.qtyOrdered > line.qtyRemaining) {
    errors.qtyOrdered = `Quantity cannot exceed remaining ${line.qtyRemaining}`;
  }
  
  if (line.unitPrice < 0) {
    errors.unitPrice = 'Unit price cannot be negative';
  }
  
  if (Object.keys(errors).length > 0) {
    lineAllocationErrors.value[index] = errors;
  }
});
```

---

## Main Page: PurchaseOrderCreatePage

**Path**: `frontend/src/pages/PurchaseOrderCreatePage.vue`

**Purpose**: Compose the three components and handle form submission logic.

### State
```javascript
form = {
  vendorName: '',          // Vendor input
}

selectedLineIds = []       // Selected PR line IDs
availablePrLines = []      // Loaded PR lines from API/mock
selectedLines = []         // PR lines with user input (qty, price)

isSubmitting = false       // Form submission in progress
errorMessage = ''          // Top-level error (validation, API)
fieldErrors = {}           // Vendor field errors
loadingPrLines = false     // PR lines loading state
errorLoadingPrLines = ''   // PR lines loading error
lineAllocationErrors = []  // Per-line validation errors
```

### Computed Properties
- `isFormValid` — Returns true if vendor name + at least 1 line with valid qty/price
- `selectedLines` — Updated automatically when `selectedLineIds` changes

### Key Methods

**`loadPrLines()`**
Loads available PR lines. Uses mock data; replace with API call to `/api/requisitions/:id/open-lines`.

**`validateForm()`**
Client-side validation:
- Vendor name is required
- Each line: qty > 0, qty ≤ remaining, price ≥ 0

**`handleSubmit()`**
1. Calls `validateForm()`
2. Builds payload with vendor name + lines array
3. Logs payload to console (TODO: call API)
4. Sets `isSubmitting = true` during submission

Payload structure (ready for API):
```javascript
{
  vendorName: 'PT Supplier Jaya',
  lines: [
    {
      prLineId: 'pr-line-001',
      itemCode: 'BRG-001',
      itemName: 'Safety Helmet',
      qtyOrdered: 5,
      unitPrice: 150000,
      uom: 'PCS',
      siteCode: 'WH-JKT',
      requiredDate: '2026-09-15',
    },
    // ...
  ]
}
```

### API Integration (TODO)

Replace the mock `handleSubmit()` with real API call:

```javascript
const handleSubmit = async () => {
  // ... validation ...
  
  try {
    const result = await api.createPurchaseOrder(payload);
    router.push(`/purchase-orders/${result.id}`);
  } catch (error) {
    errorMessage.value = error.message;
  }
};
```

Expected API response:
```javascript
{
  id: 'po-uuid',
  poNumber: 'PO-2026-0001',
  status: 'DRAFT',
  vendorName: 'PT Supplier Jaya',
  lines: [
    {
      id: 'po-line-uuid',
      lineNo: 1,
      itemCode: 'BRG-001',
      itemName: 'Safety Helmet',
      qtyOrdered: 5,
      unitPrice: 150000,
      // ...
    },
    // ...
  ],
  createdAt: '2026-09-03T12:00:00Z',
}
```

---

## Styling

All components use **CSS custom properties** (CSS variables) defined in `frontend/src/styles.css`:

- `--color-primary` — Primary button/link color
- `--color-background-primary` — Main background
- `--color-background-secondary` — Section/card background
- `--color-text-primary` — Main text
- `--color-text-secondary` — Muted text
- `--color-border` — Border color
- `--color-error` — Error text/background

No hardcoded colors; all styling extends baseline theme.

---

## Component Tree Example

```
PurchaseOrderCreatePage
├── Back Button (RouterLink)
├── Page Title
├── Error Message (if errorMessage)
├── Form (@submit.prevent="handleSubmit")
│   ├── VendorHeadingForm
│   │   └── Vendor Name Input
│   ├── PRLinePicker
│   │   └── Table of approved PR lines with checkboxes
│   ├── LineAllocationForm (only if selectedLines.length > 0)
│   │   └── Card per line:
│   │       ├── Item Code + Name
│   │       ├── Qty Remaining (read-only)
│   │       ├── Qty Ordered (input)
│   │       ├── Unit Price (input)
│   │       ├── Required Date (input, optional)
│   │       └── Remove Button
│   └── Form Actions
│       ├── Cancel (RouterLink)
│       └── Create PO (Submit Button)
```

---

## Testing Notes

### Mock Data
`loadPrLines()` includes two sample PR lines:
1. Safety Helmet (qty: 10, price: 150000)
2. Hi-Vis Jacket (qty: 20, allocated: 5, remaining: 15, price: 250000)

### Form Behavior
- Vendor name required before submit
- Must select ≥1 line
- Qty must be > 0 and ≤ remaining
- Create button disabled until valid state
- On submit: payload logged to console (API not implemented)

### Error Messages
Clear, specific messages guide user:
- "Vendor name is required"
- "Quantity must be greater than 0"
- "Quantity cannot exceed remaining 5"
- "Unit price cannot be negative"

---

## Future Enhancements

1. **API Integration**: Replace mock `loadPrLines()` and `handleSubmit()` with real API calls
2. **Qty Validation (Real-time)**: Validate qty on input change to show inline errors
3. **PR Line Search**: Add filter/search box to PRLinePicker
4. **Multi-Vendor**: Allow allocating same PR to multiple vendors
5. **Draft Save**: Save form state to localStorage for recovery
6. **Undo/Redo**: Support undoing line removals
7. **Bulk Edit**: Multi-select lines and edit qty/price together
8. **Keyboard Shortcuts**: Tab navigation and Enter to add lines

---

## Files Modified/Created

- ✅ **Created**: `frontend/src/components/VendorHeadingForm.vue`
- ✅ **Created**: `frontend/src/components/PRLinePicker.vue`
- ✅ **Created**: `frontend/src/components/LineAllocationForm.vue`
- ✅ **Updated**: `frontend/src/pages/PurchaseOrderCreatePage.vue`
- ✅ **Existing**: `frontend/src/router/index.js` (route already exists)
- ✅ **Existing**: `frontend/src/styles.css` (CSS variables already defined)

All components follow Vue 3 Composition API best practices with `<script setup>` syntax and explicit prop/emit contracts.
