<template>
  <div class="card-panel">
    <p class="form-section-title">PO Header</p>
    <div class="form-row">
      <div class="form-group">
        <label>PO Number</label>
        <input :value="modelValue.poNumber" @input="updateField('poNumber', $event.target.value)" placeholder="Auto / draft" />
      </div>
      <div class="form-group">
        <label>Vendor Name</label>
        <input :value="modelValue.vendorName" @input="updateField('vendorName', $event.target.value)" placeholder="Type..." required />
      </div>
      <div class="form-group">
        <label>Order Date</label>
        <input :value="modelValue.orderDate" @input="updateField('orderDate', $event.target.value)" type="date" />
      </div>
      <div class="form-group">
        <label>Expected Delivery</label>
        <input :value="modelValue.expectedDeliveryDate" @input="updateField('expectedDeliveryDate', $event.target.value)" type="date" />
      </div>
    </div>

    <div class="form-row">
      <div class="form-group">
        <label>Payment Terms</label>
        <input :value="modelValue.paymentTerms" @input="updateField('paymentTerms', $event.target.value)" placeholder="Net 30" />
      </div>
      <div class="form-group">
        <label>Currency</label>
        <select :value="modelValue.currency" @change="updateField('currency', $event.target.value)">
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div class="form-group">
        <label>Source PR Number</label>
        <input :value="modelValue.sourcePrNumber" @input="updateField('sourcePrNumber', $event.target.value)" placeholder="PR-2026-0001" />
      </div>
      <div class="form-group">
        <label>Status</label>
        <input value="DRAFT" disabled />
      </div>
    </div>

    <div class="form-group full">
      <label>Notes</label>
      <textarea :value="modelValue.notes" @input="updateField('notes', $event.target.value)" rows="3" placeholder="Type..." />
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['update:modelValue']);

function updateField(field, value) {
  emit('update:modelValue', {
    ...props.modelValue,
    [field]: value,
  });
}
</script>
