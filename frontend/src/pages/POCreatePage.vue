<template>
  <section>
    <!-- Page header -->
    <div class="page-header">
      <div class="page-header-left">
        <RouterLink to="/purchase-orders" class="back-btn" title="Back to list">&#8592;</RouterLink>
        <div>
          <h2>Create Purchase Order</h2>
          <p class="muted">Create PO from approved purchase requisitions</p>
        </div>
      </div>
    </div>

    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>

    <form @submit.prevent="handleSubmit">
      <!-- PO Header -->
      <POHeaderForm v-model="formData" @error="(msg) => (errorMessage = msg)" />

      <!-- PO Lines / Allocations -->
      <POLineAllocationTable
        v-model="formData.allocations"
        :pr-id="formData.prId"
        @error="(msg) => (errorMessage = msg)"
      />

      <!-- Action buttons -->
      <div class="btn-group">
        <RouterLink to="/purchase-orders" class="btn btn-outline">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit">Save As Draft</button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import POHeaderForm from '../components/POHeaderForm.vue';
import POLineAllocationTable from '../components/POLineAllocationTable.vue';

const router = useRouter();
const errorMessage = ref('');

const formData = reactive({
  prId: null,
  supplierId: null,
  supplierName: '',
  poTitle: '',
  deliveryAddress: '',
  deliveryDate: '',
  notes: '',
  allocations: [],
});

const handleSubmit = () => {
  // TODO: Call API to create PO
  console.log('PO Form Data:', formData);
  errorMessage.value = 'API integration pending';
};
</script>

<style scoped>
.btn-group {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  justify-content: flex-end;
}
</style>
