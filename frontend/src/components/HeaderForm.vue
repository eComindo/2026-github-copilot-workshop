<template>
  <div class="card-panel">
    <p class="form-section-title">PO Header</p>
    <div class="form-row">
      <div class="form-group">
        <label>Vendor Name</label>
        <select :value="modelValue.vendorId" @input="emit('update:modelValue', { ...modelValue, vendorId: $event.target.value })">
          <option value="">-- Select Vendor --</option>
          <option value="VENDOR001">Vendor A</option>
          <option value="VENDOR002">Vendor B</option>
          <option value="VENDOR003">Vendor C</option>
        </select>
      </div>
      <div class="form-group">
        <label>Site</label>
        <select :value="modelValue.siteCode" @input="emit('update:modelValue', { ...modelValue, siteCode: $event.target.value })">
          <option value="">-- Select Site --</option>
          <option value="SITE01">Site 01</option>
          <option value="SITE02">Site 02</option>
          <option value="SITE03">Site 03</option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Object,
    required: true,
    default: () => ({ vendorId: '', siteCode: '' })
  }
});

const emit = defineEmits(['update:modelValue']);
</script>

<style scoped>
.form-section-title {
  font-size: 14px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: var(--text);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 13px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--text);
}

.form-group select {
  padding: 8px 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-size: 14px;
  font-family: inherit;
  color: var(--text);
  background: var(--white);
}

.form-group select:focus {
  outline: none;
  border-color: var(--primary);
  box-shadow: 0 0 0 2px rgba(255, 64, 129, 0.1);
}
</style>
