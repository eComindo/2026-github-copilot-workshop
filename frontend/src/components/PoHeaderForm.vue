<template>
  <div class="card-panel">
    <p class="form-section-title">PO Header</p>
    <div class="form-row">
      <div class="form-group">
        <label>Vendor Name</label>
        <input v-model="form.vendorName" placeholder="Type..." required />
      </div>
      <div class="form-group">
        <label>Delivery Address</label>
        <input v-model="form.deliveryAddress" placeholder="Type..." />
      </div>
      <div class="form-group">
        <label>Delivery Date</label>
        <input v-model="form.deliveryDate" type="date" />
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  form: {
    type: Object,
    required: true,
  },
});
</script>
