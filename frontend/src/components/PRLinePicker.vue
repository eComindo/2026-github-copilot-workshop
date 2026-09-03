<template>
  <div class="pr-picker-section">
    <h3 class="section-title">Select PR Lines to Allocate</h3>

    <div v-if="loading" class="loading-state">
      Loading approved PR lines...
    </div>

    <div v-else-if="error" class="error-state">
      <p class="error-message">{{ error }}</p>
      <button class="btn btn-outline btn-sm" @click="retryLoad">Retry</button>
    </div>

    <div v-else-if="availableLines.length === 0" class="empty-state">
      <p>No approved PR lines available for allocation.</p>
    </div>

    <div v-else class="table-container">
      <table class="picker-table">
        <thead>
          <tr>
            <th class="checkbox-col">
              <input
                type="checkbox"
                :checked="allSelected"
                @change="toggleSelectAll"
                @click.stop
              />
            </th>
            <th>PR Number</th>
            <th>Line #</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th class="number-col">Qty Requested</th>
            <th class="number-col">Qty Allocated</th>
            <th class="number-col">Qty Remaining</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="line in availableLines"
            :key="line.id"
            :class="{ 'row-selected': isSelected(line.id) }"
          >
            <td class="checkbox-col">
              <input
                type="checkbox"
                :checked="isSelected(line.id)"
                @change="toggleLine(line.id)"
                @click.stop
              />
            </td>
            <td class="pr-number">{{ line.prNumber }}</td>
            <td class="line-no">{{ line.lineNo }}</td>
            <td class="item-code">{{ line.itemCode }}</td>
            <td class="item-name">{{ line.itemName }}</td>
            <td class="number-col">{{ line.qtyRequested }}</td>
            <td class="number-col">{{ line.qtyAllocated }}</td>
            <td class="number-col qty-remaining">
              {{ line.qtyRemaining }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  prLines: {
    type: Array,
    default: () => [],
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
    default: '',
  },
});

const emit = defineEmits(['update:selectedLineIds', 'retry']);

const selectedLines = ref(props.selectedLineIds);

const availableLines = computed(() => {
  return props.prLines.map((line) => ({
    ...line,
    qtyRemaining: (line.qtyRequested || 0) - (line.qtyAllocated || 0),
  }));
});

const allSelected = computed(() => {
  return (
    selectedLines.value.length > 0 &&
    selectedLines.value.length === availableLines.value.length
  );
});

const isSelected = (lineId) => selectedLines.value.includes(lineId);

const toggleLine = (lineId) => {
  if (isSelected(lineId)) {
    selectedLines.value = selectedLines.value.filter((id) => id !== lineId);
  } else {
    selectedLines.value = [...selectedLines.value, lineId];
  }
  emit('update:selectedLineIds', selectedLines.value);
};

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedLines.value = [];
  } else {
    selectedLines.value = availableLines.value.map((line) => line.id);
  }
  emit('update:selectedLineIds', selectedLines.value);
};

const retryLoad = () => {
  emit('retry');
};
</script>

<style scoped>
.pr-picker-section {
  background: var(--color-background-secondary);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.loading-state,
.empty-state {
  padding: 40px 20px;
  text-align: center;
  color: var(--color-text-secondary);
  font-size: 14px;
}

.error-state {
  padding: 16px;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-error);
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
}

.error-message {
  color: var(--color-error);
  font-size: 14px;
  margin: 0;
}

.table-container {
  overflow-x: auto;
}

.picker-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.picker-table thead {
  background: var(--color-background-primary);
  border-bottom: 2px solid var(--color-border);
}

.picker-table th {
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
}

.picker-table td {
  padding: 12px 8px;
  border-bottom: 1px solid var(--color-border);
  color: var(--color-text-primary);
}

.checkbox-col {
  width: 40px;
  text-align: center;
  padding: 12px 4px;
}

.checkbox-col input {
  cursor: pointer;
}

.number-col {
  text-align: right;
  width: 120px;
}

.qty-remaining {
  font-weight: 600;
  background: rgba(34, 197, 94, 0.05);
}

.pr-number,
.line-no {
  font-family: monospace;
  font-size: 13px;
  color: var(--color-text-secondary);
}

.item-code {
  font-weight: 500;
  color: var(--color-primary);
}

.row-selected {
  background: rgba(59, 130, 246, 0.05);
}

.btn {
  padding: 8px 16px;
  font-size: 14px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline {
  border: 1px solid var(--color-border);
  background: var(--color-background-primary);
  color: var(--color-text-primary);
}

.btn-outline:hover {
  background: var(--color-background-secondary);
  border-color: var(--color-primary);
}

.btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}
</style>
