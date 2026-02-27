<template>
  <section>
    <h2>Create Purchase Requisition</h2>
    <p class="muted">Enter PR header and at least one line.</p>

    <form @submit.prevent="handleSubmit" class="form-grid">
      <label>Requester Name<input v-model="form.requesterName" required /></label>
      <label>Department Name<input v-model="form.departmentName" required /></label>
      <label>Title<input v-model="form.title" required /></label>
      <label>Needed By Date<input v-model="form.neededByDate" type="date" /></label>
      <label class="full">Notes<textarea v-model="form.notes" rows="3" /></label>

      <h3 class="full">PR Lines</h3>
      <table class="full">
        <thead>
          <tr>
            <th>Item Code</th>
            <th>Item Name</th>
            <th>Qty</th>
            <th>UOM</th>
            <th>Est Price</th>
            <th>Site</th>
            <th>Required Date</th>
            <th>Budget Center</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(line, index) in form.lines" :key="index">
            <td><input v-model="line.itemCode" required /></td>
            <td><input v-model="line.itemName" required /></td>
            <td><input v-model.number="line.qtyRequested" type="number" min="0.01" step="0.01" required /></td>
            <td><input v-model="line.uom" required /></td>
            <td><input v-model.number="line.estUnitPrice" type="number" min="0" step="0.01" required /></td>
            <td><input v-model="line.siteCode" required /></td>
            <td><input v-model="line.requiredDate" type="date" /></td>
            <td><input v-model="line.budgetCenter" /></td>
            <td><button type="button" class="link" @click="removeLine(index)">Remove</button></td>
          </tr>
        </tbody>
      </table>

      <button type="button" class="button secondary" @click="addLine">Add Line</button>
      <div class="full actions">
        <button class="button" type="submit">Save PR Draft</button>
        <RouterLink to="/requisitions" class="button secondary">Cancel</RouterLink>
      </div>
    </form>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api } from '../api';

const router = useRouter();
const errorMessage = ref('');

function emptyLine() {
  return {
    itemCode: '',
    itemName: '',
    qtyRequested: 1,
    uom: 'PCS',
    estUnitPrice: 0,
    siteCode: '',
    requiredDate: '',
    budgetCenter: '',
  };
}

const form = reactive({
  requesterName: '',
  departmentName: '',
  title: '',
  neededByDate: '',
  notes: '',
  lines: [emptyLine()],
});

function addLine() {
  form.lines.push(emptyLine());
}

function removeLine(index) {
  if (form.lines.length === 1) {
    return;
  }

  form.lines.splice(index, 1);
}

async function handleSubmit() {
  errorMessage.value = '';
  try {
    const payload = {
      ...form,
      lines: form.lines.map((line) => ({ ...line })),
    };

    const created = await api.createRequisition(payload);
    await router.push(`/requisitions/${created.id}`);
  } catch (error) {
    errorMessage.value = error.message;
  }
}
</script>
