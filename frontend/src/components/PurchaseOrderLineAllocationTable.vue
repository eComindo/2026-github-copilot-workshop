<template>
  <div class="card-panel">
    <div class="card-panel-header">
      <p class="form-section-title" style="margin: 0">Approved PR Lines</p>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 88px">Select</th>
          <th>PR No</th>
          <th style="width: 90px">PR Line</th>
          <th>Item Code</th>
          <th>Item Name</th>
          <th style="width: 110px">Remain Qty</th>
          <th style="width: 120px">Allocate Qty</th>
          <th style="width: 80px">UOM</th>
          <th style="width: 120px">Unit Price</th>
          <th>Site</th>
          <th style="width: 130px">Required Date</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(line, index) in lines" :key="index">
          <td>
            <input
              class="row-select"
              type="checkbox"
              :checked="line.selected"
              @change="updateLine(index, 'selected', $event.target.checked)"
            />
          </td>
          <td><input :value="line.prNumber" @input="updateLine(index, 'prNumber', $event.target.value)" placeholder="PR-0001" /></td>
          <td><input :value="line.prLineNo" @input="updateLine(index, 'prLineNo', $event.target.value)" type="number" min="1" placeholder="1" /></td>
          <td><input :value="line.itemCode" @input="updateLine(index, 'itemCode', $event.target.value)" placeholder="Type..." /></td>
          <td><input :value="line.itemName" @input="updateLine(index, 'itemName', $event.target.value)" placeholder="Type..." /></td>
          <td><input :value="line.qtyRemaining" @input="updateLine(index, 'qtyRemaining', $event.target.value)" type="number" min="0" step="0.01" placeholder="0" /></td>
          <td><input :value="line.qtyAllocate" @input="updateLine(index, 'qtyAllocate', $event.target.value)" type="number" min="0" step="0.01" placeholder="0" /></td>
          <td><input :value="line.uom" @input="updateLine(index, 'uom', $event.target.value)" placeholder="PCS" /></td>
          <td><input :value="line.unitPrice" @input="updateLine(index, 'unitPrice', $event.target.value)" type="number" min="0" step="0.01" placeholder="0" /></td>
          <td><input :value="line.siteCode" @input="updateLine(index, 'siteCode', $event.target.value)" placeholder="Type..." /></td>
          <td><input :value="line.requiredDate" @input="updateLine(index, 'requiredDate', $event.target.value)" type="date" /></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
const props = defineProps({
  lines: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['update:lines']);

function updateLine(index, field, value) {
  const next = props.lines.map((line, currentIndex) => {
    if (currentIndex !== index) return line;
    return {
      ...line,
      [field]: value,
    };
  });
  emit('update:lines', next);
}
</script>

<style scoped>
.row-select {
  width: 32px;
  height: 32px;
  accent-color: var(--primary);
}

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
