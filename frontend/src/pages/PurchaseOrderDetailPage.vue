<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const purchaseOrder = ref(null);
const errorMessage = ref('');
const isSubmitting = ref(false);

const load = async () => {
  errorMessage.value = '';
  try {
    purchaseOrder.value = await api.getPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
};

const submitPurchaseOrder = async () => {
  errorMessage.value = '';
  isSubmitting.value = true;
  try {
    purchaseOrder.value = await api.submitPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSubmitting.value = false;
  }
};

onMounted(load);
</script>

<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to list">&#8592;</RouterLink>
        <div>
          <h2>Purchase Order Detail</h2>
          <p class="muted">{{ purchaseOrder?.poNumber || '-' }} &mdash; Purchase order information detail</p>
        </div>
      </div>
      <div v-if="purchaseOrder?.status === 'DRAFT'" class="btn-group">
        <button
          class="btn btn-primary"
          data-testid="po-submit"
          :disabled="isSubmitting"
          @click="submitPurchaseOrder"
        >
          {{ isSubmitting ? 'Submitting...' : 'Submit PO' }}
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="purchaseOrder" class="card-panel">
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
          <span
            class="status-badge"
            :class="purchaseOrder.status.toLowerCase()"
            data-testid="po-status"
          >{{ purchaseOrder.status }}</span>
        </div>
        <div class="form-group">
          <label>Created</label>
          <input :value="new Date(purchaseOrder.createdAt).toLocaleDateString()" disabled />
        </div>
      </div>
    </div>

    <div v-if="purchaseOrder" class="card-panel">
      <p class="form-section-title">PO Lines</p>
      <table>
        <thead>
          <tr>
            <th>Line</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Ordered</th>
            <th>Received</th>
            <th>Open for GR</th>
            <th>UOM</th>
            <th>Unit Price</th>
            <th>Site</th>
            <th>Required Date</th>
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
            <td>{{ line.qtyOpenForGr }}</td>
            <td>{{ line.uom }}</td>
            <td>{{ line.unitPrice }}</td>
            <td>{{ line.siteCode }}</td>
            <td>{{ line.requiredDate || '-' }}</td>
            <td>
              <div v-for="allocation in line.allocations" :key="allocation.prLineId">
                {{ allocation.prNumber }} ({{ allocation.allocatedQty }})
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped>
.form-group input:disabled {
  background: var(--white);
  color: var(--text);
  cursor: default;
  opacity: 1;
}
</style>
