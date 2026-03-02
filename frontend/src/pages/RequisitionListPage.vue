<template>
  <section>
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/" class="back-btn" title="Back to Dashboard">&#8592;</RouterLink>
        <div>
          <h2>Purchase Requisitions</h2>
          <p class="muted">All purchase requisition records</p>
        </div>
      </div>
      <RouterLink class="btn btn-outline" to="/requisitions/new">+ New PR</RouterLink>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <div class="card-panel">
      <table>
        <thead>
          <tr>
            <th>PR Number</th>
            <th>Requester</th>
            <th>Department</th>
            <th>Title</th>
            <th>Status</th>
            <th>Needed By</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in items" :key="item.id">
            <td><RouterLink :to="`/requisitions/${item.id}`">{{ item.prNumber }}</RouterLink></td>
            <td>{{ item.requesterName }}</td>
            <td>{{ item.departmentName }}</td>
            <td>{{ item.title }}</td>
            <td>
              <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
            </td>
            <td>{{ item.neededByDate || '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../api';

const items = ref([]);
const errorMessage = ref('');

onMounted(async () => {
  try {
    const payload = await api.listRequisitions();
    items.value = payload.items;
  } catch (error) {
    errorMessage.value = error.message;
  }
});
</script>
