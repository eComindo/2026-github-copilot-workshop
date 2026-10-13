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

    <p v-if="errorMessage" class="error" data-testid="po-error">{{ errorMessage }}</p>
    <form data-testid="po-create-form" @submit.prevent="saveDraft">
      <PurchaseOrderHeaderForm :form="form" />
      <PurchaseOrderLineAllocationTable
        :lines="form.lines"
        :available-lines="availableLines"
        @add-line="addLine"
        @remove-line="removeLine"
        @select-line="selectLine"
      />

      <div class="btn-group">
        <RouterLink class="btn btn-outline" to="/">Cancel</RouterLink>
        <button
          class="btn btn-primary"
          data-testid="po-save-draft"
          type="submit"
          :disabled="isSaving || isLoadingLines"
        >
          {{ isSaving ? 'Saving...' : 'Save as Draft' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import PurchaseOrderHeaderForm from '../components/purchase-orders/PurchaseOrderHeaderForm.vue';
import PurchaseOrderLineAllocationTable from '../components/purchase-orders/PurchaseOrderLineAllocationTable.vue';
import { api } from '../api';

let nextLineKey = 2;
const router = useRouter();

const emptyLine = () => ({
  key: nextLineKey++,
  prLineId: '',
  prNumber: '',
  prLineNo: null,
  itemCode: '',
  itemName: '',
  uom: 'PCS',
  remainingQty: 0,
  qtyAllocated: 0,
  unitPrice: 0,
  siteCode: '',
  requiredDate: '',
});

const form = reactive({
  supplierName: '',
  orderDate: '',
  currency: 'IDR',
  expectedDeliveryDate: '',
  notes: '',
  lines: [{
    key: 1,
    prLineId: '',
    prNumber: '',
    prLineNo: null,
    itemCode: '',
    itemName: '',
    uom: 'PCS',
    remainingQty: 0,
    qtyAllocated: 0,
    unitPrice: 0,
    siteCode: '',
    requiredDate: '',
  }],
});

const availableLines = ref([]);
const errorMessage = ref('');
const isLoadingLines = ref(false);
const isSaving = ref(false);

const addLine = () => {
  form.lines.push(emptyLine());
};

const removeLine = (index) => {
  if (form.lines.length > 1) {
    form.lines.splice(index, 1);
  }
};

const selectLine = (index, prLineId) => {
  const source = availableLines.value.find((line) => line.id === prLineId);
  if (!source) {
    Object.assign(form.lines[index], emptyLine(), { key: form.lines[index].key });
    return;
  }

  Object.assign(form.lines[index], {
    prLineId: source.id,
    prNumber: source.prNumber,
    prLineNo: source.lineNo,
    itemCode: source.itemCode,
    itemName: source.itemName,
    uom: source.uom,
    remainingQty: source.qtyOpenForPo,
    qtyAllocated: source.qtyOpenForPo,
    unitPrice: source.estUnitPrice,
    siteCode: source.siteCode,
    requiredDate: source.requiredDate || '',
  });
};

const validateLines = () => {
  const selectedLineIds = new Set();

  for (let index = 0; index < form.lines.length; index += 1) {
    const line = form.lines[index];
    const lineLabel = `Line ${index + 1}`;

    if (!line.prLineId) {
      return `${lineLabel}: select an approved PR line`;
    }

    if (selectedLineIds.has(line.prLineId)) {
      return `${lineLabel}: a PR line can only be allocated once`;
    }
    selectedLineIds.add(line.prLineId);

    if (!Number(line.qtyAllocated) || Number(line.qtyAllocated) <= 0) {
      return `${lineLabel}: allocation quantity must be greater than 0`;
    }

    if (Number(line.qtyAllocated) > Number(line.remainingQty)) {
      return `${lineLabel}: allocation quantity cannot exceed the remaining PR quantity (${line.remainingQty})`;
    }
  }

  return '';
};

const loadOpenPrLines = async () => {
  isLoadingLines.value = true;
  errorMessage.value = '';

  try {
    const requisitions = await api.listRequisitions();
    const approvedRequisitions = (requisitions.items || [])
      .filter((requisition) => requisition.status === 'APPROVED');
    const results = await Promise.all(
      approvedRequisitions.map((requisition) => api.getRequisitionOpenLines(requisition.id))
    );

    availableLines.value = results.flatMap((result) =>
      result.openLines.map((line) => ({
        ...line,
        prNumber: result.requisition.prNumber,
      }))
    );
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isLoadingLines.value = false;
  }
};

const saveDraft = async () => {
  errorMessage.value = '';
  const validationError = validateLines();
  if (validationError) {
    errorMessage.value = validationError;
    return;
  }

  isSaving.value = true;
  try {
    const purchaseOrder = await api.createPurchaseOrder({
      vendorName: form.supplierName,
      lines: form.lines.map((line) => ({
        prLineId: line.prLineId,
        itemCode: line.itemCode,
        itemName: line.itemName,
        qtyOrdered: Number(line.qtyAllocated),
        unitPrice: Number(line.unitPrice),
        uom: line.uom,
        siteCode: line.siteCode,
        requiredDate: line.requiredDate || null,
      })),
    });
    await router.push(`/purchase-orders/${purchaseOrder.id}`);
  } catch (error) {
    errorMessage.value = error.message;
  } finally {
    isSaving.value = false;
  }
};

onMounted(loadOpenPrLines);
</script>
