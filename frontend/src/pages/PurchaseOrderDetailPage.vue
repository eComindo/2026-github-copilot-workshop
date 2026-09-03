<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to purchase orders">&#8592;</RouterLink>
        <div>
          <h2>Detail Purchase Order</h2>
          <p class="muted">{{ purchaseOrder?.poNumber || '-' }} &mdash; Purchase Order information detail</p>
        </div>
      </div>
      <div class="btn-group" v-if="purchaseOrder">
        <button v-if="purchaseOrder.status === 'DRAFT'" class="btn btn-primary" @click="submitPurchaseOrder">Submit PO</button>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading" class="muted">Loading purchase order...</p>

    <div class="card-panel" v-if="purchaseOrder && !loading">
      <p class="form-section-title">PO Header</p>
      <div class="form-row">
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
        <div class="form-group">
          <label>Updated</label>
          <input :value="purchaseOrder.updatedAt ? new Date(purchaseOrder.updatedAt).toLocaleDateString() : '-'" disabled />
        </div>
      </div>
    </div>

    <div class="card-panel" v-if="purchaseOrder && !loading">
      <p class="form-section-title">Open For Goods Receipt</p>
      <p class="muted" v-if="!openLines.length">No open line quantity available.</p>
      <table v-else>
        <thead>
          <tr>
            <th>Line</th>
            <th>Item</th>
            <th>Qty Open</th>
            <th>UOM</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in openLines" :key="line.id">
            <td>{{ line.lineNo }}</td>
            <td>{{ line.itemCode }} - {{ line.itemName }}</td>
            <td>{{ line.qtyOpenForGr }}</td>
            <td>{{ line.uom }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-panel" v-if="purchaseOrder && !loading">
      <p class="form-section-title">PO Lines</p>
      <table>
        <thead>
          <tr>
            <th>Line</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Qty Ordered</th>
            <th>Qty Received</th>
            <th>UOM</th>
            <th>Unit Price</th>
            <th>Site</th>
            <th>Source PR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in purchaseOrder.lines" :key="line.id">
            <td>{{ line.lineNo }}</td>
            <td>{{ line.itemCode }}</td>
            <td>{{ line.itemName }}</td>
            <td>{{ line.qtyOrdered }}</td>
            <td>{{ line.qtyReceived }}</td>
            <td>{{ line.uom }}</td>
            <td>{{ line.unitPrice }}</td>
            <td>{{ line.siteCode }}</td>
            <td>
              <span v-if="line.allocations?.length">
                {{ line.allocations.map((allocation) => `${allocation.prNumber} (${allocation.allocatedQty})`).join(', ') }}
              </span>
              <span v-else>-</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const purchaseOrder = ref(null);
const openLines = ref([]);
const errorMessage = ref('');
const loading = ref(false);

async function load() {
  loading.value = true;
  errorMessage.value = '';

  try {
    purchaseOrder.value = await api.getPurchaseOrder(route.params.id);
    const openLinesPayload = await api.getPurchaseOrderOpenLines(route.params.id);
    openLines.value = openLinesPayload.openLines || [];
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}

async function submitPurchaseOrder() {
  try {
    purchaseOrder.value = await api.submitPurchaseOrder(route.params.id);
    await load();
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(load);
</script>

<style scoped>
.form-section-title {
  margin: 0 0 18px;
  font-size: 14px;
  font-weight: 700;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 18px 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 13px;
  font-weight: 600;
}

input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font: inherit;
  padding: 10px 12px;
  background: var(--white);
}

input:disabled {
  cursor: default;
  opacity: 1;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  border-radius: 999px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.status-badge.draft { background: #fff1c2; color: #8a5b00; }
.status-badge.submitted { background: #dfe9ff; color: #1b4fb5; }
.status-badge.approved { background: #dff7e8; color: #156c3d; }
.status-badge.cancelled { background: #ffe3ea; color: #a32e53; }

.btn-group {
  display: flex;
  gap: 12px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-btn);
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.error {
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: var(--radius-input);
  background: rgba(255, 64, 129, 0.08);
  color: var(--primary);
  font-size: 13px;
}
</style>
