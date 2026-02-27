<template>
  <div class="layout">
    <aside class="sidebar">
      <h1>Procurement MVP</h1>
      <nav>
        <RouterLink to="/">Home / Dashboard</RouterLink>
        <RouterLink to="/requisitions">Purchase Requisitions</RouterLink>
      </nav>
    </aside>

    <main class="content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { RouterLink, RouterView } from 'vue-router';
</script>
