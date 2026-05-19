<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to dashboard">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Create PO header and allocate approved PR lines</p>
        </div>
      </div>
    </div>

    <p v-if="noticeMessage" class="muted">{{ noticeMessage }}</p>

    <form @submit.prevent="handleSaveDraft">
      <PurchaseOrderHeaderForm v-model="headerForm" />
      <PurchaseOrderLineAllocationTable :lines="allocationLines" @update:lines="handleLinesUpdate" />

      <div class="btn-group">
        <RouterLink to="/" class="btn btn-outline">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit">Save As Draft</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import PurchaseOrderHeaderForm from '../components/PurchaseOrderHeaderForm.vue';
import PurchaseOrderLineAllocationTable from '../components/PurchaseOrderLineAllocationTable.vue';

const noticeMessage = ref('');

const headerForm = ref({
  poNumber: '',
  vendorName: '',
  orderDate: '',
  expectedDeliveryDate: '',
  paymentTerms: 'Net 30',
  currency: 'IDR',
  sourcePrNumber: '',
  notes: '',
});

const allocationLines = ref([
  {
    selected: true,
    prNumber: 'PR-001',
    prLineNo: 1,
    itemCode: 'ITEM-001',
    itemName: 'Bearing-6205',
    qtyRemaining: 10,
    qtyAllocate: 10,
    uom: 'PAIR',
    unitPrice: 25,
    siteCode: 'JKT-WH',
    requiredDate: '',
  },
  {
    selected: true,
    prNumber: 'PR-001',
    prLineNo: 2,
    itemCode: 'ITEM-009',
    itemName: 'Grease Temp',
    qtyRemaining: 5,
    qtyAllocate: 5,
    uom: 'TUBE',
    unitPrice: 12,
    siteCode: 'JKT-WH',
    requiredDate: '',
  },
  {
    selected: true,
    prNumber: 'PR-004',
    prLineNo: 1,
    itemCode: 'ITEM-015',
    itemName: 'Bearing-6205',
    qtyRemaining: 20,
    qtyAllocate: 20,
    uom: 'PAIR',
    unitPrice: 25,
    siteCode: 'SBY-WH',
    requiredDate: '',
  },
]);

function handleLinesUpdate(lines) {
  allocationLines.value = lines;
}

function handleSaveDraft() {
  noticeMessage.value = 'Draft PO captured locally. API integration is intentionally not implemented yet.';
}
</script>
