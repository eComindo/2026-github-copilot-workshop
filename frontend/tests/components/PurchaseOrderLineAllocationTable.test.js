import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PurchaseOrderLineAllocationTable from '../../src/components/PurchaseOrderLineAllocationTable.vue';

function oneLine() {
  return [
    {
      selected: true,
      prNumber: 'PR-001',
      prLineNo: 1,
      itemCode: 'ITEM-001',
      itemName: 'Bearing-6205',
      qtyRemaining: 10,
      qtyAllocate: 10,
      uom: 'PAIR',
      unitPrice: 25,
      siteCode: 'JKT-WH',
      requiredDate: '',
    },
  ];
}

describe('PurchaseOrderLineAllocationTable', () => {
  test('renders one row for each allocation line', () => {
    const wrapper = mount(PurchaseOrderLineAllocationTable, {
      props: {
        lines: oneLine(),
      },
    });

    const bodyRows = wrapper.findAll('tbody tr');
    expect(bodyRows).toHaveLength(1);
    expect(wrapper.text()).toContain('Approved PR Lines');
  });

  test('emits updated lines when allocate quantity changes', async () => {
    const wrapper = mount(PurchaseOrderLineAllocationTable, {
      props: {
        lines: oneLine(),
      },
    });

    const numericInputs = wrapper.findAll('input[type="number"]');
    const allocateQtyInput = numericInputs[2];
    await allocateQtyInput.setValue('7');

    const emits = wrapper.emitted('update:lines');
    expect(emits).toBeTruthy();
    expect(emits[0][0][0].qtyAllocate).toBe('7');
  });

  test('emits updated lines when row selection changes', async () => {
    const wrapper = mount(PurchaseOrderLineAllocationTable, {
      props: {
        lines: oneLine(),
      },
    });

    const checkbox = wrapper.find('input[type="checkbox"]');
    await checkbox.setValue(false);

    const emits = wrapper.emitted('update:lines');
    const payload = emits[0][0];

    expect(payload[0].selected).toBe(false);
  });
});
