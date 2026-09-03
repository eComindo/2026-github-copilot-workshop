<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to Dashboard">&#8592;</RouterLink>
        <div>
          <h2>Purchase Orders</h2>
          <p class="muted">All purchase order records</p>
        </div>
      </div>
      <RouterLink class="btn btn-outline" to="/purchase-orders/new">+ New PO</RouterLink>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <p v-if="loading" class="muted">Loading purchase orders...</p>

    <div class="card-panel" v-if="!loading && items.length">
      <table>
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><RouterLink :to="`/purchase-orders/${item.id}`">{{ item.poNumber }}</RouterLink></td>
            <td>{{ item.vendorName }}</td>
            <td>
              <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
            </td>
            <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="card-panel" v-if="!loading && !items.length && !errorMessage">
      <p class="muted">No purchase orders yet. Create your first PO from approved requisition lines.</p>
      <RouterLink class="btn btn-outline" to="/purchase-orders/new">+ New PO</RouterLink>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../api';

const items = ref([]);
const errorMessage = ref('');
const loading = ref(false);

onMounted(async () => {
  loading.value = true;
  errorMessage.value = '';

  try {
    const payload = await api.listPurchaseOrders();
    items.value = payload.items || [];
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
});
</script>
