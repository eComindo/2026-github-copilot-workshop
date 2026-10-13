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
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="card-panel">
      <table>
        <thead>
          <tr>
            <th>PO Number</th>
            <th>Vendor</th>
            <th>Status</th>
            <th>Created</th>
            <th>Bookmark</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td>{{ item.poNumber }}</td>
            <td>{{ item.vendorName }}</td>
            <td>
              <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
            </td>
            <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-' }}</td>
            <td>
              <button
                class="btn btn-outline"
                type="button"
                :aria-label="`${item.isBookmarked ? 'Remove bookmark from' : 'Bookmark'} ${item.poNumber}`"
                :disabled="bookmarkingIds.has(item.id)"
                @click="toggleBookmark(item)"
              >
                {{ item.isBookmarked ? 'Bookmarked' : 'Bookmark' }}
              </button>
            </td>
          </tr>
          <tr v-if="items.length === 0">
            <td colspan="5" class="muted">No purchase orders found.</td>
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
const bookmarkingIds = ref(new Set());

async function loadPurchaseOrders() {
  errorMessage.value = '';
  try {
    const payload = await api.listPurchaseOrders();
    items.value = payload.items;
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function toggleBookmark(item) {
  errorMessage.value = '';
  bookmarkingIds.value.add(item.id);
  try {
    const updated = await api.setPurchaseOrderBookmark(item.id, !item.isBookmarked);
    items.value = items.value.map((current) => current.id === updated.id ? updated : current);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    bookmarkingIds.value.delete(item.id);
  }
}

onMounted(loadPurchaseOrders);
</script>
