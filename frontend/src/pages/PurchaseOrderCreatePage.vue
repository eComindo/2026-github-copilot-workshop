<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-order" class="back-btn" title="Back to list">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Allocate approved PR lines into a new PO</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="loading" class="muted">Loading approved PR lines...</p>

    <form @submit.prevent="handleSubmit">
      <PoHeaderForm :form="form" />
      <PoLineAllocationTable :lines="form.lines" />

      <div class="card-panel summary-panel">
        <div>
          <p class="form-section-title">Selected Lines</p>
          <span class="summary-value">{{ selectedCount }}</span>
        </div>
        <div class="summary-total">
          <p class="form-section-title">Estimated Total</p>
          <span class="summary-value">{{ formattedEstimatedTotal }}</span>
        </div>
      </div>

      <div class="btn-group">
        <RouterLink to="/purchase-order" class="btn btn-outline">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit" :disabled="submitting">Save As Draft</button>
      </div>
    </form>
  </section>
</template>

<style scoped>
.summary-panel {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.summary-total {
  text-align: right;
}
.summary-value {
  font-size: 24px;
  font-weight: 600;
}
</style>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PoHeaderForm from '../components/PoHeaderForm.vue';
import PoLineAllocationTable from '../components/PoLineAllocationTable.vue';
import { api } from '../api.js';

const router = useRouter();
const loading = ref(false);
const submitting = ref(false);
const errorMessage = ref('');

const form = reactive({
  vendorName: '',
  deliveryAddress: '',
  deliveryDate: '',
  lines: [],
});

const selectedCount = computed(() => form.lines.filter((line) => line.selected).length);

const estimatedTotal = computed(() =>
  form.lines
    .filter((line) => line.selected)
    .reduce((sum, line) => sum + (Number(line.qtyOrdered) || 0) * (Number(line.unitPrice) || 0), 0)
);

const formattedEstimatedTotal = computed(() => estimatedTotal.value.toLocaleString('id-ID'));

onMounted(async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const openLines = await api.getApprovedPrOpenLines();
    form.lines = openLines.map((line) => ({
      prLineId: line.id,
      prNumber: line.prNumber,
      lineNo: line.lineNo,
      itemCode: line.itemCode,
      itemName: line.itemName,
      uom: line.uom,
      siteCode: line.siteCode,
      qtyRequested: line.qtyRequested,
      qtyAllocated: line.qtyAllocated,
      qtyRemaining: line.qtyOpenForPo,
      selected: false,
      qtyOrdered: 0,
      deliveryAddress: '',
      deliveryDate: '',
      unitPrice: line.estUnitPrice,
    }));
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
});

async function handleSubmit() {
  errorMessage.value = '';
  const selectedLines = form.lines.filter((line) => line.selected);

  if (!form.vendorName.trim()) {
    errorMessage.value = 'vendorName is required';
    return;
  }

  if (selectedLines.length === 0) {
    errorMessage.value = 'Select at least one PR line to order';
    return;
  }

  submitting.value = true;
  try {
    const purchaseOrder = await api.createPurchaseOrder({
      vendorName: form.vendorName,
      lines: selectedLines.map((line) => ({
        prLineId: line.prLineId,
        itemCode: line.itemCode,
        itemName: line.itemName,
        qtyOrdered: line.qtyOrdered,
        uom: line.uom,
        unitPrice: line.unitPrice,
        siteCode: line.siteCode,
        requiredDate: line.deliveryDate || form.deliveryDate || null,
      })),
    });
    router.push(`/purchase-order/${purchaseOrder.id}`);
  } catch (error) {
    // Backend returns 422 with a clear message for over-allocation / rule violations
    errorMessage.value = error.message;
  } finally {
    submitting.value = false;
  }
}
</script>
