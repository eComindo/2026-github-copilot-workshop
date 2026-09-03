<template>
  <div class="po-header-form">
    <div class="header-title">PO Header</div>

    <div class="field-grid">
      <label class="field" for="vendor-name">
        <span class="label">Vendor Name *</span>
        <input id="vendor-name" v-model="vendorValue" type="text" placeholder="Enter vendor name" />
        <span v-if="vendorError" class="field-error">{{ vendorError }}</span>
      </label>

      <label class="field">
        <span class="label">Needed By date</span>
        <div class="input-with-icon">
          <input
            v-model="form.neededByDate"
            type="date"
            aria-label="Needed By date"
          />
        </div>
      </label>

      <label class="field">
        <span class="label">Currency</span>
        <input v-model="form.currency" type="text" placeholder="IDR..." />
      </label>

      <label class="field">
        <span class="label">Payment Terms</span>
        <input v-model="form.paymentTerms" type="text" placeholder="Type..." />
      </label>

      <label class="field field-full">
        <span class="label">Notes</span>
        <input v-model="form.notes" type="text" placeholder="Type..." />
      </label>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  modelValue: {
    type: Object,
    default: () => ({
      vendor: '',
      neededByDate: '',
      currency: 'IDR',
      paymentTerms: '',
      notes: '',
    }),
  },
  vendorName: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['update:modelValue', 'update:vendor-name']);
const vendorError = ref(null);

const form = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const vendorValue = computed({
  get: () => props.vendorName || props.modelValue?.vendor || '',
  set: (value) => {
    vendorError.value = null;
    emit('update:modelValue', { ...props.modelValue, vendor: value });
    emit('update:vendor-name', value);
  },
});

const validateVendorName = () => {
  vendorError.value = vendorValue.value.trim() ? null : 'Vendor name is required';
  return !vendorError.value;
};

const isValid = computed(() => Boolean(vendorValue.value.trim()) && !vendorError.value);

defineExpose({ validateVendorName, isValid, vendorName: vendorValue });
</script>

<style scoped>
.po-header-form {
  padding: 16px 18px 18px;
  background: #f5f5f5;
  border-radius: 14px;
}

.header-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: #1d1d1d;
  margin-bottom: 14px;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.field-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px 18px;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.field-full {
  grid-column: 1 / -1;
}

.label {
  font-size: 0.8rem;
  font-weight: 600;
  color: #444;
}

input {
  width: 100%;
  height: 40px;
  border: 1px solid #d3d3d3;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  padding: 0 12px;
  font: inherit;
  color: #1d1d1d;
}

input::placeholder {
  color: #a0a0a0;
}

.field-error {
  color: #c2185b;
  font-size: 0.78rem;
}

.input-with-icon {
  position: relative;
}

.input-with-icon input {
  padding-right: 38px;
}

@media (max-width: 820px) {
  .field-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 560px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
}
</style>
