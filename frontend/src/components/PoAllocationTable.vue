<template>
  <div class="card-panel">
    <div class="card-panel-header">
      <p class="form-section-title">Line Allocation</p>
      <button type="button" class="btn btn-outline" @click="addLine">+ New Line</button>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Line</th>
            <th>PR Line ID</th>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Qty Ordered</th>
            <th>UOM</th>
            <th>Unit Price</th>
            <th>Site</th>
            <th>Required Date</th>
            <th>Remaining Qty</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, index) in lines" :key="index">
            <td>{{ index + 1 }}</td>
            <td>
              <input
                v-model="line.prLineId"
                list="pr-line-options"
                placeholder="uuid"
                @change="onPrLineSelected(index)"
                required
              />
            </td>
            <td><input v-model="line.itemCode" placeholder="BRG-001" required /></td>
            <td><input v-model="line.itemName" placeholder="Bearing" required /></td>
            <td><input v-model.number="line.qtyOrdered" type="number" min="1" step="1" required /></td>
            <td><input v-model="line.uom" placeholder="PCS" required /></td>
            <td><input v-model.number="line.unitPrice" type="number" min="0" step="0.01" /></td>
            <td><input v-model="line.siteCode" placeholder="JKT-PLANT" required /></td>
            <td><input v-model="line.requiredDate" type="date" /></td>
            <td>
              <span :class="['remaining-badge', remainingForLine(line) <= 0 ? 'is-empty' : '']">
                {{ formatRemaining(remainingForLine(line)) }}
              </span>
              <p v-if="line.qtyOrdered > remainingForLine(line) && remainingForLine(line) > 0" class="inline-error">
                Over allocation
              </p>
            </td>
            <td>
              <button type="button" class="btn-danger-icon" @click="removeLine(index)" title="Remove line">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5.5 1.5h5M2 3.5h12M3.5 3.5l.75 9.5a1.5 1.5 0 0 0 1.5 1.5h4.5a1.5 1.5 0 0 0 1.5-1.5l.75-9.5M6.5 6.5v4.5M9.5 6.5v4.5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </td>
          </tr>
        </tbody>
      </table>
      <datalist id="pr-line-options">
        <option
          v-for="line in availablePrLines"
          :key="line.id"
          :value="line.id"
        >
          {{ line.label }}
        </option>
      </datalist>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  lines: {
    type: Array,
    required: true,
  },
  availablePrLines: {
    type: Array,
    default: () => [],
  },
  remainingByPrLineId: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['add-line', 'remove-line', 'pr-line-selected']);

function addLine() {
  emit('add-line');
}

function removeLine(index) {
  emit('remove-line', index);
}

function remainingForLine(line) {
  const remaining = props.remainingByPrLineId[line.prLineId];
  if (remaining === undefined || remaining === null) {
    return 0;
  }

  return Number(remaining);
}

function onPrLineSelected(index) {
  emit('pr-line-selected', index);
}

function formatRemaining(value) {
  return Number.isFinite(value) ? value : 0;
}
</script>

<style scoped>
.form-section-title {
  margin: 0;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.card-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  min-width: 760px;
}

th,
td {
  border-bottom: 1px solid var(--border);
  padding: 10px;
  text-align: left;
  vertical-align: middle;
  font-size: 13px;
}

th {
  background: var(--table-header);
  font-weight: 700;
}

input {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font: inherit;
  padding: 8px 10px;
}

input:focus {
  outline: none;
  border-color: var(--primary);
}

.remaining-badge {
  display: inline-flex;
  align-items: center;
  min-width: 40px;
  border-radius: 999px;
  padding: 4px 10px;
  background: rgba(21, 108, 61, 0.14);
  color: #156c3d;
  font-size: 12px;
  font-weight: 700;
}

.remaining-badge.is-empty {
  background: rgba(255, 64, 129, 0.1);
  color: var(--primary);
}

.inline-error {
  margin: 6px 0 0;
  color: var(--primary);
  font-size: 12px;
  font-weight: 600;
}

.btn-danger-icon {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 64, 129, 0.10);
  border: 1px solid var(--primary);
  color: var(--primary);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: none;
  border-radius: var(--radius-btn);
  padding: 10px 24px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  background: var(--white);
  color: var(--text);
  border: 1px solid var(--border);
}
</style>
