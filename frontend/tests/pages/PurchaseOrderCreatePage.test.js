import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import PurchaseOrderCreatePage from '../../src/pages/PurchaseOrderCreatePage.vue';
import PurchaseOrderLineAllocationTable from '../../src/components/PurchaseOrderLineAllocationTable.vue';

describe('PurchaseOrderCreatePage', () => {
  test('renders page title and action buttons', () => {
    const wrapper = mount(PurchaseOrderCreatePage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    expect(wrapper.text()).toContain('Create Purchase Order');
    expect(wrapper.text()).toContain('Save As Draft');
    expect(wrapper.text()).toContain('Cancel');
  });

  test('shows notice after save draft submit', async () => {
    const wrapper = mount(PurchaseOrderCreatePage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    await wrapper.find('form').trigger('submit.prevent');

    expect(wrapper.text()).toContain('Draft PO captured locally. API integration is intentionally not implemented yet.');
  });

  test('updates allocation line state from child emit', async () => {
    const wrapper = mount(PurchaseOrderCreatePage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    const nextLines = [
      {
        selected: true,
        prNumber: 'PR-777',
        prLineNo: 1,
        itemCode: 'ITEM-777',
        itemName: 'Seal kit',
        qtyRemaining: 8,
        qtyAllocate: 6,
        uom: 'PCS',
        unitPrice: 50,
        siteCode: 'BDG-WH',
        requiredDate: '2026-06-30',
      },
    ];

    wrapper.findComponent(PurchaseOrderLineAllocationTable).vm.$emit('update:lines', nextLines);
    await nextTick();

    expect(wrapper.findComponent(PurchaseOrderLineAllocationTable).props('lines')).toEqual(nextLines);
  });
});
