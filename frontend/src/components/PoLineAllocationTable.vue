<template>
  <div class="card-panel">
    <div class="card-panel-header">
      <p class="form-section-title" style="margin:0">Approved PR Lines</p>
    </div>
    <table>
      <thead>
        <tr>
          <th style="width:40px">Select</th>
          <th>PR No</th>
          <th style="width:70px">PR Line</th>
          <th>Item Code</th>
          <th>Item Name</th>
          <th style="width:70px">UOM</th>
          <th style="width:90px">Requested QTY</th>
          <th style="width:90px">Allocated QTY</th>
          <th style="width:90px">Remaining QTY</th>
          <th style="width:90px">Order QTY</th>
          <th>Delivery Address</th>
          <th>Delivery Date</th>
          <th>Unit Price</th>
          <th>Line Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="line in lines" :key="line.prLineId">
          <td style="text-align:center">
            <input type="checkbox" v-model="line.selected" />
          </td>
          <td>{{ line.prNumber }}</td>
          <td>{{ line.lineNo }}</td>
          <td>{{ line.itemCode }}</td>
          <td>{{ line.itemName }}</td>
          <td>{{ line.uom }}</td>
          <td>{{ line.qtyRequested }}</td>
          <td>{{ line.qtyAllocated }}</td>
          <td>{{ line.qtyRemaining }}</td>
          <td>
            <input
              v-model.number="line.qtyOrdered"
              type="number"
              min="0"
              :max="line.qtyRemaining"
              step="0.01"
              :disabled="!line.selected"
            />
          </td>
          <td><input v-model="line.deliveryAddress" placeholder="Type..." :disabled="!line.selected" /></td>
          <td><input v-model="line.deliveryDate" type="date" :disabled="!line.selected" /></td>
          <td><input v-model.number="line.unitPrice" type="number" min="0" step="0.01" :disabled="!line.selected" /></td>
          <td>{{ lineAmount(line) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
defineProps({
  lines: {
    type: Array,
    required: true,
  },
});

function lineAmount(line) {
  return ((line.qtyOrdered || 0) * (line.unitPrice || 0)).toFixed(2);
}
</script>

<style scoped>
.card-panel table input {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: var(--radius-input);
  font-family: inherit;
  font-size: 13px;
}
.card-panel table input:focus {
  border-color: var(--primary);
  outline: none;
}
</style>
