<template>
  <div class="card-panel">
    <div class="card-panel-header">
      <p class="form-section-title" style="margin: 0">PO Line Allocations</p>
      <button
        type="button"
        class="btn btn-outline"
        @click="addAllocation"
        :disabled="!prId"
      >
        + New Allocation
      </button>
    </div>

    <p v-if="!prId" class="muted" style="margin: 12px 0 0 0">
      Select a PR first to add allocations
    </p>

    <table v-if="localAllocations.length > 0">
      <thead>
        <tr>
          <th style="width: 50px">Line</th>
          <th>Item Code</th>
          <th>Item Name</th>
          <th style="width: 90px">Allocate Qty</th>
          <th style="width: 80px">UOM</th>
          <th>Unit Price</th>
          <th style="width: 100px">Total Price</th>
          <th style="width: 60px">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(allocation, index) in localAllocations" :key="index">
          <td>{{ index + 1 }}</td>
          <td>
            <span class="text-muted">{{ allocation.itemCode }}</span>
          </td>
          <td>
            <span class="text-muted">{{ allocation.itemName }}</span>
          </td>
          <td>
            <input
              v-model.number="allocation.allocateQty"
              type="number"
              min="0.01"
              step="0.01"
              placeholder="Type..."
              @blur="() => validateAllocation(index)"
            />
          </td>
          <td>
            <span class="text-muted">{{ allocation.uom }}</span>
          </td>
          <td>
            <input
              v-model.number="allocation.unitPrice"
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
            />
          </td>
          <td class="text-right">
            {{ (allocation.allocateQty * allocation.unitPrice).toFixed(2) }}
          </td>
          <td style="text-align: center">
            <button
              type="button"
              class="btn-danger-icon"
              @click="removeAllocation(index)"
              title="Remove"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.5 1.5h5M2 3.5h12M3.5 3.5l.75 9.5a1.5 1.5 0 0 0 1.5 1.5h4.5a1.5 1.5 0 0 0 1.5-1.5l.75-9.5M6.5 6.5v4.5M9.5 6.5v4.5"
                  stroke="currentColor"
                  stroke-width="1.2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </svg>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div v-if="validationError" class="error" style="margin-top: 12px">
      {{ validationError }}
    </div>
  </div>
</template>

<script setup>
import { watch, reactive, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Array,
    required: true,
  },
  prId: {
    type: [String, Number],
    default: null,
  },
});

const emit = defineEmits(['update:modelValue', 'error']);

const localAllocations = reactive([...props.modelValue]);
const validationError = ref('');

watch(
  localAllocations,
  (newVal) => {
    emit('update:modelValue', [...newVal]);
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal !== localAllocations) {
      Object.assign(localAllocations, newVal);
    }
  }
);

const addAllocation = () => {
  localAllocations.push({
    itemCode: '',
    itemName: '',
    allocateQty: 0,
    uom: '',
    unitPrice: 0,
    prLineId: null,
  });
};

const removeAllocation = (index) => {
  localAllocations.splice(index, 1);
  validationError.value = '';
};

const validateAllocation = (index) => {
  const allocation = localAllocations[index];
  validationError.value = '';

  if (allocation.allocateQty <= 0) {
    validationError.value = 'Allocation quantity must be greater than 0';
    return false;
  }

  // TODO: Validate against PR line remaining qty
  // This will be checked when calling API

  return true;
};
</script>

<style scoped>
.form-section-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text);
}

.card-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.875rem;
}

thead {
  background: var(--table-header);
  border-bottom: 1px solid var(--border);
}

th {
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: var(--text);
}

td {
  padding: 12px;
  border-bottom: 1px solid var(--border);
}

td.text-right {
  text-align: right;
}

.text-muted {
  color: var(--text-muted);
}

input[type='number'] {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

input[type='number']:focus {
  border-color: var(--primary);
}

.btn-danger-icon {
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-muted);
  padding: 4px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.btn-danger-icon:hover {
  color: #d32f2f;
}

.error {
  color: #d32f2f;
  font-size: 0.875rem;
  margin-top: 12px;
}

.muted {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
