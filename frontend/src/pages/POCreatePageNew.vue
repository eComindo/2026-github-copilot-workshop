<template>
  <div class="po-create-page">
    <div class="page-header">
      <div class="page-header-left">
        <button type="button" class="back-btn" aria-label="Go back" @click="goBack">←</button>
        <div><h1>Create Purchase Order</h1><p class="subtitle">Pick approved PR lines and allocate order quantities</p></div>
      </div>
    </div>
    <div v-if="errorMessage" class="error-banner" role="alert">{{ errorMessage }}</div>
    <div v-if="loading" class="loading-banner">Loading approved PR lines...</div>
    <section class="panel panel-header-card"><POHeaderForm v-model="poHeader" /></section>
    <section class="panel panel-lines">
      <div class="panel-topbar"><h2>Approved PR Lines</h2><button type="button" class="refresh-btn" :disabled="loading" @click="loadApprovedPrLines">Refresh Open Lines</button></div>
      <POLineAllocationTable v-model:rows="lineRows" />
    </section>
    <div class="form-footer">
      <div class="selection-meta"><span class="selection-label">Selected Lines</span><span class="selection-count">{{ selectedLineCount }}</span></div>
      <div class="total-meta"><span class="total-label">Estimated Total</span><span class="total-value">{{ formatCurrency(totalAmount) }}</span></div>
      <div class="actions">
        <button type="button" class="btn btn-neutral" :disabled="saving" @click="createPo(false)">{{ saving ? 'Saving...' : 'Save As Draft' }}</button>
        <button type="button" class="btn btn-primary" :disabled="saving" @click="createPo(true)">{{ saving ? 'Submitting...' : 'Submit PO' }}</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import POHeaderForm from '../components/POHeaderForm.vue';
import POLineAllocationTable from '../components/POLineAllocationTable.vue';
import { api } from '../api';

const router = useRouter();
const loading = ref(false);
const saving = ref(false);
const errorMessage = ref('');
const poHeader = ref({ vendor: '', neededByDate: '', currency: 'IDR', paymentTerms: '', notes: '' });
const lineRows = ref([]);
const selectedLineCount = computed(() => lineRows.value.filter((row) => row.selected).length);
const totalAmount = computed(() => lineRows.value.reduce((sum, row) => row.selected ? sum + Number(row.orderQty || 0) * Number(row.unitPrice || 0) : sum, 0));

const loadApprovedPrLines = async () => {
  loading.value = true;
  errorMessage.value = '';
  try {
    const { items = [] } = await api.listRequisitions();
    const approved = items.filter((requisition) => requisition.status === 'APPROVED');
    const details = await Promise.all(approved.map((requisition) => api.getRequisitionOpenLines(requisition.id)));
    lineRows.value = details.flatMap((detail) => (detail.openLines || []).map((line) => ({
      id: line.id,
      prLineId: line.id,
      selected: false,
      prNo: detail.requisition.prNumber,
      line: line.lineNo,
      itemCode: line.itemCode,
      itemName: line.itemName,
      uom: line.uom,
      siteCode: line.siteCode,
      requestedQty: line.qtyRequested,
      allocatedQty: line.qtyAllocated,
      remainingQty: line.qtyOpenForPo,
      orderQty: 0,
      deliveryDate: line.requiredDate || '',
      unitPrice: line.estUnitPrice,
      requiredDate: line.requiredDate,
    })));
  } catch (error) {
    errorMessage.value = error.message || 'Unable to load approved PR lines.';
  } finally { loading.value = false; }
};

const createPo = async (submitAfterCreate) => {
  errorMessage.value = '';
  const selected = lineRows.value.filter((row) => row.selected);
  if (!poHeader.value.vendor.trim()) { errorMessage.value = 'Vendor is required.'; return; }
  if (selected.length === 0) { errorMessage.value = 'Select at least one approved PR line.'; return; }
  const invalid = selected.find((row) => !Number.isFinite(Number(row.orderQty)) || Number(row.orderQty) <= 0 || Number(row.orderQty) > Number(row.remainingQty));
  if (invalid) { errorMessage.value = `Line ${invalid.prNo}-${invalid.line}: order quantity must be greater than 0 and no more than remaining quantity ${invalid.remainingQty}.`; return; }
  saving.value = true;
  try {
    const created = await api.createPurchaseOrder({ vendorName: poHeader.value.vendor, lines: selected.map((row) => ({ prLineId: row.prLineId, itemCode: row.itemCode, itemName: row.itemName, qtyOrdered: Number(row.orderQty), unitPrice: Number(row.unitPrice || 0), uom: row.uom, siteCode: row.siteCode, requiredDate: row.deliveryDate || undefined })) });
    const purchaseOrder = submitAfterCreate ? await api.submitPurchaseOrder(created.id) : created;
    // The PO detail route is not part of the current frontend yet.
    router.push('/purchase-orders');
  } catch (error) { errorMessage.value = error.message || 'Unable to create purchase order.'; }
  finally { saving.value = false; }
};

const formatCurrency = (value) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value) || 0);
const goBack = () => router.back();
onMounted(loadApprovedPrLines);
</script>

<style scoped>
.po-create-page { max-width: 1180px; margin: 0 auto; color: #1d1d1d; }
.page-header { margin-bottom: 22px; }.page-header-left { display: flex; align-items: center; gap: 14px; }
.back-btn { width: 38px; height: 38px; border: none; border-radius: 50%; background: linear-gradient(135deg, #ff6aa7, #ff3d86); color: white; font-size: 1.5rem; cursor: pointer; }
h1 { margin: 0; font-size: 2.1rem; line-height: 1.15; letter-spacing: -.04em; }.subtitle { margin: 6px 0 0; color: #666; font-size: .98rem; }
.panel { background: #f5f5f5; border: 1px solid #e3e3e3; border-radius: 14px; }.panel-header-card { padding: 0; overflow: hidden; }.panel-lines { padding: 0 0 8px; margin-top: 20px; }
.panel-topbar { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px 10px; }.panel-topbar h2 { margin: 0; font-size: 1.05rem; }
.refresh-btn { border: 1px solid #f0659d; background: transparent; color: #f0659d; border-radius: 10px; padding: 8px 14px; font-weight: 600; cursor: pointer; }.refresh-btn:disabled,.btn:disabled { opacity: .55; cursor: not-allowed; }
.error-banner,.loading-banner { margin-bottom: 14px; padding: 12px 16px; border-radius: 10px; }.error-banner { color: #9f1239; background: #ffe4ed; border: 1px solid #f9a8c5; }.loading-banner { color: #555; background: #fff; border: 1px solid #ddd; }
.form-footer { margin-top: 14px; display: flex; align-items: center; justify-content: space-between; gap: 18px; padding: 0 8px; }.selection-meta { display: flex; align-items: center; gap: 10px; min-width: 140px; }.selection-label,.total-label { font-size: .9rem; font-weight: 600; }.selection-count,.total-value { font-size: 2.1rem; font-weight: 700; letter-spacing: -.04em; }.total-meta { margin-left: auto; display: flex; align-items: baseline; gap: 12px; }.actions { display: flex; gap: 12px; }.btn { border: none; border-radius: 10px; padding: 12px 24px; font-size: 1rem; font-weight: 700; cursor: pointer; }.btn-neutral { background: #f4c95d; color: #241d0a; }.btn-primary { background: linear-gradient(135deg, #ff5ca8, #ff2b76); color: white; }
@media (max-width: 820px) { .form-footer { flex-wrap: wrap; }.total-meta { margin-left: 0; }.actions { width: 100%; justify-content: flex-end; } }
</style>
