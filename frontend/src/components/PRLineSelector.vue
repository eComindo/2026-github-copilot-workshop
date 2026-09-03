<template>
  <div class="pr-line-selector">
    <h3>Select Approved PR Lines</h3>

    <div v-if="loading" class="loading-state">
      <span>Loading PR lines...</span>
    </div>

    <div v-else-if="error" class="error-state">
      {{ error }}
    </div>

    <div v-else class="selector-table-wrapper">
      <table v-if="prLines.length > 0" class="selector-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input
                type="checkbox"
                :checked="allSelected"
                :indeterminate="someSelected"
                @change="toggleSelectAll"
                aria-label="Select all PR lines"
              />
            </th>
            <th>PR #</th>
            <th>Line</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Qty Req</th>
            <th>Qty Alloc</th>
            <th>Open Qty</th>
            <th>UOM</th>
            <th>Est Price</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="line in prLines" :key="line.id" class="line-row">
            <td class="checkbox-col">
              <input
                type="checkbox"
                :value="line.id"
                :checked="selectedIds.includes(line.id)"
                @change="toggleLineSelection(line.id)"
                :aria-label="`Select PR line ${line.line_no}`"
              />
            </td>
            <td>{{ line.pr_number }}</td>
            <td class="line-number">{{ line.line_no }}</td>
            <td class="item-code">{{ line.item_code }}</td>
            <td class="item-name">{{ line.item_name }}</td>
            <td class="qty-cell">{{ formatNumber(line.qty_requested) }}</td>
            <td class="qty-cell">{{ formatNumber(line.qty_allocated) }}</td>
            <td class="qty-cell open-qty" :class="{ 'no-open-qty': line.openQty <= 0 }">
              {{ formatNumber(line.openQty) }}
            </td>
            <td>{{ line.uom }}</td>
            <td class="price-cell">${{ formatNumber(line.est_unit_price) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="empty-state">
        <p>No open PR lines available. All requisitions may be fully allocated.</p>
      </div>
    </div>

    <div class="selection-summary">
      <span class="summary-text">
        {{ selectedIds.length }} line{{ selectedIds.length !== 1 ? 's' : '' }} selected
      </span>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  lines: {
    type: Array,
    required: true,
    validator: (arr) => Array.isArray(arr),
  },
  selectedLineIds: {
    type: Array,
    default: () => [],
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: null,
  },
});

const emit = defineEmits(['update:selected-line-ids']);

const selectedIds = ref([...props.selectedLineIds]);

watch(
  () => props.selectedLineIds,
  (newVal) => {
    selectedIds.value = [...newVal];
  }
);

const prLines = computed(() => {
  return props.lines.map((line) => ({
    ...line,
    openQty: (line.qty_requested || 0) - (line.qty_allocated || 0),
  }));
});

const allSelected = computed(() => {
  return (
    prLines.value.length > 0 &&
    selectedIds.value.length === prLines.value.length &&
    prLines.value.every((line) => selectedIds.value.includes(line.id))
  );
});

const someSelected = computed(() => {
  return (
    selectedIds.value.length > 0 && selectedIds.value.length < prLines.value.length
  );
});

const toggleLineSelection = (lineId) => {
  const idx = selectedIds.value.indexOf(lineId);
  if (idx > -1) {
    selectedIds.value.splice(idx, 1);
  } else {
    selectedIds.value.push(lineId);
  }
  emit('update:selected-line-ids', selectedIds.value);
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedIds.value = [];
  } else {
    selectedIds.value = prLines.value.map((line) => line.id);
  }
  emit('update:selected-line-ids', selectedIds.value);
};

const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return parseFloat(num).toFixed(2);
};

defineExpose({
  getSelectedLines: () => prLines.value.filter((line) => selectedIds.value.includes(line.id)),
});
</script>

<style scoped>
.pr-line-selector {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

h3 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #333;
  font-size: 1.1em;
  border-bottom: 2px solid #f0f0f0;
  padding-bottom: 10px;
}

.loading-state,
.error-state {
  padding: 20px;
  text-align: center;
  border-radius: 4px;
}

.loading-state {
  background-color: #f5f5f5;
  color: #666;
  font-size: 1em;
}

.error-state {
  background-color: #ffebee;
  color: #d32f2f;
  border-left: 4px solid #d32f2f;
  text-align: left;
}

.selector-table-wrapper {
  overflow-x: auto;
}

.selector-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.9em;
}

.selector-table thead {
  background-color: #f5f5f5;
  border-bottom: 2px solid #ddd;
}

.selector-table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: #333;
  white-space: nowrap;
}

.checkbox-col {
  width: 40px;
  text-align: center;
}

.selector-table td {
  padding: 10px 8px;
  border-bottom: 1px solid #ddd;
}

.line-row:hover {
  background-color: #fafafa;
}

.line-number,
.item-code {
  font-family: monospace;
  font-size: 0.85em;
  color: #666;
}

.item-name {
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.qty-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.qty-cell.open-qty {
  font-weight: 600;
  color: #2e7d32;
}

.qty-cell.open-qty.no-open-qty {
  color: #d32f2f;
}

.price-cell {
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: #999;
  font-size: 1em;
}

.empty-state p {
  margin: 0;
}

.selection-summary {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid #eee;
  text-align: right;
}

.summary-text {
  font-size: 0.9em;
  color: #666;
  font-weight: 500;
}

input[type='checkbox'] {
  cursor: pointer;
  accent-color: #007bff;
}
</style>
