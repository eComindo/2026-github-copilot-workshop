<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to list">&#8592;</RouterLink>
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

    <div class="card-panel" v-if="purchaseOrder">
      <p class="form-section-title">PO Header</p>
      <div class="form-row">
        <div class="form-group">
          <label>PO Number</label>
          <input :value="purchaseOrder.poNumber" disabled />
        </div>
        <div class="form-group">
          <label>Vendor Name</label>
          <input :value="purchaseOrder.vendorName" disabled />
        </div>
        <div class="form-group">
          <label>Status</label>
          <span class="status-badge" :class="purchaseOrder.status.toLowerCase()">{{ purchaseOrder.status }}</span>
        </div>
        <div class="form-group">
          <label>Open Lines For GR</label>
          <input :value="String(openLineCount)" disabled />
        </div>
      </div>
    </div>

    <div class="card-panel" v-if="purchaseOrder">
      <p class="form-section-title">PO Lines</p>
      <table>
        <thead>
          <tr>
            <th style="width: 50px">Line</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Open For GR</th>
            <th>UOM</th>
            <th>Unit Price</th>
            <th>Site</th>
            <th>Required Date</th>
            <th>PR Allocation</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in purchaseOrder.lines" :key="line.id">
            <td>{{ line.lineNo }}</td>
            <td>{{ line.itemCode }}</td>
            <td>{{ line.itemName }}</td>
            <td>{{ line.qtyOrdered }}</td>
            <td>{{ line.qtyReceived }}</td>
            <td>{{ line.qtyOpenForGr }}</td>
            <td>{{ line.uom }}</td>
            <td>{{ line.unitPrice }}</td>
            <td>{{ line.siteCode }}</td>
            <td>{{ line.requiredDate || '-' }}</td>
            <td>{{ formatAllocation(line.allocations) }}</td>
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
const openLineCount = ref(0);
const errorMessage = ref('');

function formatAllocation(allocations = []) {
  if (!allocations.length) return '-';
  return allocations.map((allocation) => `${allocation.prNumber} (${allocation.allocatedQty})`).join(', ');
}

async function loadOpenLines() {
  const payload = await api.getPurchaseOrderOpenLines(route.params.id);
  openLineCount.value = (payload.openLines || []).length;
}

async function loadPurchaseOrder() {
  errorMessage.value = '';

  try {
    purchaseOrder.value = await api.getPurchaseOrder(route.params.id);
    await loadOpenLines();
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function submitPurchaseOrder() {
  errorMessage.value = '';

  try {
    purchaseOrder.value = await api.submitPurchaseOrder(route.params.id);
    await loadOpenLines();
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(loadPurchaseOrder);
</script>

<style scoped>
.form-group input:disabled {
  background: var(--white);
  color: var(--text);
  cursor: default;
  opacity: 1;
}
</style>