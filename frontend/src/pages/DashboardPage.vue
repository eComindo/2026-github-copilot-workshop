<template>
  <section>
    <h2>Home / Dashboard</h2>
    <p class="muted">Overview of purchase requisitions in this workshop environment.</p>

    <div class="cards">
      <article class="card"><h3>Total PR</h3><p>{{ stats.totalPr }}</p></article>
      <article class="card"><h3>Draft</h3><p>{{ stats.draftPr }}</p></article>
      <article class="card"><h3>Submitted</h3><p>{{ stats.submittedPr }}</p></article>
      <article class="card"><h3>Approved</h3><p>{{ stats.approvedPr }}</p></article>
    </div>

    <h3>Recent PR</h3>
    <table>
      <thead>
        <tr>
          <th>PR Number</th>
          <th>Title</th>
          <th>Status</th>
          <th>Needed By</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in stats.recentPr" :key="item.id">
          <td><RouterLink :to="`/requisitions/${item.id}`">{{ item.prNumber }}</RouterLink></td>
          <td>{{ item.title }}</td>
          <td>{{ item.status }}</td>
          <td>{{ item.neededByDate || '-' }}</td>
        </tr>
      </tbody>
    </table>
  </section>
</template>

<script setup>
import { onMounted, reactive } from 'vue';
import { RouterLink } from 'vue-router';
import { api } from '../api';

const stats = reactive({
  totalPr: 0,
  draftPr: 0,
  submittedPr: 0,
  approvedPr: 0,
  recentPr: [],
});

onMounted(async () => {
  const payload = await api.getDashboard();
  Object.assign(stats, payload);
});
</script>
