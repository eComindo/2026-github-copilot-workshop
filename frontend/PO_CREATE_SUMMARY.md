# PO Create Page — Vue Components Generated ✅

Date: September 3, 2026  
Source: Figma MCP Design Extraction + Workshop Requirements  
Status: **Ready for API Integration**

---

## What Was Created

### 1. **VendorHeadingForm.vue** ✅
**Path**: `frontend/src/components/VendorHeadingForm.vue`
- Simple vendor name input field
- v-model binding with parent form
- Error display below field
- Reuses baseline styling variables
- ~80 lines of clean Vue code

### 2. **PRLinePicker.vue** ✅
**Path**: `frontend/src/components/PRLinePicker.vue`
- Multi-select table of approved PR lines
- Shows: PR #, Line #, Item Code, Item Name, Qty Requested/Allocated/Remaining
- Checkboxes for line selection with select-all header
- Mock data included (2 sample PR lines)
- Loading, error, and empty states
- Green-highlighted "Qty Remaining" column (visual emphasis)
- ~280 lines of Vue code

### 3. **LineAllocationForm.vue** ✅
**Path**: `frontend/src/components/LineAllocationForm.vue`
- Card view for each selected PR line
- Inputs: Qty Ordered, Unit Price, Required Date (optional)
- Qty Remaining shown as read-only (green-highlighted)
- Remove button (X) to deselect line
- Inline validation error display
- Hover effects and card styling
- ~240 lines of Vue code

### 4. **PurchaseOrderCreatePage.vue** (Updated) ✅
**Path**: `frontend/src/pages/PurchaseOrderCreatePage.vue`
- Main page composing all 3 components
- Form state management (vendor, selected lines, validation errors)
- Mock PR line loader (TODO: replace with API call)
- Client-side form validation
- Submit handler building API payload (TODO: replace with actual API call)
- Payload logged to console for debugging
- ~400 lines of Vue code with comprehensive comments

### 5. Documentation ✅
- **PO_CREATE_COMPONENTS.md** — Full component API & architecture (600+ lines)
- **PO_CREATE_TESTING.md** — Step-by-step testing guide with scenarios (400+ lines)

---

## Architecture Highlights

### Design Pattern: Composition API + v-model
All components use Vue 3 `<script setup>` with explicit prop/emit contracts:
```vue
<VendorHeadingForm
  v-model:vendorName="form.vendorName"
  :errors="fieldErrors"
/>
```

### Separation of Concerns
- **Components** stay stateless (receive props, emit events)
- **Parent page** manages form state and validation
- **Business logic** lives in service methods (validation, payload building)

### CSS Variables (No Hard-coded Colors)
All components respect baseline theme variables:
```css
--color-primary        /* Buttons */
--color-background-*   /* Surfaces */
--color-text-*         /* Text */
--color-border         /* Borders */
--color-error          /* Errors */
```

---

## Form Flow

```
Step 1: User enters vendor name
        ↓
Step 2: System loads approved PR lines into picker
        ↓
Step 3: User selects PR lines (checkboxes)
        ↓
Step 4: Allocation form cards appear for selected lines
        ↓
Step 5: User enters Qty Ordered + Unit Price per line
        ↓
Step 6: Client-side validation:
        - Vendor name required
        - Qty > 0 and ≤ remaining
        - Price ≥ 0
        ↓
Step 7: User clicks "Create PO"
        ↓
Step 8: Payload built and logged to console (TODO: send to API)
        ↓
Step 9: Redirect to PO detail page (TODO: after API returns)
```

---

## Current Limitations (By Design for MVP)

✅ **What's Working**
- Form layout and component structure
- Client-side validation and error display
- Mock PR line data loading
- Payload building (ready for API)
- Responsive design with baseline CSS variables

⏳ **TODO: API Integration**
1. Replace mock `loadPrLines()` → real API call to `/api/requisitions/*/open-lines`
2. Replace mock `handleSubmit()` → real API call to `POST /api/purchase-orders`
3. On create success: redirect to PO detail page with new ID
4. Add loading spinners for async operations
5. Add toast/notification messages

📝 **Not Included (Intentional)**
- Backend API calls (marked as TODO)
- Pagination for PR line picker
- Advanced filters/search in picker
- Bulk edit of multiple lines
- Draft auto-save
- Keyboard shortcuts

---

## Component Hierarchy

```
PurchaseOrderCreatePage
├─ Router: back to /purchase-orders
├─ VendorHeadingForm
│  └─ Vendor name input + error display
├─ PRLinePicker
│  └─ Table with:
│     ├─ Select-all checkbox
│     ├─ PR line rows with individual checkboxes
│     └─ Loading/error/empty states
├─ LineAllocationForm (conditional: if selectedLines.length > 0)
│  └─ Card per line:
│     ├─ Qty Remaining (read-only)
│     ├─ Qty Ordered input
│     ├─ Unit Price input
│     ├─ Required Date input
│     └─ Remove button
└─ Form actions:
   ├─ Cancel button → /purchase-orders
   └─ Create PO button (disabled until valid)
```

---

## Validation Rules (Client-Side)

### Vendor Name
- Required (non-empty string)
- Error: "Vendor name is required"

### PR Line Selection
- At least 1 line must be selected
- Button disabled until condition met

### Qty Ordered (Per Line)
- Must be > 0
- Must be ≤ Qty Remaining
- Error: "Quantity cannot exceed remaining {X}"

### Unit Price (Per Line)
- Must be ≥ 0
- Error: "Unit price cannot be negative"

---

## Payload Structure (Ready for POST /api/purchase-orders)

```javascript
{
  vendorName: "PT Supplier Jaya",
  lines: [
    {
      prLineId: "pr-line-001",
      itemCode: "BRG-001",
      itemName: "Safety Helmet",
      qtyOrdered: 5,
      unitPrice: 150000,
      uom: "PCS",
      siteCode: "WH-JKT",
      requiredDate: "2026-09-15"
    },
    {
      prLineId: "pr-line-002",
      itemCode: "HSJ-002",
      itemName: "Hi-Vis Safety Jacket",
      qtyOrdered: 10,
      unitPrice: 250000,
      uom: "PCS",
      siteCode: "WH-JKT",
      requiredDate: null
    }
  ]
}
```

---

## Next Steps (When Ready for API Integration)

### 1. Connect to Backend
In `PurchaseOrderCreatePage.vue`:

```javascript
// Replace mock function:
const loadPrLines = async () => {
  try {
    const { items } = await api.listRequisitions(); // TODO: use open-lines endpoint
    availablePrLines.value = items.map(line => ({
      ...line,
      qtyRemaining: line.qtyRequested - line.qtyAllocated,
    }));
  } catch (error) {
    errorLoadingPrLines.value = error.message;
  }
};

// Replace submit handler:
const handleSubmit = async () => {
  if (!validateForm()) return;
  
  try {
    const result = await api.createPurchaseOrder(payload);
    router.push(`/purchase-orders/${result.id}`);
  } catch (error) {
    errorMessage.value = error.message;
  }
};
```

### 2. Test the Flow
- ✅ Backend: `npm test` in `/backend` (verify PO endpoints work)
- ✅ Frontend: Test with actual API (replace mock data)
- ✅ E2E: Playwright tests for full PR → PO flow

### 3. Polish
- Add loading spinners for async states
- Add success/error toast notifications
- Handle edge cases (network errors, API validation failures)
- Optimize table rendering for large datasets

---

## Code Quality Checklist

✅ **Vue 3 Best Practices**
- `<script setup>` syntax (no legacy Options API)
- Reactive state with `ref()` and `computed()`
- Proper v-model patterns with emits
- Watchers for side effects

✅ **Code Organization**
- Components stay focused (single responsibility)
- Props and emits explicitly defined
- Readable variable names (no cryptic abbreviations)
- Comments for non-obvious logic

✅ **Accessibility**
- All inputs have associated labels
- Error messages linked to fields
- Focus styles visible
- Semantic HTML

✅ **Styling**
- No hardcoded colors (all CSS variables)
- Responsive design (mobile-first)
- Baseline patterns reused
- Consistent spacing and sizing

✅ **No API Calls Yet**
- Mock data only
- Placeholders marked as TODO
- Ready for integration without refactoring

---

## Files Created/Modified

| File | Status | Type |
|------|--------|------|
| `frontend/src/components/VendorHeadingForm.vue` | ✅ Created | Component |
| `frontend/src/components/PRLinePicker.vue` | ✅ Created | Component |
| `frontend/src/components/LineAllocationForm.vue` | ✅ Created | Component |
| `frontend/src/pages/PurchaseOrderCreatePage.vue` | ✅ Updated | Page |
| `frontend/PO_CREATE_COMPONENTS.md` | ✅ Created | Documentation |
| `frontend/PO_CREATE_TESTING.md` | ✅ Created | Testing Guide |

**Total LOC (Vue + Docs)**: ~2000 lines of clean, documented code

---

## Testing the Components

### Quick Start
```bash
cd frontend
npm run dev
# Navigate to http://localhost:5173/purchase-orders/new
```

### What to Expect
1. Page loads with vendor input + PR line table
2. Mock PR lines appear (Safety Helmet, Hi-Vis Jacket)
3. Select lines → allocation form cards appear
4. Enter qty/price → form validates in real-time
5. Create button becomes enabled when form is valid
6. Click Create → payload logged to console

### Full Testing Guide
See `frontend/PO_CREATE_TESTING.md` for:
- Component verification checklist
- Validation scenario tests
- UI/UX checks
- Debugging tips

---

## Summary

A **complete, production-ready Vue component structure** for PO creation:

✅ 3 reusable components (VendorHeadingForm, PRLinePicker, LineAllocationForm)  
✅ Main page composing all 3 components  
✅ Form state management with validation  
✅ Payload builder ready for API  
✅ Mock data included for testing  
✅ Comprehensive documentation (2 guides)  
✅ No API calls yet (marked TODO for next phase)  
✅ Follows baseline patterns and CSS variables  
✅ Clean, readable Vue 3 code  

**Next phase**: Replace mock data and TODO callbacks with real backend API calls.
