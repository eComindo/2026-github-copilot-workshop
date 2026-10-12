<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to Dashboard">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Create a purchase order from purchase requisition lines</p>
        </div>
      </div>
    </div>

    <form @submit.prevent="saveDraft">
      <PurchaseOrderHeaderForm :form="form" />
      <PurchaseOrderLineAllocationTable
        :lines="form.lines"
        @add-line="addLine"
        @remove-line="removeLine"
      />

      <div class="btn-group">
        <RouterLink class="btn btn-outline" to="/">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit">Save as Draft</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive } from 'vue';
import { RouterLink } from 'vue-router';
import PurchaseOrderHeaderForm from '../components/purchase-orders/PurchaseOrderHeaderForm.vue';
import PurchaseOrderLineAllocationTable from '../components/purchase-orders/PurchaseOrderLineAllocationTable.vue';

let nextLineKey = 2;

const emptyLine = () => ({
  key: nextLineKey++,
  prNumber: '',
  prLineNo: 1,
  itemCode: '',
  itemName: '',
  uom: 'PCS',
  remainingQty: 0,
  qtyAllocated: 0,
  unitPrice: 0,
});

const form = reactive({
  supplierName: '',
  orderDate: '',
  currency: 'IDR',
  expectedDeliveryDate: '',
  notes: '',
  lines: [{
    key: 1,
    prNumber: '',
    prLineNo: 1,
    itemCode: '',
    itemName: '',
    uom: 'PCS',
    remainingQty: 0,
    qtyAllocated: 0,
    unitPrice: 0,
  }],
});

const addLine = () => {
  form.lines.push(emptyLine());
};

const removeLine = (index) => {
  if (form.lines.length > 1) {
    form.lines.splice(index, 1);
  }
};

const saveDraft = () => {
  // API integration is intentionally deferred.
};
</script>
