<template>
  <section>
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to list">&#8592;</RouterLink>
        <div>
          <h2>Detail Purchase Order</h2>
          <p class="muted">{{ po?.poNumber || '-' }} &mdash; Purchase Order information detail</p>
        </div>
      </div>
      <div class="btn-group" v-if="po">
        <button v-if="po.status === 'DRAFT'" class="btn btn-primary" @click="submitPo">Submit PO</button>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <!-- PO Header card -->
    <div class="card-panel" v-if="po">
      <p class="form-section-title">PO Header</p>
      <div class="form-row">
        <div class="form-group">
          <label>Vendor Name</label>
          <input :value="po.vendorName" disabled />
        </div>
        <div class="form-group">
          <label>Status</label>
          <span class="status-badge" :class="po.status.toLowerCase()">{{ po.status }}</span>
        </div>
        <div class="form-group">
          <label>Created</label>
          <input :value="formatDate(po.createdAt)" disabled />
        </div>
      </div>
    </div>

    <!-- PO Lines card -->
    <div class="card-panel" v-if="po">
      <p class="form-section-title">PO Lines</p>
      <table>
        <thead>
          <tr>
            <th style="width:50px">Line</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>QTY Ordered</th>
            <th>QTY Received</th>
            <th>UOM</th>
            <th>Unit Price</th>
            <th>Site</th>
            <th>Source PR</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in po.lines" :key="line.id">
            <td>{{ line.lineNo }}</td>
            <td>{{ line.itemCode }}</td>
            <td>{{ line.itemName }}</td>
            <td>{{ line.qtyOrdered }}</td>
            <td>{{ line.qtyReceived }}</td>
            <td>{{ line.uom }}</td>
            <td>{{ line.unitPrice.toLocaleString() }}</td>
            <td>{{ line.siteCode }}</td>
            <td>
              <span v-for="(alloc, idx) in line.allocations" :key="alloc.prLineId">
                {{ alloc.prNumber }} ({{ alloc.allocatedQty }})
                <span v-if="idx < line.allocations.length - 1">, </span>
              </span>
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
const po = ref(null);
const errorMessage = ref('');

function formatDate(iso) {
  if (!iso) return '-';
  return new Date(iso).toLocaleDateString('en-GB');
}

async function load() {
  errorMessage.value = '';
  try {
    po.value = await api.getPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function submitPo() {
  errorMessage.value = '';
  try {
    po.value = await api.submitPurchaseOrder(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(load);
</script>

<style scoped>
.form-group input:disabled {
  background: var(--white);
  color: var(--text);
  cursor: default;
  opacity: 1;
}
</style>
