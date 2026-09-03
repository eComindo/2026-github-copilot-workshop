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

    <div v-if="items.length === 0 && !errorMessage" class="card-panel">
      <p class="muted" style="margin: 0">No purchase orders yet. <RouterLink to="/purchase-orders/new">Create one now</RouterLink></p>
    </div>

    <div v-else class="card-panel">
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
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../api';

const items = ref([]);
const errorMessage = ref('');

onMounted(async () => {
  try {
    const payload = await api.listPurchaseOrders();
    items.value = payload.items;
  } catch (error) {
    errorMessage.value = error.message;
  }
});
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
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
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  color: var(--text);
}

.muted {
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

.card-panel {
  background: var(--white);
  border-radius: var(--radius-card);
  padding: 24px;
  border: 1px solid var(--border);
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
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

.status-badge {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
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

.btn-outline {
  background: var(--white);
  border: 1px solid var(--border);
  color: var(--text);
}

.btn-outline:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.error {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-bottom: 16px;
}
</style>
