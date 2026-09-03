<template>
  <div class="card-panel">
    <p class="form-section-title">PO Header</p>

    <div class="form-grid">
      <div class="form-group">
        <label>Vendor</label>
        <input v-model="form.vendorName" placeholder="PT Supplier Jaya" required />
      </div>

      <div class="form-group">
        <label>Order Date</label>
        <input v-model="form.orderDate" type="date" />
      </div>

      <div class="form-group form-group-wide">
        <label>Notes</label>
        <textarea v-model="form.notes" rows="3" placeholder="Optional notes" />
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  form: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
.form-section-title {
  margin: 0 0 18px;
  font-size: 14px;
  font-weight: 700;
  color: var(--text);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(220px, 1fr));
  gap: 18px 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-group-wide {
  grid-column: 1 / -1;
}

label {
  font-size: 13px;
  font-weight: 600;
  color: var(--text);
}

input,
textarea {
  width: 100%;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font: inherit;
  padding: 10px 12px;
  background: var(--white);
}

input:focus,
textarea:focus {
  outline: none;
  border-color: var(--primary);
}

textarea {
  resize: vertical;
  min-height: 88px;
}
</style>
