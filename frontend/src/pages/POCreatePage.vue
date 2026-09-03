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
        ref="allocationTableRef"
        v-model="formData.allocations"
        :pr-id="formData.prId"
        @error="(msg) => (errorMessage = msg)"
      />

      <!-- Action buttons -->
      <div class="btn-group">
        <RouterLink to="/purchase-orders" class="btn btn-outline">Cancel</RouterLink>
        <button class="btn btn-primary" type="submit" :disabled="submitting">
          {{ submitting ? 'Saving...' : 'Save As Draft' }}
        </button>
      </div>
    </form>
  </section>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { RouterLink, useRouter } from 'vue-router';
import { api } from '../api';
import POHeaderForm from '../components/POHeaderForm.vue';
import POLineAllocationTable from '../components/POLineAllocationTable.vue';

const router = useRouter();
const errorMessage = ref('');
const submitting = ref(false);
const allocationTableRef = ref(null);

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

const handleSubmit = async () => {
  errorMessage.value = '';

  if (!formData.prId) {
    errorMessage.value = 'Select a PR first';
    return;
  }

  if (!formData.supplierName.trim()) {
    errorMessage.value = 'Supplier name is required';
    return;
  }

  if (!allocationTableRef.value?.validateAllocations()) {
    errorMessage.value = 'Fix allocation errors before submitting';
    return;
  }

  const payload = {
    vendorName: formData.supplierName.trim(),
    lines: formData.allocations.map((allocation) => ({
      prLineId: allocation.prLineId,
      itemCode: allocation.itemCode,
      itemName: allocation.itemName,
      qtyOrdered: allocation.allocateQty,
      unitPrice: allocation.unitPrice,
      uom: allocation.uom,
      siteCode: allocation.siteCode,
      requiredDate: allocation.requiredDate || null,
    })),
  };

  submitting.value = true;
  try {
    await api.createPurchaseOrder(payload);
    router.push({ name: 'purchase-orders-list' });
  } catch (err) {
    errorMessage.value = err.message;
  } finally {
    submitting.value = false;
  }
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
