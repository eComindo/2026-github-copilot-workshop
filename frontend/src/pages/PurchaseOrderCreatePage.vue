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

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p v-if="noticeMessage" class="muted">{{ noticeMessage }}</p>

    <form @submit.prevent="handleSaveDraft">
      <PurchaseOrderHeaderForm v-model="headerForm" />

      <div class="btn-group" style="margin-top: -8px; margin-bottom: 12px">
        <button
          class="btn btn-outline"
          type="button"
          :disabled="isLoadingLines || isSaving"
          @click="loadApprovedOpenLines"
        >
          {{ isLoadingLines ? 'Loading PR lines...' : 'Load Approved PR Open Lines' }}
        </button>
      </div>

      <PurchaseOrderLineAllocationTable :lines="allocationLines" @update:lines="handleLinesUpdate" />

      <div class="btn-group">
        <RouterLink to="/" class="btn btn-outline">Cancel</RouterLink>
        <button class="btn btn-outline" type="button" :disabled="isSaving" @click="handleSaveAndSubmit">{{ isSaving ? 'Saving...' : 'Save And Submit' }}</button>
        <button class="btn btn-primary" type="submit" :disabled="isSaving">{{ isSaving ? 'Saving...' : 'Save As Draft' }}</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { ref } from 'vue';
import { RouterLink } from 'vue-router';
import PurchaseOrderHeaderForm from '../components/PurchaseOrderHeaderForm.vue';
import PurchaseOrderLineAllocationTable from '../components/PurchaseOrderLineAllocationTable.vue';
import { api } from '../api';

const errorMessage = ref('');
const noticeMessage = ref('');
const isLoadingLines = ref(false);
const isSaving = ref(false);

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

const allocationLines = ref([]);

function handleLinesUpdate(lines) {
  allocationLines.value = lines;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

async function loadApprovedOpenLines() {
  errorMessage.value = '';
  noticeMessage.value = '';

  const sourcePrNumber = headerForm.value.sourcePrNumber?.trim();
  if (!sourcePrNumber) {
    errorMessage.value = 'Source PR Number is required to load open lines';
    return;
  }

  isLoadingLines.value = true;
  try {
    const requisitionsPayload = await api.listRequisitions();
    const approvedRequisition = (requisitionsPayload.items || []).find(
      (item) => item.prNumber === sourcePrNumber && item.status === 'APPROVED'
    );

    if (!approvedRequisition) {
      const notFoundError = new Error(`Approved requisition ${sourcePrNumber} was not found`);
      notFoundError.statusCode = 422;
      throw notFoundError;
    }

    const openLinesPayload = await api.getRequisitionOpenLines(approvedRequisition.id);
    allocationLines.value = (openLinesPayload.openLines || []).map((line) => ({
      selected: true,
      prLineId: line.id,
      prNumber: sourcePrNumber,
      prLineNo: line.lineNo,
      itemCode: line.itemCode,
      itemName: line.itemName,
      qtyRemaining: line.qtyOpenForPo,
      qtyAllocate: line.qtyOpenForPo,
      uom: line.uom,
      unitPrice: line.estUnitPrice,
      siteCode: line.siteCode,
      requiredDate: line.requiredDate || '',
    }));

    noticeMessage.value = `Loaded ${allocationLines.value.length} open line(s) from ${sourcePrNumber}`;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoadingLines.value = false;
  }
}

function buildCreatePayload() {
  const selectedLines = allocationLines.value.filter((line) => line.selected);
  if (selectedLines.length === 0) {
    const error = new Error('Select at least one PR line for allocation');
    error.statusCode = 422;
    throw error;
  }

  const lines = selectedLines.map((line, index) => {
    const qtyAllocate = toNumber(line.qtyAllocate);
    const qtyRemaining = toNumber(line.qtyRemaining);

    if (!line.prLineId) {
      throw new Error(`lines[${index}]: missing PR line reference; load from approved PR first`);
    }

    if (qtyAllocate <= 0) {
      throw new Error(`lines[${index}]: allocation quantity must be greater than 0`);
    }

    if (qtyAllocate > qtyRemaining) {
      throw new Error(`lines[${index}]: allocation qty ${qtyAllocate} exceeds remaining ${qtyRemaining}`);
    }

    return {
      prLineId: line.prLineId,
      itemCode: line.itemCode,
      itemName: line.itemName,
      qtyOrdered: qtyAllocate,
      uom: line.uom,
      unitPrice: toNumber(line.unitPrice),
      siteCode: line.siteCode,
      requiredDate: line.requiredDate || null,
    };
  });

  return {
    vendorName: headerForm.value.vendorName,
    lines,
  };
}

async function savePurchaseOrder(submitAfterCreate) {
  errorMessage.value = '';
  noticeMessage.value = '';
  isSaving.value = true;

  try {
    const createPayload = buildCreatePayload();
    const created = await api.createPurchaseOrder(createPayload);

    const purchaseOrder = submitAfterCreate
      ? await api.submitPurchaseOrder(created.id)
      : await api.getPurchaseOrder(created.id);

    const openLinesPayload = await api.getPurchaseOrderOpenLines(created.id);
    const openLineCount = (openLinesPayload.openLines || []).length;

    headerForm.value = {
      ...headerForm.value,
      poNumber: purchaseOrder.poNumber,
    };

    noticeMessage.value = submitAfterCreate
      ? `PO ${purchaseOrder.poNumber} submitted successfully. ${openLineCount} open line(s) available for GR.`
      : `PO ${purchaseOrder.poNumber} saved as DRAFT. ${openLineCount} open line(s) available for GR.`;
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSaving.value = false;
  }
}

function handleSaveDraft() {
  return savePurchaseOrder(false);
}

function handleSaveAndSubmit() {
  return savePurchaseOrder(true);
}
</script>
