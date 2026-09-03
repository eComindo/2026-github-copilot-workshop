<template>
  <div class="po-line-table">
    <div v-if="tableRows.length === 0" class="empty-state">No approved PR lines are available.</div>
    <div v-else class="table-scroll">
      <table :class="['line-table', { 'lines-table': legacyMode }]">
        <thead><tr>
          <th class="check-col"><input type="checkbox" :checked="allSelected" @change="toggleAll" /></th>
          <th>PR</th><th>Line</th><th>Item Code</th><th>Item Name</th><th>UOM</th><th>Requested Qty</th><th>Allocated Qty</th><th>Remaining Qty</th><th>Order Qty</th><th>Delivery Date</th><th>Unit Price</th><th>Line Amount</th>
        </tr></thead>
        <tbody><tr v-for="(row, index) in tableRows" :key="row.id" class="line-row" data-testid="po-line-row">
          <td class="check-col"><input v-model="row.selected" type="checkbox" data-testid="po-line-select" @change="emitRows" /></td>
          <td>{{ row.prNo || '—' }}</td><td>{{ row.line || row.line_no || '—' }}</td><td>{{ row.itemCode || row.item_code }}</td><td>{{ row.itemName || row.item_name }}</td><td>{{ row.uom }}</td><td>{{ row.requestedQty ?? row.qty_requested ?? '—' }}</td><td>{{ row.allocatedQty ?? row.qty_allocated ?? '—' }}</td><td>{{ row.remainingQty ?? row.openQty ?? '—' }}</td>
          <td><input v-model.number="row.orderQty" type="number" min="0" :max="row.remainingQty || row.openQty" :class="['mini-input', { 'qty-input': legacyMode }]" data-testid="po-order-qty" aria-label="Order quantity" @input="emitRows" @change="validateLineQuantity(index)" /></td>
          <td><input v-model="row.deliveryDate" type="date" class="mini-input date-input" aria-label="Delivery date" @input="emitRows" /></td>
          <td><input v-model.number="row.unitPrice" type="number" min="0" :class="['mini-input', { 'price-input': legacyMode }]" aria-label="Unit price" @input="emitRows" /></td><td>{{ formatCurrency(row.orderQty * row.unitPrice) }}</td>
          <td v-if="legacyMode"><button type="button" class="remove-btn btn-remove" @click="$emit('remove-line', index)">Remove</button></td>
        </tr></tbody>
      </table>
      <div v-if="legacyMode" class="legacy-summary"><span class="summary-stat">Total Lines: {{ tableRows.length }}</span><span class="summary-stat">Total: {{ calculateTotalValue() }}</span></div>
      <div v-if="legacyMode" class="field-error" v-for="(error, index) in lineErrors" :key="index">{{ error }}</div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({ rows: { type: Array, default: undefined }, lines: { type: Array, default: undefined } });
const emit = defineEmits(['update:rows', 'update:lines', 'remove-line', 'validation-change']);
const lineErrors = ref([]);
const legacyMode = computed(() => props.rows === undefined);
const tableRows = computed(() => (props.rows ?? props.lines ?? []).map((source) => ({ ...source, selected: source.selected ?? true, prNo: source.prNo ?? source.pr_number, line: source.line ?? source.line_no, itemCode: source.itemCode ?? source.item_code, itemName: source.itemName ?? source.item_name, requestedQty: source.requestedQty ?? source.qty_requested, allocatedQty: source.allocatedQty ?? source.qty_allocated, remainingQty: source.remainingQty ?? source.openQty ?? ((source.qty_requested || 0) - (source.qty_allocated || 0)), orderQty: source.orderQty ?? source.qtyOrdered ?? 0, unitPrice: source.unitPrice ?? 0 })));
const allSelected = computed(() => tableRows.value.length > 0 && tableRows.value.every((row) => row.selected));
const emitRows = () => { emit('update:rows', tableRows.value); emit('update:lines', tableRows.value); };
const toggleAll = (event) => { tableRows.value.forEach((row) => { row.selected = event.target.checked; }); emit('update:rows', tableRows.value); emit('update:lines', tableRows.value); };
const formatCurrency = (value) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(Number(value) || 0);
const validateAll = () => tableRows.value.every((row) => Number(row.orderQty) > 0 && Number(row.orderQty) <= Number(row.remainingQty));
const validateLineQuantity = (index) => {
  const row = tableRows.value[index];
  if (!row) return;
  const quantity = Number(row.orderQty);
  const remaining = Number(row.remainingQty);
  lineErrors.value[index] = quantity <= 0 ? 'Qty must be greater than 0' : quantity > remaining ? 'Cannot exceed open qty' : '';
  emit('validation-change', validateAll());
};
const getLineErrors = () => lineErrors.value;
const calculateTotalValue = () => tableRows.value.reduce((total, row) => total + Number(row.orderQty || 0) * Number(row.unitPrice || 0), 0).toFixed(2);
defineExpose({ validateAll, validateLineQuantity, getLineErrors, calculateTotalValue });
</script>

<style scoped>
.po-line-table { padding: 0 10px 10px; }.table-scroll { overflow-x: auto; }.line-table { width: 100%; min-width: 1100px; border-collapse: collapse; background: transparent; }.line-table th, .line-table td { padding: 10px 8px; border-bottom: 1px solid #d9d9d9; text-align: left; vertical-align: middle; font-size: .8rem; white-space: nowrap; }.line-table th { background: #f5f5f5; color: #2a2a2a; font-size: .76rem; font-weight: 700; }.line-table tbody tr:last-child td { border-bottom: none; }.check-col { width: 34px; text-align: center !important; }.mini-input { width: 82px; height: 34px; border: 1px solid #d0d0d0; border-radius: 7px; background: rgba(255,255,255,.78); padding: 0 8px; font: inherit; }.date-input { width: 140px; }input[type='checkbox'] { width: 15px; height: 15px; accent-color: #ff4c8b; }.remove-btn { border: 0; color: #c2185b; background: transparent; cursor: pointer; }.empty-state { padding: 36px; text-align: center; color: #777; }
</style>
