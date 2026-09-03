# PO Backlog Implementation Runbook

**Objective:** Implement Purchase Order (PO) module frontend to complete the MVP.  
**Status:** Backend + database + tests are complete. Frontend integration only.  
**Estimated Duration:** 2.5–3.5 hours  
**Date:** September 2, 2026

---

## Executive Summary

The MVP plan has been validated. Backend PO API, database schema, and Jest tests are **100% complete**. This runbook focuses the backlog exclusively on **frontend implementation**: API wrapper methods + three UI pages (List, Create, Detail) + E2E test.

### What's Already Done ✅
- All 5 PO REST endpoints implemented and tested
- Transactional allocation logic with row-level locking
- Database schema with all constraints and indexes
- Jest tests for validation and over-allocation guards
- Pre-seeded approved requisitions for testing

### What Needs to Be Done ❌
- Add 5 PO methods to `frontend/src/api.js`
- Create `POListPage.vue`, `POCreatePage.vue`, `PODetailPage.vue`
- Register routes in `frontend/src/router/index.js`
- Add Playwright E2E test
- Verify full navigation flow

---

## Prerequisites (Checkpoint P0)

**Before starting, verify:**
- [ ] Docker Compose is running: `docker compose ps` (should show `db` running)
- [ ] PostgreSQL is accessible on `localhost:5433`
- [ ] Backend running on `localhost:3000`: `npm run dev` from `backend/` directory
- [ ] Frontend dev server on `localhost:5173`: `npm run dev` from `frontend/` directory
- [ ] Baseline PR pages (List, Detail, Create) are accessible and working
- [ ] Approved requisitions exist in DB with status=`APPROVED`

**To verify approved PRs exist:**
```bash
# In a terminal, connect to DB and check:
docker exec -it <container_id> psql -U workshop -d procurement_mvp -c \
  "SELECT id, pr_number, status FROM purchase_requisitions WHERE status='APPROVED' LIMIT 1;"
```

✅ **Checkpoint P0 complete** when all prerequisites pass and you can view an approved PR detail.

---

## Phase 1: Frontend API Wrapper

### Task 1.1: Add PO API Methods

**File:** `frontend/src/api.js`

Add these 5 methods to the API wrapper (export them alongside existing requisition methods):

```javascript
export async function listPurchaseOrders() {
  const response = await fetch(`${API_BASE_URL}/api/purchase-orders`);
  return handleResponse(response);
}

export async function createPurchaseOrder(payload) {
  const response = await fetch(`${API_BASE_URL}/api/purchase-orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
}

export async function getPurchaseOrder(id) {
  const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}`);
  return handleResponse(response);
}

export async function submitPurchaseOrder(id) {
  const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}/submit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return handleResponse(response);
}

export async function getOpenPoLines(id) {
  const response = await fetch(`${API_BASE_URL}/api/purchase-orders/${id}/open-lines`);
  return handleResponse(response);
}
```

**Verify Checkpoint 1:**
```javascript
// In browser DevTools console:
await api.listPurchaseOrders();      // Should return array (empty or populated)
await api.createPurchaseOrder({});   // Should return error (invalid payload) — that's OK
```

✅ **Checkpoint 1 complete** when all 5 methods are callable and return without network errors.

---

## Phase 2: PO List Page

### Task 2.1: Create POListPage Component

**File:** `frontend/src/pages/POListPage.vue`

```vue
<template>
  <div class="po-list-page">
    <h1>Purchase Orders</h1>
    
    <div class="actions">
      <router-link to="/po-create" class="btn btn-primary">
        Create New PO
      </router-link>
    </div>

    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <table v-else class="po-table">
      <thead>
        <tr>
          <th>PO Number</th>
          <th>Vendor Name</th>
          <th>Status</th>
          <th>Created</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="po in purchaseOrders" :key="po.id">
          <td>{{ po.po_number }}</td>
          <td>{{ po.vendor_name }}</td>
          <td>
            <span :class="`status-${po.status.toLowerCase()}`">
              {{ po.status }}
            </span>
          </td>
          <td>{{ formatDate(po.created_at) }}</td>
          <td>
            <router-link :to="`/po/${po.id}`" class="btn btn-small">
              View
            </router-link>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="!loading && purchaseOrders.length === 0" class="empty-state">
      No purchase orders yet. <router-link to="/po-create">Create one</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '../api.js';

const router = useRouter();
const purchaseOrders = ref([]);
const loading = ref(false);
const error = ref(null);

onMounted(async () => {
  loading.value = true;
  try {
    purchaseOrders.value = await api.listPurchaseOrders();
  } catch (err) {
    error.value = err.message || 'Failed to load purchase orders';
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString();
};
</script>

<style scoped>
.po-list-page {
  padding: 20px;
}

.actions {
  margin: 20px 0;
}

.btn {
  display: inline-block;
  padding: 8px 16px;
  background-color: #007bff;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  cursor: pointer;
  border: none;
}

.btn:hover {
  background-color: #0056b3;
}

.btn-small {
  padding: 4px 8px;
  font-size: 0.9em;
}

.po-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.po-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.po-table th,
.po-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.po-table tbody tr:hover {
  background-color: #f9f9f9;
}

.status-draft {
  color: #ff9800;
  font-weight: bold;
}

.status-submitted {
  color: #4caf50;
  font-weight: bold;
}

.loading,
.error {
  padding: 20px;
  text-align: center;
  font-size: 1.1em;
}

.error {
  color: #d32f2f;
  background-color: #ffebee;
  border-radius: 4px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #999;
  font-size: 1.1em;
}

.empty-state a {
  color: #007bff;
  text-decoration: none;
}

.empty-state a:hover {
  text-decoration: underline;
}
</style>
```

**Verify Checkpoint 2:**
- Navigate to `http://localhost:5173/po-list`
- Table displays with headers and action buttons
- No console errors

✅ **Checkpoint 2 complete** when POListPage renders and displays (empty or seeded PO data).

---

## Phase 3: PO Create Page

### Task 3.1: Create POCreatePage Component

**File:** `frontend/src/pages/POCreatePage.vue`

```vue
<template>
  <div class="po-create-page">
    <h1>Create Purchase Order</h1>

    <form @submit.prevent="submitForm" class="po-create-form">
      <!-- Vendor Name Section -->
      <div class="form-group">
        <label for="vendor-name">Vendor Name *</label>
        <input
          id="vendor-name"
          v-model="formData.vendorName"
          type="text"
          required
          placeholder="Enter vendor name"
        />
      </div>

      <!-- PR Lines Selector -->
      <div class="form-group">
        <h3>Select Approved PR Lines</h3>
        <div v-if="loadingPrLines" class="loading">Loading PR lines...</div>
        <div v-else-if="errorPrLines" class="error">{{ errorPrLines }}</div>
        <div v-else class="pr-lines-selector">
          <table class="pr-lines-table">
            <thead>
              <tr>
                <th>Select</th>
                <th>PR Number</th>
                <th>Line No</th>
                <th>Item Code</th>
                <th>Item Name</th>
                <th>Qty Requested</th>
                <th>Qty Allocated</th>
                <th>Open Qty</th>
                <th>UOM</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="line in availablePrLines" :key="line.id">
                <td>
                  <input
                    type="checkbox"
                    :value="line.id"
                    v-model="selectedPrLineIds"
                  />
                </td>
                <td>{{ line.pr_number }}</td>
                <td>{{ line.line_no }}</td>
                <td>{{ line.item_code }}</td>
                <td>{{ line.item_name }}</td>
                <td>{{ line.qty_requested }}</td>
                <td>{{ line.qty_allocated }}</td>
                <td>{{ line.qty_requested - line.qty_allocated }}</td>
                <td>{{ line.uom }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="availablePrLines.length === 0" class="empty-state">
            No open PR lines available. All requisitions may be fully allocated.
          </div>
        </div>
      </div>

      <!-- PO Line Items -->
      <div class="form-group">
        <h3>PO Line Items</h3>
        <table v-if="formData.lines.length > 0" class="po-lines-table">
          <thead>
            <tr>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Open Qty</th>
              <th>Qty Ordered *</th>
              <th>Unit Price *</th>
              <th>UOM</th>
              <th>Site Code</th>
              <th>Required Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(line, idx) in formData.lines" :key="line.id">
              <td>{{ line.item_code }}</td>
              <td>{{ line.item_name }}</td>
              <td>{{ line.openQty }}</td>
              <td>
                <input
                  v-model.number="line.qtyOrdered"
                  type="number"
                  step="0.01"
                  :max="line.openQty"
                  required
                  @input="validateLineQuantity(idx)"
                />
                <span v-if="lineErrors[idx]" class="field-error">
                  {{ lineErrors[idx] }}
                </span>
              </td>
              <td>
                <input
                  v-model.number="line.unitPrice"
                  type="number"
                  step="0.01"
                  required
                />
              </td>
              <td>{{ line.uom }}</td>
              <td>{{ line.site_code }}</td>
              <td>{{ line.required_date }}</td>
              <td>
                <button
                  type="button"
                  @click="removeLine(idx)"
                  class="btn btn-danger btn-small"
                >
                  Remove
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="empty-state">
          Select PR lines above to add them to the PO.
        </div>
      </div>

      <!-- Actions -->
      <div class="form-actions">
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Creating...' : 'Create PO' }}
        </button>
        <router-link to="/po-list" class="btn btn-secondary">
          Cancel
        </router-link>
      </div>

      <!-- Error Display -->
      <div v-if="submitError" class="error">{{ submitError }}</div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import * as api from '../api.js';

const router = useRouter();

const formData = ref({
  vendorName: '',
  lines: [],
});

const selectedPrLineIds = ref([]);
const availablePrLines = ref([]);
const loadingPrLines = ref(false);
const errorPrLines = ref(null);
const submitting = ref(false);
const submitError = ref(null);
const lineErrors = ref({});

// Load approved PR lines on mount
const loadApprovedPrLines = async () => {
  loadingPrLines.value = true;
  try {
    // Assuming api.getRequisitionOpenLines() returns open lines from approved PRs
    // If not, we may need to call getRequisitions() and filter
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
            openQty: line.qty_requested - line.qty_allocated,
          }))
        );
      }
    }
    availablePrLines.value = allLines;
  } catch (err) {
    errorPrLines.value = err.message || 'Failed to load PR lines';
  } finally {
    loadingPrLines.value = false;
  }
};

// Watch selected PR line IDs and sync with lines array
watch(selectedPrLineIds, (newIds) => {
  const currentLineIds = new Set(formData.value.lines.map((l) => l.id));
  const newIdSet = new Set(newIds);

  // Add new lines
  newIds.forEach((id) => {
    if (!currentLineIds.has(id)) {
      const prLine = availablePrLines.value.find((l) => l.id === id);
      if (prLine) {
        formData.value.lines.push({
          id: prLine.id,
          pr_line_id: prLine.id,
          item_code: prLine.item_code,
          item_name: prLine.item_name,
          openQty: prLine.openQty,
          qtyOrdered: prLine.openQty, // Default to full open qty
          unitPrice: prLine.est_unit_price || 0,
          uom: prLine.uom,
          site_code: prLine.site_code,
          required_date: prLine.required_date,
        });
      }
    }
  });

  // Remove deselected lines
  formData.value.lines = formData.value.lines.filter((line) =>
    newIdSet.has(line.id)
  );
});

const validateLineQuantity = (idx) => {
  const line = formData.value.lines[idx];
  if (line.qtyOrdered > line.openQty) {
    lineErrors.value[idx] = `Cannot exceed open qty of ${line.openQty}`;
  } else if (line.qtyOrdered <= 0) {
    lineErrors.value[idx] = 'Qty must be greater than 0';
  } else {
    lineErrors.value[idx] = null;
  }
};

const removeLine = (idx) => {
  const lineId = formData.value.lines[idx].id;
  formData.value.lines.splice(idx, 1);
  selectedPrLineIds.value = selectedPrLineIds.value.filter(
    (id) => id !== lineId
  );
};

const submitForm = async () => {
  // Validate form
  if (!formData.value.vendorName.trim()) {
    submitError.value = 'Vendor name is required';
    return;
  }

  if (formData.value.lines.length === 0) {
    submitError.value = 'At least one line item is required';
    return;
  }

  // Validate all line quantities
  let hasErrors = false;
  formData.value.lines.forEach((_, idx) => {
    validateLineQuantity(idx);
    if (lineErrors.value[idx]) hasErrors = true;
  });

  if (hasErrors) {
    submitError.value = 'Please fix validation errors in line items';
    return;
  }

  submitting.value = true;
  submitError.value = null;

  try {
    // Transform lines to API format
    const payload = {
      vendorName: formData.value.vendorName,
      lines: formData.value.lines.map((line) => ({
        prLineId: line.pr_line_id,
        qtyOrdered: line.qtyOrdered,
        unitPrice: line.unitPrice,
      })),
    };

    const createdPo = await api.createPurchaseOrder(payload);
    // Navigate to PO detail page
    router.push(`/po/${createdPo.id}`);
  } catch (err) {
    submitError.value = err.message || 'Failed to create purchase order';
  } finally {
    submitting.value = false;
  }
};

// Load PR lines on component mount
loadApprovedPrLines();
</script>

<style scoped>
.po-create-page {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.po-create-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 30px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: bold;
  color: #333;
}

.form-group input[type='text'],
.form-group input[type='number'] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1em;
}

.form-group input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 4px rgba(0, 123, 255, 0.25);
}

.pr-lines-selector,
.po-lines-selector {
  margin-top: 12px;
}

.pr-lines-table,
.po-lines-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.pr-lines-table thead,
.po-lines-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.pr-lines-table th,
.po-lines-table th,
.pr-lines-table td,
.po-lines-table td {
  padding: 10px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.pr-lines-table tbody tr:hover,
.po-lines-table tbody tr:hover {
  background-color: #fafafa;
}

.po-lines-table input[type='number'] {
  width: 90%;
  padding: 4px 8px;
}

.field-error {
  display: block;
  color: #d32f2f;
  font-size: 0.85em;
  margin-top: 4px;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 30px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 1em;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover {
  background-color: #c82333;
}

.btn-small {
  padding: 4px 8px;
  font-size: 0.9em;
}

.loading,
.error {
  padding: 12px;
  border-radius: 4px;
  margin-top: 12px;
}

.error {
  background-color: #ffebee;
  color: #d32f2f;
  border-left: 4px solid #d32f2f;
}

.empty-state {
  padding: 20px;
  text-align: center;
  color: #999;
  background-color: #fafafa;
  border-radius: 4px;
}
</style>
```

**Verify Checkpoint 3:**
- Navigate to `http://localhost:5173/po-create`
- Form renders with vendor name input and PR lines table
- Select an approved PR line
- Item appears in "PO Line Items" section
- Input quantities and unit price
- Click "Create PO"
- Verify redirect to PO detail page
- Check database: `SELECT * FROM purchase_orders ORDER BY created_at DESC LIMIT 1;`

✅ **Checkpoint 3 complete** when PO is created, saved to DB, and PR line qty_allocated is incremented.

---

## Phase 4: PO Detail Page

### Task 4.1: Create PODetailPage Component

**File:** `frontend/src/pages/PODetailPage.vue`

```vue
<template>
  <div class="po-detail-page">
    <div v-if="loading" class="loading">Loading PO...</div>
    <div v-else-if="error" class="error">{{ error }}</div>

    <div v-else class="po-detail">
      <div class="po-header">
        <h1>{{ po.po_number }}</h1>
        <span :class="`status-${po.status.toLowerCase()}`">{{ po.status }}</span>
      </div>

      <div class="po-info">
        <div class="info-row">
          <label>Vendor Name:</label>
          <span>{{ po.vendor_name }}</span>
        </div>
        <div class="info-row">
          <label>Created:</label>
          <span>{{ formatDate(po.created_at) }}</span>
        </div>
        <div class="info-row">
          <label>Updated:</label>
          <span>{{ formatDate(po.updated_at) }}</span>
        </div>
      </div>

      <h2>Line Items</h2>
      <table class="po-lines-table">
        <thead>
          <tr>
            <th>Line No</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Qty Ordered</th>
            <th>Qty Received</th>
            <th>UOM</th>
            <th>Unit Price</th>
            <th>Site Code</th>
            <th>Required Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in po.po_lines" :key="line.id">
            <td>{{ line.line_no }}</td>
            <td>{{ line.item_code }}</td>
            <td>{{ line.item_name }}</td>
            <td>{{ line.qty_ordered }}</td>
            <td>{{ line.qty_received }}</td>
            <td>{{ line.uom }}</td>
            <td>${{ line.unit_price.toFixed(2) }}</td>
            <td>{{ line.site_code }}</td>
            <td>{{ formatDate(line.required_date) }}</td>
          </tr>
        </tbody>
      </table>

      <div class="po-actions">
        <button
          v-if="po.status === 'DRAFT'"
          @click="submitPo"
          class="btn btn-primary"
          :disabled="submitting"
        >
          {{ submitting ? 'Submitting...' : 'Submit PO' }}
        </button>
        <router-link to="/po-list" class="btn btn-secondary">
          Back to PO List
        </router-link>
      </div>

      <div v-if="submitError" class="error">{{ submitError }}</div>
      <div v-if="submitSuccess" class="success">{{ submitSuccess }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import * as api from '../api.js';

const route = useRoute();
const router = useRouter();

const po = ref({
  po_number: '',
  status: 'DRAFT',
  vendor_name: '',
  created_at: '',
  updated_at: '',
  po_lines: [],
});

const loading = ref(false);
const error = ref(null);
const submitting = ref(false);
const submitError = ref(null);
const submitSuccess = ref(null);

onMounted(async () => {
  loading.value = true;
  try {
    const poId = route.params.id;
    po.value = await api.getPurchaseOrder(poId);
  } catch (err) {
    error.value = err.message || 'Failed to load purchase order';
  } finally {
    loading.value = false;
  }
});

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

const submitPo = async () => {
  submitting.value = true;
  submitError.value = null;
  submitSuccess.value = null;

  try {
    await api.submitPurchaseOrder(po.value.id);
    po.value.status = 'SUBMITTED';
    submitSuccess.value = 'Purchase Order submitted successfully!';
    // Optionally reload to get fresh data
    setTimeout(() => {
      router.push('/po-list');
    }, 2000);
  } catch (err) {
    submitError.value = err.message || 'Failed to submit purchase order';
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
.po-detail-page {
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
}

.po-detail {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.po-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 15px;
}

.po-header h1 {
  margin: 0;
  font-size: 2em;
  color: #333;
}

.status-draft {
  display: inline-block;
  padding: 8px 16px;
  background-color: #ff9800;
  color: white;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9em;
}

.status-submitted {
  display: inline-block;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border-radius: 20px;
  font-weight: bold;
  font-size: 0.9em;
}

.po-info {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.info-row label {
  font-weight: bold;
  color: #555;
  min-width: 120px;
}

.info-row span {
  color: #333;
}

h2 {
  margin-top: 30px;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #e0e0e0;
  padding-bottom: 10px;
}

.po-lines-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.po-lines-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.po-lines-table th,
.po-lines-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
  font-size: 0.95em;
}

.po-lines-table tbody tr:hover {
  background-color: #f9f9f9;
}

.po-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  display: inline-block;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  text-decoration: none;
  font-size: 1em;
  font-weight: 500;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.loading,
.error,
.success {
  padding: 15px;
  border-radius: 4px;
  margin-top: 15px;
  font-size: 1em;
}

.error {
  background-color: #ffebee;
  color: #d32f2f;
  border-left: 4px solid #d32f2f;
}

.success {
  background-color: #e8f5e9;
  color: #2e7d32;
  border-left: 4px solid #2e7d32;
}

.loading {
  text-align: center;
  color: #666;
}
</style>
```

**Verify Checkpoint 4:**
- Click "View" on any PO from list page (or navigate to `/po/<po-id>`)
- PO detail displays with header, status badge, and line items table
- If status is DRAFT, "Submit PO" button is visible and clickable
- Click "Submit PO"
- Verify status changes to SUBMITTED in UI and DB

✅ **Checkpoint 4 complete** when PO detail page loads, displays correctly, and submit button transitions status from DRAFT to SUBMITTED.

---

## Phase 5: Router Integration

### Task 5.1: Register PO Routes

**File:** `frontend/src/router/index.js`

Add these route definitions (alongside existing requisition routes):

```javascript
import POListPage from '../pages/POListPage.vue';
import POCreatePage from '../pages/POCreatePage.vue';
import PODetailPage from '../pages/PODetailPage.vue';

const routes = [
  // ... existing routes ...
  
  {
    path: '/po-list',
    name: 'POList',
    component: POListPage,
  },
  {
    path: '/po-create',
    name: 'POCreate',
    component: POCreatePage,
  },
  {
    path: '/po/:id',
    name: 'PODetail',
    component: PODetailPage,
  },
  
  // ... rest of routes ...
];
```

### Task 5.2: Update Dashboard Navigation

**File:** `frontend/src/pages/DashboardPage.vue` (or wherever navigation is)

Add a link to PO List in the dashboard:

```html
<router-link to="/po-list">Purchase Orders</router-link>
```

**Verify Checkpoint 5:**
- Dashboard shows "Purchase Orders" link
- Click link → navigates to `/po-list`
- "Create New PO" button → navigates to `/po-create`
- From create form, successful submit → navigates to `/po/:id` (detail)
- From detail page, "Back to PO List" → navigates to `/po-list`
- No broken links, no console errors

✅ **Checkpoint 5 complete** when full navigation cycle (Dashboard → List → Create → Detail → List) works without errors.

---

## Phase 6: E2E Testing with Playwright

### Task 6.1: Add PO-Focused Playwright Test

**File:** Create `frontend/tests/po.spec.js` (or add to existing Playwright config)

```javascript
import { test, expect } from '@playwright/test';

const BASE_URL = 'http://localhost:5173';

test('Complete PO workflow: Create from approved PR, then submit', async ({ page }) => {
  // Step 1: Navigate to dashboard
  await page.goto(`${BASE_URL}`);
  await expect(page).toHaveTitle(/Dashboard|Home/i);

  // Step 2: Navigate to PR List
  await page.click('text=Purchase Requisitions');
  await expect(page).toHaveURL(/.*\/pr-list/);
  await expect(page.locator('table')).toBeVisible();

  // Step 3: Open first approved PR detail
  // Assuming requisitions are pre-seeded with approved status
  const prLinks = await page.locator('a:has-text("View")').all();
  if (prLinks.length > 0) {
    await prLinks[0].click();
  }
  await expect(page).toHaveURL(/.*\/requisition\/[a-f0-9-]+/);

  // Step 4: Note an open line quantity
  const lineTable = await page.locator('table').first();
  await expect(lineTable).toBeVisible();

  // Step 5: Navigate to PO Create from PR Detail or via link
  // Option A: If there's a "Create PO" button on PR Detail
  const createPoBtn = page.locator('a:has-text("Create PO")');
  if (await createPoBtn.isVisible()) {
    await createPoBtn.click();
  } else {
    // Option B: Navigate via sidebar/menu
    await page.goto(`${BASE_URL}/po-create`);
  }

  await expect(page).toHaveURL(/.*\/po-create/);

  // Step 6: Fill vendor name
  await page.fill('input[id="vendor-name"]', 'Acme Supplies Inc.');

  // Step 7: Select a PR line (first checkbox)
  const firstCheckbox = await page.locator('input[type="checkbox"]').first();
  if (await firstCheckbox.isVisible()) {
    await firstCheckbox.check();
  }

  // Step 8: Input PO quantities and prices
  const qtyInputs = await page.locator('input[type="number"]').all();
  if (qtyInputs.length >= 2) {
    // First number input in PO lines is qty_ordered
    await qtyInputs[0].fill('10');
    // Second is unit_price
    await qtyInputs[1].fill('99.99');
  }

  // Step 9: Submit PO
  await page.click('button:has-text("Create PO")');

  // Step 10: Verify redirect to PO Detail and status is DRAFT
  await page.waitForURL(/.*\/po\/[a-f0-9-]+/);
  await expect(page.locator('text=DRAFT')).toBeVisible();

  // Step 11: Submit the PO
  await page.click('button:has-text("Submit PO")');

  // Step 12: Verify status changes to SUBMITTED
  await expect(page.locator('text=SUBMITTED')).toBeVisible();

  // Step 13: Navigate back to PO List
  await page.click('a:has-text("Back to PO List")');
  await expect(page).toHaveURL(/.*\/po-list/);

  // Step 14: Verify PO appears in list with SUBMITTED status
  await expect(page.locator('table')).toContainText('SUBMITTED');
});
```

**Run the test:**
```bash
cd frontend
npm run test:e2e
```

**Verify Checkpoint 6:**
- Test runs without hanging or timing out
- All steps execute in order
- Final assertion (PO in list with SUBMITTED status) passes
- No unhandled promise rejections or browser crashes

✅ **Checkpoint 6 complete** when Playwright test runs end-to-end and all assertions pass.

---

## Done Criteria Checklist

### Functional ✓
- [ ] All 5 PO API wrapper methods added to `frontend/src/api.js`
- [ ] `POListPage.vue` displays PO list and navigation links
- [ ] `POCreatePage.vue` allows vendor selection, PR line selection, quantity input, and PO creation
- [ ] Database confirms PO + PO lines + allocations created atomically
- [ ] `PODetailPage.vue` displays PO header and line items
- [ ] Submit button on detail page transitions PO from DRAFT to SUBMITTED
- [ ] Routes registered: `/po-list`, `/po-create`, `/po/:id`
- [ ] Dashboard navigation updated with PO List link
- [ ] Full navigation cycle works: Home → List → Create → Detail → List

### Code Quality ✓
- [ ] No console errors during navigation
- [ ] No unhandled promise rejections
- [ ] Form validation enforced (vendor name required, qty ≤ open qty)
- [ ] Error messages displayed to user on failure
- [ ] Loading states shown during API calls
- [ ] Responsive design tested at 1024px+ viewport

### Testing ✓
- [ ] Jest tests for `purchase-order-service.test.js` pass (pre-requisite ✅)
- [ ] Playwright E2E test runs and passes
- [ ] E2E test covers full workflow: PR → PO Create → Submit → List verification

### Deployment Ready ✓
- [ ] All files saved with no syntax errors
- [ ] No TODO comments left in code
- [ ] API wrapper methods consistent with backend endpoint contracts
- [ ] Page components follow Vue 3 Composition API patterns

---

## Troubleshooting

### Issue: "Cannot find module" for api.js methods
**Solution:** Verify methods are exported in `frontend/src/api.js` with `export` keyword. Check import statement in components uses correct path.

### Issue: PO Create page shows no PR lines
**Solution:** 
1. Verify approved PRs exist in DB: `SELECT * FROM purchase_requisitions WHERE status='APPROVED';`
2. Check browser DevTools → Network tab → verify `GET /api/requisitions` returns data
3. Ensure `listRequisitions()` API method is working

### Issue: "Over-allocation" error on PO creation
**Solution:** This is expected behavior from backend. Ensure `qtyOrdered` does not exceed `(pr_line.qty_requested - pr_line.qty_allocated)`. Form should validate this before submit.

### Issue: Playwright test times out
**Solution:**
1. Ensure all services are running: `docker ps`, `npm run dev` (backend), `npm run dev` (frontend)
2. Increase Playwright timeout: `test.setTimeout(60000)` at top of test file
3. Check browser is actually loading pages by adding `await page.screenshot()` before assertions

### Issue: Database shows PR qty_allocated not updated
**Solution:** This is handled by the backend atomically. If not updating, check:
1. PO creation succeeded (check DB for `purchase_orders` and `po_lines` records)
2. Backend logs for transaction errors
3. Verify backend service is running and responding to API calls

---

## Next Steps After Done Criteria

**Optional Extensions:**
1. Implement Goods Receipt (GR) module using same pattern
2. Add "Create PO" button directly on PR Detail page (cross-link PRs to POs)
3. Add Bookmark feature via GitHub Issue workflow
4. Add more comprehensive E2E tests (error cases, edge cases)
5. Performance optimization (pagination, lazy loading for large PO lists)

**For Further Exploration:**
- Review backend transaction logic in `backend/src/services/purchase-order-service.js` (row-level locking)
- Implement GR endpoints and services following same pattern
- Add reporting/dashboard views (PO summary by vendor, by status, etc.)

---

## Related Documentation

- Backend Plan: See [plan.md](plan.md) for full MVP architecture
- API Contracts: Review `backend/src/routes/purchase-order-routes.js` for endpoint details
- Data Model: See [plan.md](plan.md) section 5 for full schema
- Testing Strategy: See [plan.md](plan.md) section 7

---

**Version:** 1.0  
**Last Updated:** September 2, 2026  
**Status:** Ready for Implementation
