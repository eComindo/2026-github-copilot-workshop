import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import POLineAllocationTable from '../../../src/components/POLineAllocationTable.vue';
import * as apiModule from '../../../src/api';

vi.mock('../../../src/api', () => ({
  api: {
    getRequisitionOpenLines: vi.fn(),
  },
}));

describe('POLineAllocationTable.vue', () => {
  let wrapper;
  const mockOpenLines = [
    {
      id: 'line1',
      itemCode: 'ITEM-001',
      itemName: 'Widget A',
      qtyOpenForPo: 100,
      uom: 'EA',
      estUnitPrice: 10.5,
      siteCode: 'SITE-001',
      requiredDate: '2026-09-15',
    },
    {
      id: 'line2',
      itemCode: 'ITEM-002',
      itemName: 'Widget B',
      qtyOpenForPo: 50,
      uom: 'BOX',
      estUnitPrice: 25.0,
      siteCode: 'SITE-002',
      requiredDate: '2026-09-20',
    },
  ];

  beforeEach(() => {
    apiModule.api.getRequisitionOpenLines.mockResolvedValue({ openLines: mockOpenLines });
  });

  it('renders component when no prId is provided', () => {
    wrapper = mount(POLineAllocationTable, {
      props: {
        modelValue: [],
        prId: null,
      },
    });

    expect(wrapper.find('.card-panel').exists()).toBe(true);
  });

  it('loads open lines when prId is set', async () => {
    wrapper = mount(POLineAllocationTable, {
      props: {
        modelValue: [],
        prId: '1',
      },
    });

    await flushPromises();

    expect(apiModule.api.getRequisitionOpenLines).toHaveBeenCalledWith('1');
  });

  it('emits error when fetching open lines fails', async () => {
    apiModule.api.getRequisitionOpenLines.mockRejectedValueOnce(new Error('Failed to load lines'));

    wrapper = mount(POLineAllocationTable, {
      props: {
        modelValue: [],
        prId: '1',
      },
    });

    await flushPromises();

    const errors = wrapper.emitted('error');
    expect(errors).toBeDefined();
  });

  it('exports validateAllocations method', () => {
    wrapper = mount(POLineAllocationTable, {
      props: {
        modelValue: [],
        prId: null,
      },
    });

    expect(typeof wrapper.vm.validateAllocations).toBe('function');
  });

  it('exposes addAllocation and removeAllocation methods', () => {
    wrapper = mount(POLineAllocationTable, {
      props: {
        modelValue: [],
        prId: null,
      },
    });

    expect(typeof wrapper.vm.addAllocation).toBe('function');
    expect(typeof wrapper.vm.removeAllocation).toBe('function');
  });
});
