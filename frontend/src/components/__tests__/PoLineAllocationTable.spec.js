import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import PoLineAllocationTable from '../PoLineAllocationTable.vue';

function makeLine(overrides = {}) {
  return reactive({
    prLineId: 'pr-line-1',
    prNumber: 'PR-2026-0001',
    lineNo: 1,
    itemCode: 'ITEM-001',
    itemName: 'Bearing-6205',
    uom: 'PCS',
    qtyRequested: 20,
    qtyAllocated: 5,
    qtyRemaining: 15,
    qtyOrdered: 0,
    unitPrice: 0,
    deliveryAddress: '',
    deliveryDate: '',
    selected: false,
    ...overrides,
  });
}

describe('PoLineAllocationTable', () => {
  test('renders one row per PR line with read-only quantity columns', () => {
    const lines = [makeLine(), makeLine({ prLineId: 'pr-line-2', itemCode: 'ITEM-002' })];
    const wrapper = mount(PoLineAllocationTable, { props: { lines } });

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.text()).toContain('ITEM-001');
    expect(wrapper.text()).toContain('ITEM-002');
  });

  test('disables order qty, unit price, and delivery inputs until the line is selected', () => {
    const lines = [makeLine({ selected: false })];
    const wrapper = mount(PoLineAllocationTable, { props: { lines } });

    const editableInputs = wrapper.findAll('input[type="number"], input[type="date"], input:not([type])');
    editableInputs.forEach((input) => {
      expect(input.attributes('disabled')).toBeDefined();
    });
  });

  test('computes line amount as order qty times unit price', () => {
    const lines = [makeLine({ selected: true, qtyOrdered: 4, unitPrice: 25 })];
    const wrapper = mount(PoLineAllocationTable, { props: { lines } });

    expect(wrapper.text()).toContain('100.00');
  });
});
