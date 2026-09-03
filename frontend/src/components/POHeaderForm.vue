<template>
  <div class="card-panel">
    <p class="form-section-title">PO Header</p>

    <div class="form-row">
      <div class="form-group">
        <label>Select PR</label>
        <select v-model="localData.prId" required>
          <option value="">-- Select PR --</option>
          <option v-for="pr in prList" :key="pr.id" :value="pr.id">
            {{ pr.prNumber }} - {{ pr.title }}
          </option>
        </select>
        <span v-if="prListError" class="field-error">{{ prListError }}</span>
      </div>
      <div class="form-group">
        <label>Supplier</label>
        <input
          v-model="localData.supplierName"
          placeholder="Type supplier name..."
          required
          @blur="validateSupplier"
        />
      </div>
      <div class="form-group">
        <label>PO Title</label>
        <input v-model="localData.poTitle" placeholder="Type..." required />
      </div>
      <div class="form-group">
        <label>Delivery Date</label>
        <input v-model="localData.deliveryDate" type="date" required />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group full">
        <label>Delivery Address</label>
        <textarea
          v-model="localData.deliveryAddress"
          placeholder="Type..."
          rows="2"
        />
      </div>
    </div>

    <div class="form-group full">
      <label>Notes</label>
      <textarea v-model="localData.notes" placeholder="Type..." rows="2" />
    </div>
  </div>
</template>

<script setup>
import { watch, reactive, ref, onMounted } from 'vue';
import { api } from '../api';

const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue', 'error']);

const localData = reactive({ ...props.modelValue });

const prList = ref([]);
const prListError = ref('');

onMounted(async () => {
  try {
    const data = await api.listRequisitions();
    prList.value = (data.items || []).filter((pr) => pr.status === 'APPROVED');
  } catch (err) {
    prListError.value = err.message;
    emit('error', err.message);
  }
});

watch(
  localData,
  (newVal) => {
    emit('update:modelValue', newVal);
  },
  { deep: true }
);

watch(
  () => props.modelValue,
  (newVal) => {
    Object.assign(localData, newVal);
  }
);

const validateSupplier = () => {
  if (!localData.supplierName.trim()) {
    emit('error', 'Supplier name is required');
  }
};
</script>

<style scoped>
.form-section-title {
  font-weight: 600;
  font-size: 1rem;
  margin: 0 0 16px 0;
  color: var(--text);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full {
  grid-column: 1 / -1;
}

label {
  font-weight: 500;
  font-size: 0.875rem;
  margin-bottom: 6px;
  color: var(--text);
}

input,
select,
textarea {
  padding: 10px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.2s;
}

input:focus,
select:focus,
textarea:focus {
  border-color: var(--primary);
}

textarea {
  resize: vertical;
}

.field-error {
  color: #d32f2f;
  font-size: 0.8rem;
  margin-top: 4px;
}
</style>
