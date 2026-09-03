<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to purchase orders">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Create a PO from approved PR allocations</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <form @submit.prevent="handleSubmit">
      <PoHeaderForm :form="form" />

      <div class="card-panel">
        <p class="form-section-title">Source Requisition</p>
        <div class="source-grid">
          <div class="form-group">
            <label>Requisition ID</label>
            <input
              v-model="sourceRequisitionId"
              placeholder="Paste requisition id to load open lines"
            />
          </div>
          <div class="source-actions">
            <button type="button" class="btn btn-outline" :disabled="loadingRequisition" @click="loadOpenLines">
              {{ loadingRequisition ? 'Loading...' : 'Load Open Lines' }}
            </button>
          </div>
        </div>
        <p v-if="loadedRequisition" class="muted source-summary">
          Loaded {{ loadedRequisition.prNumber }} ({{ loadedRequisition.status }}) with {{ availablePrLines.length }} open line(s)
        </p>
        <p v-if="!availablePrLines.length && loadedRequisition" class="muted source-summary">No open lines are available for this requisition.</p>
      </div>

      <PoAllocationTable
        :lines="form.lines"
        :available-pr-lines="availablePrLines"
        :remaining-by-pr-line-id="remainingByPrLineId"
        @add-line="addLine"
        @remove-line="removeLine"
        @pr-line-selected="applyPrLineDefaults"
      />

      <div class="btn-group">
        <RouterLink to="/purchase-orders" class="btn btn-outline">Cancel</RouterLink>
        <button type="submit" class="btn btn-outline" @click="submitMode = 'draft'">Save As Draft</button>
        <button type="submit" class="btn btn-primary" @click="submitMode = 'submit'">Save &amp; Submit</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { computed, reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api } from '../api';
import PoAllocationTable from '../components/PoAllocationTable.vue';
import PoHeaderForm from '../components/PoHeaderForm.vue';

const router = useRouter();
const errorMessage = ref('');
const submitMode = ref('draft');
const sourceRequisitionId = ref('');
const loadingRequisition = ref(false);
const loadedRequisition = ref(null);
const availablePrLines = ref([]);

const remainingByPrLineId = computed(() => {
  const map = {};
  for (const line of availablePrLines.value) {
    map[line.id] = Number(line.qtyOpenForPo);
  }
  return map;
});

function emptyLine() {
  return {
    prLineId: '',
    itemCode: '',
    itemName: '',
    qtyOrdered: 1,
    uom: 'PCS',
    unitPrice: 0,
    siteCode: '',
    requiredDate: '',
  };
}

const form = reactive({
  vendorName: '',
  orderDate: '',
  notes: '',
  lines: [emptyLine()],
});

function addLine() {
  form.lines.push(emptyLine());
}

function removeLine(index) {
  if (form.lines.length === 1) {
    return;
  }
  form.lines.splice(index, 1);
}

function applyPrLineDefaults(index) {
  const line = form.lines[index];
  if (!line) {
    return;
  }

  const matched = availablePrLines.value.find((candidate) => candidate.id === line.prLineId);
  if (!matched) {
    return;
  }

  line.itemCode = matched.itemCode;
  line.itemName = matched.itemName;
  line.uom = matched.uom;
  line.siteCode = matched.siteCode;
  line.requiredDate = matched.requiredDate || '';
  line.unitPrice = Number(matched.estUnitPrice || 0);

  const remaining = Number(matched.qtyOpenForPo);
  if (Number(line.qtyOrdered) > remaining) {
    line.qtyOrdered = remaining;
  }
}

async function loadOpenLines() {
  errorMessage.value = '';

  if (!sourceRequisitionId.value.trim()) {
    errorMessage.value = 'Requisition ID is required to load open lines';
    return;
  }

  loadingRequisition.value = true;
  try {
    const payload = await api.getRequisitionOpenLines(sourceRequisitionId.value.trim());
    loadedRequisition.value = payload.requisition;
    availablePrLines.value = (payload.openLines || []).map((line) => ({
      ...line,
      label: `${line.itemCode} - ${line.itemName} (remaining ${line.qtyOpenForPo})`,
    }));

    if (loadedRequisition.value?.status !== 'APPROVED') {
      errorMessage.value = 'Only APPROVED requisition lines should be allocated to purchase orders';
    }
  } catch (error) {
    errorMessage.value = error.message;
    loadedRequisition.value = null;
    availablePrLines.value = [];
  } finally {
    loadingRequisition.value = false;
  }
}

function validateOverAllocation() {
  for (let i = 0; i < form.lines.length; i += 1) {
    const line = form.lines[i];
    const remaining = remainingByPrLineId.value[line.prLineId];
    if (remaining === undefined) {
      continue;
    }

    if (Number(line.qtyOrdered) > Number(remaining)) {
      return `lines[${i}]: allocation qty ${line.qtyOrdered} exceeds remaining ${remaining}`;
    }
  }

  return null;
}

async function handleSubmit() {
  errorMessage.value = '';

  const overAllocationError = validateOverAllocation();
  if (overAllocationError) {
    errorMessage.value = overAllocationError;
    return;
  }

  try {
    const payload = {
      vendorName: form.vendorName.trim(),
      lines: form.lines.map((line) => ({
        prLineId: line.prLineId,
        itemCode: line.itemCode.trim(),
        itemName: line.itemName.trim(),
        qtyOrdered: Number(line.qtyOrdered),
        uom: line.uom.trim(),
        unitPrice: Number(line.unitPrice || 0),
        siteCode: line.siteCode.trim(),
        requiredDate: line.requiredDate || null,
      })),
    };

    const created = await api.createPurchaseOrder(payload);
    if (submitMode.value === 'submit') {
      await api.submitPurchaseOrder(created.id);
    }

    await router.push(`/purchase-orders/${created.id}`);
  } catch (error) {
    errorMessage.value = error.message;
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 24px;
}

.page-header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.page-header h2 {
  margin: 0 0 4px;
  font-size: 24px;
  font-weight: 600;
}

.muted {
  margin: 0;
  color: var(--text-muted);
  font-size: 13px;
}

.form-section-title {
  margin: 0 0 16px;
  font-size: 14px;
  font-weight: 700;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

label {
  font-size: 13px;
  font-weight: 600;
}

input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font: inherit;
  padding: 10px 12px;
  background: var(--white);
}

input:focus {
  outline: none;
  border-color: var(--primary);
}

.source-grid {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) auto;
  gap: 14px;
  align-items: end;
}

.source-actions {
  display: flex;
  gap: 10px;
}

.source-summary {
  margin-top: 12px;
}

.btn-group {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: var(--radius-btn);
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
}

.btn-primary {
  background: var(--primary);
  color: var(--white);
}

.btn-outline {
  background: var(--white);
  border: 1px solid var(--border);
  color: var(--text);
}

.error {
  margin: 0 0 16px;
  padding: 10px 12px;
  border-radius: var(--radius-input);
  background: rgba(255, 64, 129, 0.08);
  color: var(--primary);
  font-size: 13px;
}

@media (max-width: 880px) {
  .source-grid {
    grid-template-columns: 1fr;
  }
}
</style>
