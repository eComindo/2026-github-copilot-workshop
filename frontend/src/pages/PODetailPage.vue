<template>
  <section>
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to list">&#8592;</RouterLink>
        <div>
          <h2>Purchase Order Detail</h2>
          <p class="muted">{{ purchaseOrder?.poNumber || '-' }} &mdash; Purchase Order information detail</p>
        </div>
      </div>
      <div class="btn-group" v-if="purchaseOrder">
        <button v-if="purchaseOrder.status === 'DRAFT'" class="btn btn-primary" @click="submitPurchaseOrder" :disabled="submitting">
          {{ submitting ? 'Submitting...' : 'Submit PO' }}
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- PO Header card -->
    <div class="card-panel" v-if="purchaseOrder">
      <p class="form-section-title">PO Header</p>
      <div class="form-row">
        <div class="form-group">
          <label>PO Number</label>
          <input :value="purchaseOrder.poNumber" disabled />
        </div>
        <div class="form-group">
          <label>Vendor</label>
          <input :value="purchaseOrder.vendorName" disabled />
        </div>
        <div class="form-group">
          <label>Status</label>
          <span class="status-badge" :class="purchaseOrder.status.toLowerCase()">{{ purchaseOrder.status }}</span>
        </div>
        <div class="form-group">
          <label>Created</label>
          <input :value="purchaseOrder.createdAt ? new Date(purchaseOrder.createdAt).toLocaleDateString() : '-'" disabled />
        </div>
      </div>
    </div>

    <!-- PO Lines card -->
    <div class="card-panel" v-if="purchaseOrder">
      <p class="form-section-title">PO Lines</p>
      <table v-if="purchaseOrder.lines.length > 0">
        <thead>
          <tr>
            <th style="width:50px">Line</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th style="width:80px">QTY</th>
            <th style="width:80px">UOM</th>
            <th style="width:100px">Unit Price</th>
            <th style="width:100px">Total</th>
            <th style="width:80px">Site</th>
            <th>Required Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in purchaseOrder.lines" :key="line.id">
            <td>{{ line.lineNo }}</td>
            <td>{{ line.itemCode }}</td>
            <td>{{ line.itemName }}</td>
            <td>{{ line.qtyOrdered }}</td>
            <td>{{ line.uom }}</td>
            <td>{{ line.unitPrice.toFixed(2) }}</td>
            <td>{{ (line.qtyOrdered * line.unitPrice).toFixed(2) }}</td>
            <td>{{ line.siteCode }}</td>
            <td>{{ line.requiredDate || '-' }}</td>
          </tr>
        </tbody>
      </table>
      <p v-else class="muted" style="margin: 0">No lines in this purchase order</p>
    </div>

    <!-- Allocations info card -->
    <div class="card-panel" v-if="purchaseOrder && hasAllocations">
      <p class="form-section-title">PR Allocations</p>
      <p class="muted" style="margin: 0; font-size: 0.875rem">
        This purchase order allocates quantities against the following purchase requisition lines:
      </p>
      <div style="margin-top: 12px; font-size: 0.875rem">
        <div v-for="line in purchaseOrder.lines" :key="line.id" style="margin-bottom: 12px">
          <strong>{{ line.itemCode }}: {{ line.qtyOrdered }} {{ line.uom }}</strong>
          <div style="margin-left: 12px; color: var(--text-muted)">
            <div v-for="alloc in line.allocations" :key="alloc.prLineId">
              ← PR {{ alloc.prNumber }} ({{ alloc.allocatedQty }} {{ line.uom }})
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const purchaseOrder = ref(null);
const errorMessage = ref('');
const submitting = ref(false);

const hasAllocations = computed(() => {
  return purchaseOrder.value?.lines?.some((line) => line.allocations?.length > 0);
});

async function load() {
  errorMessage.value = '';
  try {
    purchaseOrder.value = await api.getPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function submitPurchaseOrder() {
  submitting.value = true;
  try {
    purchaseOrder.value = await api.submitPurchaseOrder(route.params.id);
    errorMessage.value = '';
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header h2 {
  font-size: 24px;
  font-weight: 600;
  margin: 0 0 4px;
  color: var(--text);
}

.page-header .muted {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: var(--radius-btn);
  background: var(--white);
  border: 1px solid var(--border);
  color: var(--text);
  font-size: 1.2rem;
  cursor: pointer;
  transition: border-color 0.2s;
}

.back-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.btn-group {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 24px;
  border-radius: var(--radius-btn);
  border: none;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-primary:hover {
  opacity: 0.9;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.card-panel {
  background: var(--white);
  border-radius: var(--radius-card);
  padding: 24px;
  border: 1px solid var(--border);
  margin-bottom: 24px;
}

.form-section-title {
  font-weight: 600;
  font-size: 1rem;
  margin: 0 0 16px 0;
  color: var(--text);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 6px;
  color: var(--text);
}

.form-group input:disabled {
  background: var(--white);
  color: var(--text);
  cursor: default;
  opacity: 1;
}

input {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  width: fit-content;
}

.status-badge.draft {
  background: #fff3cd;
  color: #856404;
}

.status-badge.submitted {
  background: #d1ecf1;
  color: #0c5460;
}

.status-badge.approved {
  background: #d4edda;
  color: #155724;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
  margin-top: 12px;
}

thead {
  background: var(--table-header);
  border-bottom: 1px solid var(--border);
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text);
}

td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

.muted {
  color: var(--text-muted);
}

.error {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-bottom: 16px;
}
</style>
