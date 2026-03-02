<template>
  <div class="card-panel">
    <p class="form-section-title">PO Header</p>
    <div class="form-row">
      <div class="form-group">
        <label>Vendor Name</label>
        <input
          :value="modelValue.vendorName"
          @input="$emit('update:modelValue', { ...modelValue, vendorName: $event.target.value })"
          placeholder="Type..."
          required
        />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: Object,
    required: true,
  },
});

defineEmits(['update:modelValue']);
</script>
