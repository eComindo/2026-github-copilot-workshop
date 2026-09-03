<template>
  <div v-if="selectedLines.length > 0" class="allocation-section">
    <h3 class="section-title">Allocate Quantities</h3>

    <div class="allocation-list">
      <div
        v-for="(line, index) in selectedLines"
        :key="line.id"
        class="allocation-card"
      >
        <div class="card-header">
          <div class="line-info">
            <span class="line-label">{{ line.itemCode }}</span>
            <span class="line-name">{{ line.itemName }}</span>
          </div>
          <button
            class="btn-remove"
            @click="removeLine(index)"
            title="Remove this line"
          >
            ✕
          </button>
        </div>

        <div class="card-body">
          <div class="form-grid">
            <div class="form-group">
              <label class="form-label">Qty Remaining</label>
              <div class="readonly-value">{{ line.qtyRemaining }}</div>
              <span class="form-hint">
                {{ line.qtyRequested }} requested − {{ line.qtyAllocated }}
                allocated
              </span>
            </div>

            <div class="form-group">
              <label for="qty-ordered-input" class="form-label">
                Qty Ordered *
              </label>
              <input
                :id="`qty-ordered-${line.id}`"
                v-model.number="line.qtyOrdered"
                type="number"
                class="form-input"
                :class="{ 'input-error': getError(index, 'qtyOrdered') }"
                min="0.01"
                step="0.01"
                placeholder="0.00"
                @input="validateQtyOrdered(index, line)"
              />
              <span v-if="getError(index, 'qtyOrdered')" class="form-error">
                {{ getError(index, 'qtyOrdered') }}
              </span>
            </div>

            <div class="form-group">
              <label for="unit-price-input" class="form-label">
                Unit Price *
              </label>
              <input
                :id="`unit-price-${line.id}`"
                v-model.number="line.unitPrice"
                type="number"
                class="form-input"
                :class="{ 'input-error': getError(index, 'unitPrice') }"
                min="0"
                step="0.01"
                placeholder="0.00"
              />
              <span v-if="getError(index, 'unitPrice')" class="form-error">
                {{ getError(index, 'unitPrice') }}
              </span>
            </div>

            <div class="form-group">
              <label for="required-date-input" class="form-label">
                Required Date
              </label>
              <input
                :id="`required-date-${line.id}`"
                v-model="line.requiredDate"
                type="date"
                class="form-input"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  selectedLines: {
    type: Array,
    default: () => [],
  },
  errors: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(['update:selectedLines', 'remove-line']);

const removeLine = (index) => {
  const updated = props.selectedLines.filter((_, i) => i !== index);
  emit('update:selectedLines', updated);
  emit('remove-line', index);
};

const validateQtyOrdered = (index, line) => {
  // Client-side validation: qty must not exceed remaining
  if (line.qtyOrdered > line.qtyRemaining) {
    // Validation error will be shown via getError()
  }
};

const getError = (index, field) => {
  const lineErrors = props.errors[index];
  return lineErrors ? lineErrors[field] : null;
};
</script>

<style scoped>
.allocation-section {
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

.allocation-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.allocation-card {
  background: var(--color-background-primary);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 16px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.allocation-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.line-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.line-label {
  font-weight: 600;
  font-size: 13px;
  color: var(--color-primary);
  font-family: monospace;
  text-transform: uppercase;
}

.line-name {
  font-size: 14px;
  color: var(--color-text-primary);
}

.btn-remove {
  background: transparent;
  border: none;
  color: var(--color-text-secondary);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 13px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-input {
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-secondary);
  color: var(--color-text-primary);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.input-error {
  border-color: var(--color-error);
  background: rgba(239, 68, 68, 0.05);
}

.readonly-value {
  padding: 8px 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--color-primary);
  background: rgba(34, 197, 94, 0.05);
  border-radius: 4px;
  border: 1px solid var(--color-border);
}

.form-hint {
  font-size: 12px;
  color: var(--color-text-secondary);
  margin-top: 2px;
}

.form-error {
  font-size: 12px;
  color: var(--color-error);
  margin-top: 2px;
}
</style>
