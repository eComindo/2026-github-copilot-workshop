import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import LineAllocationTable from '../../src/components/LineAllocationTable.vue';

const sampleLines = [
  {
    prLineId: 'line-1',
    prNumber: 'PR-2026-0001',
    lineNo: 1,
    itemCode: 'BRG-6205',
    itemName: 'Bearing 6205-2RS',
    uom: 'PCS',
    qtyRequested: 20,
    qtyOpen: 8,
    estUnitPrice: 45000,
  },
  {
    prLineId: 'line-2',
    prNumber: 'PR-2026-0001',
    lineNo: 2,
    itemCode: 'GLV-NBR-L',
    itemName: 'Nitrile Gloves L',
    uom: 'BOX',
    qtyRequested: 50,
    qtyOpen: 30,
    estUnitPrice: 85000,
  },
];

describe('LineAllocationTable', () => {
  it('renders the section title', () => {
    const wrapper = mount(LineAllocationTable, { props: { lines: [], selectedLines: [] } });
    expect(wrapper.text()).toContain('Allocate PR Lines');
  });

  it('shows empty message when no lines provided', () => {
    const wrapper = mount(LineAllocationTable, { props: { lines: [], selectedLines: [] } });
    expect(wrapper.text()).toContain('No open PR lines available');
  });

  it('renders a row for each PR line', () => {
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: [] },
    });
    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(2);
    expect(rows[0].text()).toContain('BRG-6205');
    expect(rows[1].text()).toContain('GLV-NBR-L');
  });

  it('renders all expected column headers', () => {
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: [] },
    });
    const headers = wrapper.findAll('th').map((th) => th.text());
    expect(headers).toContain('PR Number');
    expect(headers).toContain('Item Code');
    expect(headers).toContain('QTY Open');
    expect(headers).toContain('Allocate QTY');
    expect(headers).toContain('Unit Price');
  });

  it('emits selection with default allocQty and unitPrice when checkbox toggled', async () => {
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: [] },
    });
    // Toggle first line checkbox
    const checkboxes = wrapper.findAll('tbody input[type="checkbox"]');
    await checkboxes[0].setValue(true);

    const emitted = wrapper.emitted('update:selectedLines');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual([
      { prLineId: 'line-1', allocQty: 8, unitPrice: 45000 },
    ]);
  });

  it('emits removal when a selected line is unchecked', async () => {
    const selected = [{ prLineId: 'line-1', allocQty: 8, unitPrice: 45000 }];
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: selected },
    });
    const checkboxes = wrapper.findAll('tbody input[type="checkbox"]');
    await checkboxes[0].setValue(false);

    const emitted = wrapper.emitted('update:selectedLines');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual([]);
  });

  it('select-all checkbox selects all lines', async () => {
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: [] },
    });
    const selectAll = wrapper.find('thead input[type="checkbox"]');
    await selectAll.setValue(true);

    const emitted = wrapper.emitted('update:selectedLines');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toHaveLength(2);
    expect(emitted[0][0][0].prLineId).toBe('line-1');
    expect(emitted[0][0][1].prLineId).toBe('line-2');
  });

  it('select-all checkbox deselects all lines when all are selected', async () => {
    const allSelected = sampleLines.map((l) => ({
      prLineId: l.prLineId,
      allocQty: l.qtyOpen,
      unitPrice: l.estUnitPrice,
    }));
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: allSelected },
    });
    const selectAll = wrapper.find('thead input[type="checkbox"]');
    await selectAll.setValue(false);

    const emitted = wrapper.emitted('update:selectedLines');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual([]);
  });

  it('allocate qty input is disabled when line is not selected', () => {
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: [] },
    });
    const numberInputs = wrapper.findAll('tbody input[type="number"]');
    // First two are allocQty and unitPrice for line 1
    expect(numberInputs[0].attributes('disabled')).toBeDefined();
    expect(numberInputs[1].attributes('disabled')).toBeDefined();
  });

  it('allocate qty input is enabled when line is selected', () => {
    const selected = [{ prLineId: 'line-1', allocQty: 8, unitPrice: 45000 }];
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: selected },
    });
    const numberInputs = wrapper.findAll('tbody input[type="number"]');
    expect(numberInputs[0].attributes('disabled')).toBeUndefined();
    expect(numberInputs[1].attributes('disabled')).toBeUndefined();
  });

  it('emits updated allocQty when allocation input changes', async () => {
    const selected = [{ prLineId: 'line-1', allocQty: 8, unitPrice: 45000 }];
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: selected },
    });
    const allocInput = wrapper.findAll('tbody input[type="number"]')[0];
    await allocInput.setValue('5');

    const emitted = wrapper.emitted('update:selectedLines');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0][0].allocQty).toBe(5);
  });

  it('emits updated unitPrice when price input changes', async () => {
    const selected = [{ prLineId: 'line-1', allocQty: 8, unitPrice: 45000 }];
    const wrapper = mount(LineAllocationTable, {
      props: { lines: sampleLines, selectedLines: selected },
    });
    const priceInput = wrapper.findAll('tbody input[type="number"]')[1];
    await priceInput.setValue('50000');

    const emitted = wrapper.emitted('update:selectedLines');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0][0].unitPrice).toBe(50000);
  });
});
