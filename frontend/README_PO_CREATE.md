# PO Create Page — Quick Start Guide

**Status**: 3 reusable Vue components + main page = **Ready to Test**

---

## What Was Generated

### Components (3 reusable)
1. **VendorHeadingForm.vue** — Vendor name input
2. **PRLinePicker.vue** — Multi-select PR lines table
3. **LineAllocationForm.vue** — Qty/price form per line

### Main Page (1)
4. **PurchaseOrderCreatePage.vue** — Orchestrates all 3 components

### Documentation (3)
- **PO_CREATE_SUMMARY.md** — Overview & architecture
- **PO_CREATE_COMPONENTS.md** — Full API reference (component props/emits)
- **PO_CREATE_TESTING.md** — Step-by-step testing guide

---

## Test It Now (5 minutes)

### 1. Start frontend dev server
```bash
cd frontend
npm run dev
```

### 2. Navigate to PO Create page
```
http://localhost:5173/purchase-orders/new
```

### 3. Try the form
- Enter vendor name: "Test Vendor"
- Select first PR line (checkbox)
- Enter Qty Ordered: 5
- Click "Create Purchase Order"
- Check browser console for payload log

### Expected Console Output
```javascript
PO Create Payload (ready for API): Object {
  vendorName: "Test Vendor",
  lines: [ {
    prLineId: "pr-line-001",
    itemCode: "BRG-001",
    itemName: "Safety Helmet",
    qtyOrdered: 5,
    unitPrice: 150000,
    uom: "PCS",
    siteCode: "",
    requiredDate: "2026-09-15"
  } ]
}
```

---

## Key Features

✅ **Vendor input** with validation  
✅ **PR line picker** with multi-select checkboxes  
✅ **Allocation form** with qty/price inputs  
✅ **Real-time validation** (errors display inline)  
✅ **Responsive design** (mobile-friendly)  
✅ **Mock data included** (2 sample PR lines)  
✅ **Payload builder** (ready for API)  
✅ **Zero API calls** (marked TODO)  

---

## Component Structure

```
┌─ PurchaseOrderCreatePage ────────────────────┐
│                                              │
│  ┌─ VendorHeadingForm ──────────────────┐   │
│  │ [Vendor Name Input Field]            │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌─ PRLinePicker ────────────────────────┐   │
│  │ ☑ PR Number | Line | Item | Qty...   │   │
│  │ ☐ PR-001 | 1 | BRG-001 | 10/0/10    │   │
│  │ ☑ PR-001 | 2 | HSJ-002 | 20/5/15    │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  ┌─ LineAllocationForm ──────────────────┐   │
│  │ ┌─ BRG-001 Safety Helmet ─────────┐  │   │
│  │ │ Qty Remaining: 10                │  │   │
│  │ │ [Qty Ordered: 5  ] [Price: 150K] │  │   │
│  │ │ [Required Date:  ]               │  │   │
│  │ │                              [✕]│  │   │
│  │ └──────────────────────────────────┘  │   │
│  │                                        │   │
│  │ ┌─ HSJ-002 Hi-Vis Jacket ──────────┐  │   │
│  │ │ Qty Remaining: 15                │  │   │
│  │ │ [Qty Ordered: 10 ] [Price: 250K] │  │   │
│  │ │ [Required Date:  ]               │  │   │
│  │ │                              [✕]│  │   │
│  │ └──────────────────────────────────┘  │   │
│  └────────────────────────────────────────┘   │
│                                               │
│  [Cancel] ─────────────── [Create PO]        │
│                                               │
└───────────────────────────────────────────────┘
```

---

## Form Validation

Creates button is **enabled** only when:
- ✅ Vendor name filled (non-empty)
- ✅ At least 1 PR line selected
- ✅ Each line: 0 < Qty ≤ Remaining
- ✅ Each line: Unit Price ≥ 0

Creates button is **disabled** if any condition fails.

Error messages appear below each field:
- "Vendor name is required"
- "Quantity must be greater than 0"
- "Quantity cannot exceed remaining 10"

---

## Files at a Glance

| File | Lines | Purpose |
|------|-------|---------|
| VendorHeadingForm.vue | 80 | Vendor input |
| PRLinePicker.vue | 280 | PR line table |
| LineAllocationForm.vue | 240 | Qty/price forms |
| PurchaseOrderCreatePage.vue | 400 | Main orchestrator |
| **Total Components** | **1000** | |
| PO_CREATE_SUMMARY.md | 400 | Overview |
| PO_CREATE_COMPONENTS.md | 600 | API reference |
| PO_CREATE_TESTING.md | 400 | Testing guide |
| **Total Docs** | **1400** | |

---

## Next: API Integration (When Backend Ready)

Replace 2 TODO callouts:

### TODO #1: Load PR Lines
**File**: `PurchaseOrderCreatePage.vue` → `loadPrLines()` function

**Current** (mock):
```javascript
availablePrLines.value = [ /* hardcoded */ ];
```

**Replace with**:
```javascript
const { items } = await api.listRequisitions();
availablePrLines.value = items;
```

### TODO #2: Create PO
**File**: `PurchaseOrderCreatePage.vue` → `handleSubmit()` function

**Current** (mock):
```javascript
console.log('PO Create Payload (ready for API):', payload);
```

**Replace with**:
```javascript
const result = await api.createPurchaseOrder(payload);
router.push(`/purchase-orders/${result.id}`);
```

---

## Debugging

### Form not validating?
Open browser DevTools → Console:
```javascript
// Check form state
console.log({
  vendorName: form.value.vendorName,
  selectedLineIds: selectedLineIds.value,
  selectedLines: selectedLines.value,
  isFormValid: isFormValid.value
});
```

### PR lines not loading?
Check PRLinePicker component:
```javascript
// Should show mock data
console.log(availablePrLines.value);
```

### Payload structure not matching API?
When you click Create, payload logged to console:
```javascript
// Verify structure matches /api/purchase-orders POST contract
// From: docs/plan.md → API Scope section
```

---

## Next Steps

1. ✅ **Test the form** (this page)
2. ⏳ **Connect backend** (replace TODO #1 & #2)
3. ⏳ **Test full flow** (PR create → PO create → PO detail)
4. ⏳ **Add Playwright tests** (E2E coverage)

---

## Support Files

For more detail, see:
- 📄 [PO_CREATE_SUMMARY.md](PO_CREATE_SUMMARY.md) — Full overview
- 📖 [PO_CREATE_COMPONENTS.md](PO_CREATE_COMPONENTS.md) — Component API
- 🧪 [PO_CREATE_TESTING.md](PO_CREATE_TESTING.md) — Testing guide

---

**Status**: Ready for testing and API integration. No breaking changes to existing code.
