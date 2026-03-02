<template>
  <div class="card-panel po-summary">
    <div class="po-summary-item">
      <span class="po-summary-label">Selected Lines</span>
      <span class="po-summary-value">{{ selectedCount }}</span>
    </div>
    <div class="po-summary-item">
      <span class="po-summary-label">Estimated Total</span>
      <span class="po-summary-value">{{ formattedTotal }}</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  selectedCount: {
    type: Number,
    default: 0,
  },
  estimatedTotal: {
    type: Number,
    default: 0,
  },
});

const formattedTotal = computed(() => {
  return props.estimatedTotal.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
});
</script>

<style scoped>
.po-summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.po-summary-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.po-summary-label {
  font-size: 13px;
  color: var(--text-muted);
}

.po-summary-value {
  font-size: 32px;
  font-weight: 600;
  letter-spacing: -1.6px;
}
</style>
