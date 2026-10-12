<template>
  <div class="card-panel">
    <p class="form-section-title">PO Header</p>

    <div class="form-row">
      <div class="form-group">
        <label for="supplier">Supplier</label>
        <input id="supplier" v-model="form.supplierName" placeholder="Select supplier" />
      </div>
      <div class="form-group">
        <label for="po-date">PO Date</label>
        <input id="po-date" v-model="form.orderDate" type="date" />
      </div>
      <div class="form-group">
        <label for="currency">Currency</label>
        <select id="currency" v-model="form.currency">
          <option value="IDR">IDR</option>
          <option value="USD">USD</option>
        </select>
      </div>
      <div class="form-group">
        <label for="delivery-date">Expected Delivery Date</label>
        <input id="delivery-date" v-model="form.expectedDeliveryDate" type="date" />
      </div>
    </div>

    <div class="form-group full">
      <label for="notes">Notes</label>
      <textarea id="notes" v-model="form.notes" rows="3" placeholder="Type..." />
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
