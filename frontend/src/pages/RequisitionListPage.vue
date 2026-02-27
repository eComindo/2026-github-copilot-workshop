<template>
  <section>
    <header class="header-row">
      <div>
        <h2>Purchase Requisitions</h2>
        <p class="muted">Baseline PR module list page.</p>
      </div>
      <RouterLink class="button" to="/requisitions/new">Create PR</RouterLink>
    </header>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

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
          <td>{{ item.status }}</td>
          <td>{{ item.neededByDate || '-' }}</td>
        </tr>
      </tbody>
    </table>
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
