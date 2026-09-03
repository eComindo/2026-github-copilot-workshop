<template>
  <div class="card-panel">
    <div class="line-header">
      <p class="form-section-title">PO Lines</p>
      <button class="btn btn-primary btn-small" @click="emit('add-line')">+ Add Line</button>
    </div>

    <table v-if="lines.length > 0">
      <thead>
        <tr>
          <th style="width: 50px">Line</th>
          <th>Item Code</th>
          <th>Item Name</th>
          <th>QTY</th>
          <th>UOM</th>
          <th>Unit Price</th>
          <th>Amount</th>
          <th>From PR</th>
          <th style="width: 40px"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(line, idx) in lines" :key="idx">
          <td>{{ idx + 1 }}</td>
          <td><input v-model="line.itemCode" placeholder="e.g., ITEM001" /></td>
          <td><input v-model="line.itemName" placeholder="e.g., Widget A" /></td>
          <td><input v-model.number="line.qty" type="number" placeholder="0" /></td>
          <td><input v-model="line.uom" placeholder="e.g., EA" /></td>
          <td><input v-model.number="line.unitPrice" type="number" placeholder="0.00" /></td>
          <td class="amount">{{ (line.qty || 0) * (line.unitPrice || 0) }}</td>
          <td><input v-model="line.fromPr" placeholder="PR number" /></td>
          <td>
            <button class="btn-delete" @click="emit('remove-line', idx)" title="Delete line">✕</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-else class="empty-state">
      <p>No lines added yet. Click "Add Line" to start.</p>
    </div>
  </div>
</template>

<script setup>
defineProps({
  lines: {
    type: Array,
    required: true,
    default: () => []
  }
});

const emit = defineEmits(['add-line', 'remove-line']);
</script>

<style scoped>
.card-panel {
  background: var(--white);
  border: 1px solid var(--border);
  border-radius: var(--radius-card);
  padding: 20px;
}

.line-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.form-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0;
  color: var(--text);
}

.btn-small {
  padding: 6px 12px;
  font-size: 13px;
  height: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

thead {
  background: var(--table-header);
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}

td {
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  vertical-align: middle;
}

td input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid var(--border);
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  color: var(--text);
}

td input:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(255, 64, 129, 0.1);
}

.amount {
  text-align: right;
  font-weight: 600;
  color: var(--primary);
}

.btn-delete {
  background: none;
  border: none;
  color: #c62828;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.15s;
}

.btn-delete:hover {
  color: #b71c1c;
}

.empty-state {
  text-align: center;
  padding: 32px;
  color: var(--text-muted);
  font-size: 14px;
}
</style>
