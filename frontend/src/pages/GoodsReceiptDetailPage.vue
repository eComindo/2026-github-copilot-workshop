<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to dashboard">&#8592;</RouterLink>
        <div>
          <h2>Detail Goods Receipt</h2>
          <p class="muted">{{ goodsReceipt?.grNumber || '-' }} &mdash; Goods receipt information detail</p>
        </div>
      </div>
      <div class="btn-group" v-if="goodsReceipt">
        <button class="btn btn-outline" @click="toggleBookmark">
          {{ goodsReceipt.isBookmarked ? 'Remove Bookmark' : 'Bookmark' }}
        </button>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="card-panel" v-if="goodsReceipt">
      <p class="form-section-title">GR Header</p>
      <div class="form-row">
        <div class="form-group">
          <label>Status</label>
          <span class="status-badge" :class="goodsReceipt.status.toLowerCase()">{{ goodsReceipt.status }}</span>
        </div>
        <div class="form-group">
          <label>Receipt Date</label>
          <input :value="goodsReceipt.receiptDate || '-'" disabled />
        </div>
      </div>
      <div class="form-group full">
        <label>Notes</label>
        <textarea :value="goodsReceipt.notes || '-'" rows="3" disabled />
      </div>
    </div>

    <div class="card-panel" v-if="goodsReceipt">
      <p class="form-section-title">GR Lines</p>
      <table>
        <thead>
          <tr>
            <th style="width:50px">Line</th>
            <th>PO Line ID</th>
            <th>QTY Received</th>
            <th>Actual Site</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in goodsReceipt.lines" :key="line.id">
            <td>{{ line.lineNo }}</td>
            <td>{{ line.poLineId }}</td>
            <td>{{ line.qtyReceived }}</td>
            <td>{{ line.actualSiteCode }}</td>
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
const goodsReceipt = ref(null);
const errorMessage = ref('');

async function load() {
  errorMessage.value = '';
  try {
    goodsReceipt.value = await api.getGoodsReceipt(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function toggleBookmark() {
  errorMessage.value = '';
  try {
    if (goodsReceipt.value.isBookmarked) {
      await api.removeBookmark('GR', route.params.id);
      goodsReceipt.value.isBookmarked = false;
      return;
    }

    await api.addBookmark('GR', route.params.id);
    goodsReceipt.value.isBookmarked = true;
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(load);
</script>

<style scoped>
.form-group input:disabled,
.form-group textarea:disabled {
  background: var(--white);
  color: var(--text);
  cursor: default;
  opacity: 1;
}
</style>
