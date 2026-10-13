<template>
  <div class="card-panel">
    <div class="card-panel-header">
      <p class="form-section-title">Line Allocation</p>
      <button class="btn btn-outline" type="button" @click="$emit('add-line')">+ Add PR Line</button>
    </div>

    <div class="table-scroll">
      <table>
        <thead>
          <tr>
            <th style="width: 50px">Line</th>
            <th>PR Number</th>
            <th>PR Line</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>UOM</th>
            <th>Remaining Qty</th>
            <th style="width: 120px">Allocate Qty</th>
            <th style="width: 150px">Unit Price</th>
            <th style="width: 60px">Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, index) in lines" :key="line.key">
            <td>{{ index + 1 }}</td>
            <td>
              <select
                :value="line.prLineId"
                :data-testid="`po-pr-line-${index}`"
                required
                @change="$emit('select-line', index, $event.target.value)"
              >
                <option value="">Select PR line</option>
                <option v-for="source in availableLines" :key="source.id" :value="source.id">
                  {{ source.prNumber }} / Line {{ source.lineNo }}
                </option>
              </select>
            </td>
            <td>{{ line.prLineNo || '-' }}</td>
            <td><input :value="line.itemCode" placeholder="Type..." readonly /></td>
            <td><input :value="line.itemName" placeholder="Type..." readonly /></td>
            <td><input :value="line.uom" placeholder="PCS" readonly /></td>
            <td :data-testid="`po-remaining-qty-${index}`">{{ line.remainingQty }}</td>
            <td>
              <input
                v-model.number="line.qtyAllocated"
                :data-testid="`po-allocate-qty-${index}`"
                type="number"
                min="0"
                :max="line.remainingQty"
                step="0.01"
              />
            </td>
            <td><input v-model.number="line.unitPrice" type="number" min="0" step="0.01" /></td>
            <td class="action-cell">
              <button
                class="btn-danger-icon"
                type="button"
                title="Remove line"
                aria-label="Remove line"
                :disabled="lines.length === 1"
                @click="$emit('remove-line', index)"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M5.5 1.5h5M2 3.5h12M3.5 3.5l.75 9.5a1.5 1.5 0 0 0 1.5 1.5h4.5a1.5 1.5 0 0 0 1.5-1.5l.75-9.5M6.5 6.5v4.5M9.5 6.5v4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
defineProps({
  lines: {
    type: Array,
    required: true,
  },
  availableLines: {
    type: Array,
    default: () => [],
  },
});

defineEmits(['add-line', 'remove-line', 'select-line']);
</script>

<style scoped>
.form-section-title {
  margin: 0;
}

.table-scroll {
  overflow-x: auto;
}

table {
  min-width: 1080px;
}

table input,
table select {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 13px;
}

table input:focus,
table select:focus {
  border-color: var(--primary);
  outline: none;
}

.action-cell {
  text-align: center;
}

.btn-danger-icon:disabled {
  cursor: not-allowed;
  opacity: 0.4;
}
</style>
