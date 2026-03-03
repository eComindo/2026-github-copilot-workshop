<template>
  <div class="card-panel">
    <div class="card-panel-header">
      <p class="form-section-title" style="margin:0">Allocate PR Lines</p>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:40px">
            <input type="checkbox" :checked="allSelected" @change="toggleAll" />
          </th>
          <th>PR Number</th>
          <th>Line</th>
          <th>Item Code</th>
          <th>Item Name</th>
          <th>UOM</th>
          <th>QTY Requested</th>
          <th>QTY Open</th>
          <th style="width:120px">Allocate QTY</th>
          <th style="width:120px">Unit Price</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="lines.length === 0">
          <td colspan="10" style="text-align:center" class="muted">No open PR lines available</td>
        </tr>
        <tr v-for="line in lines" :key="line.prLineId">
          <td>
            <input
              type="checkbox"
              :checked="isSelected(line.prLineId)"
              @change="toggleLine(line.prLineId)"
            />
          </td>
          <td>{{ line.prNumber }}</td>
          <td>{{ line.lineNo }}</td>
          <td>{{ line.itemCode }}</td>
          <td>{{ line.itemName }}</td>
          <td>{{ line.uom }}</td>
          <td>{{ line.qtyRequested }}</td>
          <td>{{ line.qtyOpen }}</td>
          <td>
            <input
              type="number"
              :value="getAllocQty(line.prLineId)"
              @input="updateAllocQty(line.prLineId, $event)"
              :disabled="!isSelected(line.prLineId)"
              :max="line.qtyOpen"
              min="0.01"
              step="0.01"
              placeholder="0"
            />
          </td>
          <td>
            <input
              type="number"
              :value="getUnitPrice(line.prLineId)"
              @input="updateUnitPrice(line.prLineId, $event)"
              :disabled="!isSelected(line.prLineId)"
              min="0"
              step="0.01"
              placeholder="0"
            />
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  lines: {
    type: Array,
    default: () => [],
  },
  selectedLines: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:selectedLines']);

const allSelected = computed(() => {
  return props.lines.length > 0 && props.selectedLines.length === props.lines.length;
});

function isSelected(prLineId) {
  return props.selectedLines.some((s) => s.prLineId === prLineId);
}

function getAllocQty(prLineId) {
  const found = props.selectedLines.find((s) => s.prLineId === prLineId);
  return found ? found.allocQty : '';
}

function getUnitPrice(prLineId) {
  const found = props.selectedLines.find((s) => s.prLineId === prLineId);
  return found ? found.unitPrice : '';
}

function toggleLine(prLineId) {
  const exists = props.selectedLines.find((s) => s.prLineId === prLineId);
  if (exists) {
    emit('update:selectedLines', props.selectedLines.filter((s) => s.prLineId !== prLineId));
  } else {
    const line = props.lines.find((l) => l.prLineId === prLineId);
    emit('update:selectedLines', [
      ...props.selectedLines,
      {
        prLineId,
        allocQty: line.qtyOpen,
        unitPrice: line.estUnitPrice || 0,
      },
    ]);
  }
}

function toggleAll() {
  if (allSelected.value) {
    emit('update:selectedLines', []);
  } else {
    emit(
      'update:selectedLines',
      props.lines.map((l) => ({
        prLineId: l.prLineId,
        allocQty: l.qtyOpen,
        unitPrice: l.estUnitPrice || 0,
      })),
    );
  }
}

function updateAllocQty(prLineId, event) {
  const value = parseFloat(event.target.value) || 0;
  emit(
    'update:selectedLines',
    props.selectedLines.map((s) =>
      s.prLineId === prLineId ? { ...s, allocQty: value } : s,
    ),
  );
}

function updateUnitPrice(prLineId, event) {
  const value = parseFloat(event.target.value) || 0;
  emit(
    'update:selectedLines',
    props.selectedLines.map((s) =>
      s.prLineId === prLineId ? { ...s, unitPrice: value } : s,
    ),
  );
}
</script>

<style scoped>
.card-panel table input[type="number"] {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 13px;
}
.card-panel table input[type="number"]:focus {
  border-color: var(--primary);
  outline: none;
}
.card-panel table input[type="number"]:disabled {
  background: var(--bg);
  color: var(--text-muted);
}
</style>
