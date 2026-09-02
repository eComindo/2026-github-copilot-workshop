<template>
  <section>
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to list">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Allocate order quantities from approved PR open lines</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <form @submit.prevent="handleSubmit">
      <!-- PO Header card -->
      <div class="card-panel">
        <p class="form-section-title">PO Header</p>
        <div class="form-row">
          <div class="form-group">
            <label>Vendor Name</label>
            <input v-model="form.vendorName" placeholder="Type..." required />
          </div>
          <div class="form-group">
            <label>Source PR (Approved)</label>
            <select v-model="selectedPrId" @change="loadOpenLines">
              <option value="" disabled>Select a PR...</option>
              <option v-for="pr in approvedRequisitions" :key="pr.id" :value="pr.id">
                {{ pr.prNumber }} &mdash; {{ pr.title }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- PO Lines card -->
      <div class="card-panel" v-if="openLines.length">
        <p class="form-section-title">Select Lines to Allocate</p>
        <table>
          <thead>
            <tr>
              <th style="width:40px"></th>
              <th>Item Code</th>
              <th>Item Name</th>
              <th>Open QTY</th>
              <th style="width:110px">Order QTY</th>
              <th style="width:80px">UOM</th>
              <th>Unit Price</th>
              <th>Site</th>
              <th>Required Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="line in openLines" :key="line.id">
              <td><input type="checkbox" v-model="line.selected" /></td>
              <td>{{ line.itemCode }}</td>
              <td>{{ line.itemName }}</td>
              <td>{{ line.qtyOpenForPo }}</td>
              <td>
                <input
                  v-model.number="line.qtyOrdered"
                  type="number"
                  min="0.01"
                  :max="line.qtyOpenForPo"
                  step="0.01"
                  :disabled="!line.selected"
                />
              </td>
              <td>{{ line.uom }}</td>
              <td>
                <input v-model.number="line.unitPrice" type="number" min="0" step="0.01" :disabled="!line.selected" />
              </td>
              <td>{{ line.siteCode }}</td>
              <td>{{ line.requiredDate || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p v-else-if="selectedPrId" class="muted">No open lines available for this PR.</p>

      <!-- Action buttons -->
      <div class="btn-group">
        <RouterLink to="/purchase-orders" class="btn btn-outline">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit" :disabled="!hasSelectedLines">Save As Draft</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const errorMessage = ref('');

const form = reactive({
  vendorName: '',
});

const approvedRequisitions = ref([]);
const selectedPrId = ref('');
const openLines = ref([]);

const hasSelectedLines = computed(() => openLines.value.some((line) => line.selected));

onMounted(async () => {
  try {
    const payload = await api.listRequisitions();
    approvedRequisitions.value = (payload.items || []).filter((item) => item.status === 'APPROVED');
  } catch (error) {
    errorMessage.value = error.message;
  }
});

async function loadOpenLines() {
  errorMessage.value = '';
  openLines.value = [];
  if (!selectedPrId.value) return;

  try {
    const payload = await api.getRequisitionOpenLines(selectedPrId.value);
    openLines.value = payload.openLines.map((line) => ({
      ...line,
      selected: false,
      qtyOrdered: line.qtyOpenForPo,
      unitPrice: line.estUnitPrice,
    }));
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function handleSubmit() {
  errorMessage.value = '';
  try {
    const lines = openLines.value
      .filter((line) => line.selected)
      .map((line) => ({
        prLineId: line.id,
        itemCode: line.itemCode,
        itemName: line.itemName,
        qtyOrdered: line.qtyOrdered,
        uom: line.uom,
        unitPrice: line.unitPrice,
        siteCode: line.siteCode,
        requiredDate: line.requiredDate || null,
      }));

    const created = await api.createPurchaseOrder({ vendorName: form.vendorName, lines });
    await router.push(`/purchase-orders/${created.id}`);
  } catch (error) {
    errorMessage.value = error.message;
  }
}
</script>

<style scoped>
.card-panel table input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 13px;
}
.card-panel table input:focus {
  border-color: var(--primary);
  outline: none;
}
.form-group select {
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 13px;
}
</style>
