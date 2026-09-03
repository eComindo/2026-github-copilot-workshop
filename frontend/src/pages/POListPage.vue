<template>
  <section>
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <div>
          <h2>Purchase Orders</h2>
          <p class="muted">Manage purchase orders and track deliveries</p>
        </div>
      </div>
      <RouterLink to="/purchase-orders/new" class="btn btn-primary">+ New PO</RouterLink>
    </div>

    <div class="card-panel">
      <p class="muted" style="margin: 0">
        PO list will load from API. <RouterLink to="/purchase-orders/new">Create a new PO</RouterLink>
      </p>
    </div>
  </section>
</template>

<script setup>
import { RouterLink } from 'vue-router';
</script>

<style scoped>
.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  gap: 16px;
}

.page-header-left {
  flex: 1;
}

h2 {
  margin: 0 0 4px 0;
  font-size: 1.5rem;
  color: var(--text);
}

.muted {
  margin: 0;
  color: var(--text-muted);
  font-size: 0.875rem;
}
</style>
