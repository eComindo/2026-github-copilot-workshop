<template>
  <section>
    <header class="header-row">
      <div>
        <h2>PR Detail</h2>
        <p class="muted">{{ requisition?.prNumber || '-' }} | {{ requisition?.status || '-' }}</p>
      </div>
      <RouterLink class="button secondary" to="/requisitions">Back to List</RouterLink>
    </header>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div v-if="requisition" class="detail-grid">
      <p><strong>Requester:</strong> {{ requisition.requesterName }}</p>
      <p><strong>Department:</strong> {{ requisition.departmentName }}</p>
      <p><strong>Title:</strong> {{ requisition.title }}</p>
      <p><strong>Needed By:</strong> {{ requisition.neededByDate || '-' }}</p>
      <p class="full"><strong>Notes:</strong> {{ requisition.notes || '-' }}</p>
    </div>

    <div class="actions" v-if="requisition">
      <button v-if="requisition.status === 'DRAFT'" class="button" @click="submitRequisition">Submit</button>
      <button v-if="requisition.status === 'SUBMITTED'" class="button" @click="approveRequisition">Approve</button>
    </div>

    <h3>Lines</h3>
    <table v-if="requisition">
      <thead>
        <tr>
          <th>Line</th>
          <th>Item</th>
          <th>Qty Requested</th>
          <th>Qty Allocated</th>
          <th>Qty Received</th>
          <th>Open for PO</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="line in requisition.lines" :key="line.id">
          <td>{{ line.lineNo }}</td>
          <td>{{ line.itemCode }} - {{ line.itemName }}</td>
          <td>{{ line.qtyRequested }}</td>
          <td>{{ line.qtyAllocated }}</td>
          <td>{{ line.qtyReceived }}</td>
          <td>{{ line.qtyOpenForPo }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink, useRoute } from 'vue-router';
import { api } from '../api';

const route = useRoute();
const requisition = ref(null);
const errorMessage = ref('');

async function load() {
  errorMessage.value = '';
  try {
    requisition.value = await api.getRequisition(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function submitRequisition() {
  try {
    requisition.value = await api.submitRequisition(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

async function approveRequisition() {
  try {
    requisition.value = await api.approveRequisition(route.params.id);
  } catch (error) {
    errorMessage.value = error.message;
  }
}

onMounted(load);
</script>
