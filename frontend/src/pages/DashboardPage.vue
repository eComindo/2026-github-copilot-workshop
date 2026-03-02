<template>
  <section>
    <!-- Page header -->
    <div class="page-header">
      <div>
        <h2>Procurement Dashboard</h2>
        <p class="muted">Overview of PR, PO and GR activities</p>
      </div>
      <div class="btn-group">
        <RouterLink to="/requisitions/new" class="btn btn-outline">+ New PR</RouterLink>
      </div>
    </div>

    <!-- Stat cards -->
    <div class="stat-cards">
      <div class="stat-card">
        <span class="stat-card-title">Open PR</span>
        <span class="stat-card-value">{{ stats.totalPr }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-title">Draft</span>
        <span class="stat-card-value">{{ stats.draftPr }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-title">Submitted</span>
        <span class="stat-card-value">{{ stats.submittedPr }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-card-title">Approved</span>
        <span class="stat-card-value">{{ stats.approvedPr }}</span>
      </div>
    </div>

    <!-- Recent Purchase Requisitions -->
    <div class="card-panel">
      <div class="card-panel-header">
        <h3>Recent Purchase Requisitions</h3>
        <RouterLink to="/requisitions">View All</RouterLink>
      </div>
      <table>
        <thead>
          <tr>
            <th>PR No</th>
            <th>Requester</th>
            <th>Status</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in stats.recentPr" :key="item.id">
            <td><RouterLink :to="`/requisitions/${item.id}`">{{ item.prNumber }}</RouterLink></td>
            <td>{{ item.requesterName }}</td>
            <td>
              <span class="status-badge" :class="item.status.toLowerCase()">{{ item.status }}</span>
            </td>
            <td>{{ item.createdAt ? new Date(item.createdAt).toLocaleDateString() : '-' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
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
