import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import PurchaseOrderLineAllocationTable from './PurchaseOrderLineAllocationTable.vue';

const line = {
  key: 1,
  prNumber: 'PR-2026-0001',
  prLineNo: 1,
  itemCode: 'BRG-001',
  itemName: 'Safety Helmet',
  uom: 'PCS',
  remainingQty: 5,
  qtyAllocated: 0,
  unitPrice: 150000,
};

describe('PurchaseOrderLineAllocationTable', () => {
  test('renders allocation limits and prevents removal of the final line', () => {
    const wrapper = mount(PurchaseOrderLineAllocationTable, {
      props: { lines: [line] },
    });
    const allocationInput = wrapper.find('input[max="5"]');

    expect(wrapper.get('input[placeholder="Type..."]').element.value).toBe('BRG-001');
    expect(allocationInput.attributes('min')).toBe('0');
    expect(allocationInput.attributes('step')).toBe('0.01');
    expect(wrapper.get('[aria-label="Remove line"]').attributes('disabled')).toBeDefined();
  });

  test('emits line actions when multiple lines can be managed', async () => {
    const wrapper = mount(PurchaseOrderLineAllocationTable, {
      props: { lines: [line, { ...line, key: 2, itemCode: 'BRG-002' }] },
    });

    await wrapper.get('button.btn-outline').trigger('click');
    await wrapper.findAll('[aria-label="Remove line"]')[1].trigger('click');

    expect(wrapper.emitted('add-line')).toHaveLength(1);
    expect(wrapper.emitted('remove-line')[0]).toEqual([1]);
  });
});
