<template>
  <section>
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to list">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Allocate approved PR lines to a new Purchase Order</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <form @submit.prevent="handleSubmit">
      <!-- PO Header -->
      <PoHeaderForm v-model="header" />

      <!-- Summary bar -->
      <PoSummary
        :selectedCount="selectedLines.length"
        :estimatedTotal="estimatedTotal"
      />

      <!-- PR Line allocation table -->
      <LineAllocationTable
        :lines="availableLines"
        v-model:selectedLines="selectedLines"
      />

      <!-- Action buttons -->
      <div class="btn-group">
        <RouterLink to="/purchase-orders" class="btn btn-outline">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit">Save As Draft</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref, computed, onMounted } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api } from '../api';
import PoHeaderForm from '../components/PoHeaderForm.vue';
import PoSummary from '../components/PoSummary.vue';
import LineAllocationTable from '../components/LineAllocationTable.vue';

const router = useRouter();
const errorMessage = ref('');
const loading = ref(false);

const header = reactive({
  vendorName: '',
});

const selectedLines = ref([]);
const availableLines = ref([]);

// Fetch open PR lines from all APPROVED requisitions
onMounted(async () => {
  try {
    const { items } = await api.listRequisitions();
    const approved = items.filter((r) => r.status === 'APPROVED');

    const allOpen = [];
    for (const pr of approved) {
      const result = await api.getRequisitionOpenLines(pr.id);
      for (const line of result.openLines) {
        allOpen.push({
          prLineId: line.id,
          prNumber: result.requisition.prNumber,
          lineNo: line.lineNo,
          itemCode: line.itemCode,
          itemName: line.itemName,
          uom: line.uom,
          qtyRequested: line.qtyRequested,
          qtyOpen: line.qtyOpenForPo,
          estUnitPrice: line.estUnitPrice,
          siteCode: line.siteCode,
          requiredDate: line.requiredDate,
        });
      }
    }
    availableLines.value = allOpen;
  } catch (error) {
    errorMessage.value = error.message;
  }
});

const estimatedTotal = computed(() => {
  return selectedLines.value.reduce((sum, s) => {
    return sum + s.allocQty * s.unitPrice;
  }, 0);
});

async function handleSubmit() {
  errorMessage.value = '';

  if (!header.vendorName.trim()) {
    errorMessage.value = 'Vendor name is required.';
    return;
  }
  if (selectedLines.value.length === 0) {
    errorMessage.value = 'Select at least one PR line to allocate.';
    return;
  }

  loading.value = true;
  try {
    const payload = {
      vendorName: header.vendorName,
      lines: selectedLines.value.map((s) => {
        const src = availableLines.value.find((l) => l.prLineId === s.prLineId);
        return {
          prLineId: s.prLineId,
          itemCode: src.itemCode,
          itemName: src.itemName,
          qtyOrdered: s.allocQty,
          uom: src.uom,
          unitPrice: s.unitPrice,
          siteCode: src.siteCode,
          requiredDate: src.requiredDate || null,
        };
      }),
    };
    const created = await api.createPurchaseOrder(payload);
    await router.push(`/purchase-orders/${created.id}`);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    loading.value = false;
  }
}
</script>
