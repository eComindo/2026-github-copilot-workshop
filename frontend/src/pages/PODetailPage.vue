<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to purchase orders">&#8592;</RouterLink>
        <div>
          <h2>Purchase Order Detail</h2>
          <p class="muted">{{ purchaseOrder?.poNumber || '-' }} &mdash; Purchase Order information detail</p>
        </div>
      </div>
      <button
        v-if="purchaseOrder?.status === 'DRAFT'"
        class="btn btn-primary"
        :disabled="submitting"
        @click="submitPurchaseOrder"
      >
        {{ submitting ? 'Submitting...' : 'Submit PO' }}
      </button>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <div v-if="loading" class="card-panel empty-state">Loading purchase order...</div>

    <template v-else-if="purchaseOrder">
      <div class="card-panel">
        <p class="form-section-title">PO Header</p>
        <div class="form-row">
          <div class="form-group"><label>PO Number</label><input :value="purchaseOrder.poNumber" disabled /></div>
          <div class="form-group"><label>Vendor Name</label><input :value="purchaseOrder.vendorName" disabled /></div>
          <div class="form-group"><label>Status</label><span class="status-badge" :class="purchaseOrder.status.toLowerCase()">{{ purchaseOrder.status }}</span></div>
          <div class="form-group"><label>Created</label><input :value="formatDate(purchaseOrder.createdAt)" disabled /></div>
        </div>
      </div>

      <div class="card-panel">
        <p class="form-section-title">PO Lines</p>
        <div v-if="purchaseOrder.lines.length === 0" class="empty-state">This purchase order has no lines.</div>
        <table v-else>
          <thead><tr>
            <th>Line</th><th>Item Code</th><th>Item Name</th><th>Qty Ordered</th><th>Qty Received</th><th>Open Qty</th><th>UOM</th><th>Unit Price</th><th>Site</th><th>Required Date</th><th>Source PR</th>
          </tr></thead>
          <tbody>
            <tr v-for="line in purchaseOrder.lines" :key="line.id">
              <td>{{ line.lineNo }}</td><td>{{ line.itemCode }}</td><td>{{ line.itemName }}</td>
              <td>{{ line.qtyOrdered }}</td><td>{{ line.qtyReceived }}</td><td>{{ line.qtyOpenForGr }}</td>
              <td>{{ line.uom }}</td><td>{{ formatCurrency(line.unitPrice) }}</td><td>{{ line.siteCode }}</td>
              <td>{{ line.requiredDate || '-' }}</td>
              <td>{{ sourcePrs(line) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="card-panel">
        <div class="section-heading">
          <p class="form-section-title">Open Lines for Goods Receipt</p>
          <span class="muted">{{ openLines.length }} open</span>
        </div>
        <div v-if="openLines.length === 0" class="empty-state">All purchase order lines are fully received.</div>
        <table v-else>
          <thead><tr><th>Line</th><th>Item</th><th>Open Qty</th><th>UOM</th><th>Site</th></tr></thead>
          <tbody><tr v-for="line in openLines" :key="line.id">
            <td>{{ line.lineNo }}</td><td>{{ line.itemName }}</td><td>{{ line.qtyOpenForGr }}</td><td>{{ line.uom }}</td><td>{{ line.siteCode }}</td>
          </tr></tbody>
        </table>
      </div>
    </template>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const purchaseOrder = ref(null);
const openLines = ref([]);
const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref('');

const formatDate = (value) => value ? new Date(value).toLocaleDateString() : '-';
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(Number(value) || 0);
const sourcePrs = (line) => line.allocations?.map((allocation) => `${allocation.prNumber} (${allocation.allocatedQty})`).join(', ') || '-';

async function load() {
  loading.value = true;
  errorMessage.value = '';
  try {
    const [detail, openLinePayload] = await Promise.all([
      api.getPurchaseOrder(route.params.id),
      api.getPurchaseOrderOpenLines(route.params.id),
    ]);
    purchaseOrder.value = detail;
    openLines.value = openLinePayload?.openLines || [];
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load purchase order.';
  } finally {
    loading.value = false;
  }
}

async function submitPurchaseOrder() {
  submitting.value = true;
  errorMessage.value = '';
  try {
    purchaseOrder.value = await api.submitPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message || 'Unable to submit purchase order.';
  } finally {
    submitting.value = false;
  }
}

onMounted(load);
</script>

<style scoped>
.form-group input:disabled { background: var(--white); color: var(--text); cursor: default; opacity: 1; }
.section-heading { display: flex; align-items: center; justify-content: space-between; }
.empty-state { padding: 32px 16px; text-align: center; color: var(--text-muted); }
</style>
