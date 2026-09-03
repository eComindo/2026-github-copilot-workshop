<template>
  <div class="form-section">
    <h3 class="form-section-title">Purchase Order Details</h3>
    
    <div class="form-group">
      <label for="vendor-name" class="form-label">Vendor Name *</label>
      <input
        id="vendor-name"
        v-model="form.vendorName"
        type="text"
        class="form-input"
        placeholder="Enter vendor name"
        required
      />
      <span v-if="errors.vendorName" class="form-error">
        {{ errors.vendorName }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  vendorName: {
    type: String,
    default: '',
  },
  errors: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['update:vendorName']);

const form = {
  get vendorName() {
    return props.vendorName;
  },
  set vendorName(value) {
    emit('update:vendorName', value);
  },
};
</script>

<style scoped>
.form-section {
  background: var(--color-background-secondary);
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.form-section-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--color-text-primary);
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.form-input {
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--color-border);
  border-radius: 4px;
  background: var(--color-background-primary);
  color: var(--color-text-primary);
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-error {
  font-size: 13px;
  color: var(--color-error);
  margin-top: 4px;
}
</style>
