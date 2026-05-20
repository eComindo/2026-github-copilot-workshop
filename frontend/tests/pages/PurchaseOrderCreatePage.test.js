import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { nextTick } from 'vue';
import PurchaseOrderCreatePage from '../../src/pages/PurchaseOrderCreatePage.vue';
import PurchaseOrderLineAllocationTable from '../../src/components/PurchaseOrderLineAllocationTable.vue';
import { api } from '../../src/api';

vi.mock('../../src/api', () => ({
  api: {
    listRequisitions: vi.fn(),
    getRequisitionOpenLines: vi.fn(),
    createPurchaseOrder: vi.fn(),
    submitPurchaseOrder: vi.fn(),
    getPurchaseOrder: vi.fn(),
    getPurchaseOrderOpenLines: vi.fn(),
  },
}));

async function flushAll() {
  await Promise.resolve();
  await nextTick();
}

describe('PurchaseOrderCreatePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

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
    expect(wrapper.text()).toContain('Save And Submit');
  });

  test('loads approved PR open lines by source PR number', async () => {
    const wrapper = mount(PurchaseOrderCreatePage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    api.listRequisitions.mockResolvedValue({
      items: [{ id: 'pr-1', prNumber: 'PR-2026-0001', status: 'APPROVED' }],
    });
    api.getRequisitionOpenLines.mockResolvedValue({
      openLines: [
        {
          id: 'pr-line-1',
          lineNo: 1,
          itemCode: 'ITEM-001',
          itemName: 'Bearing',
          qtyOpenForPo: 3,
          uom: 'PCS',
          estUnitPrice: 100,
          siteCode: 'JKT-WH',
          requiredDate: null,
        },
      ],
    });

    const sourcePrInput = wrapper.find('input[placeholder="PR-2026-0001"]');
    await sourcePrInput.setValue('PR-2026-0001');
    await wrapper.find('button[type="button"]').trigger('click');
    await flushAll();

    expect(api.listRequisitions).toHaveBeenCalledTimes(1);
    expect(api.getRequisitionOpenLines).toHaveBeenCalledWith('pr-1');
    expect(wrapper.text()).toContain('Loaded 1 open line(s) from PR-2026-0001');
    expect(wrapper.findComponent(PurchaseOrderLineAllocationTable).props('lines')).toHaveLength(1);
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

  test('creates PO draft when form is submitted', async () => {
    const wrapper = mount(PurchaseOrderCreatePage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    api.createPurchaseOrder.mockResolvedValue({ id: 'po-1' });
    api.getPurchaseOrder.mockResolvedValue({ id: 'po-1', poNumber: 'PO-2026-0001', status: 'DRAFT' });
    api.getPurchaseOrderOpenLines.mockResolvedValue({ openLines: [{ id: 'po-line-1' }] });

    const table = wrapper.findComponent(PurchaseOrderLineAllocationTable);
    table.vm.$emit('update:lines', [
      {
        selected: true,
        prLineId: 'pr-line-1',
        prNumber: 'PR-2026-0001',
        prLineNo: 1,
        itemCode: 'ITEM-001',
        itemName: 'Bearing',
        qtyRemaining: 3,
        qtyAllocate: 2,
        uom: 'PCS',
        unitPrice: 100,
        siteCode: 'JKT-WH',
        requiredDate: '',
      },
    ]);
    await nextTick();

    const vendorInput = wrapper.find('input[placeholder="Type..."]');
    await vendorInput.setValue('PT Supplier Jaya');

    await wrapper.find('form').trigger('submit.prevent');
    await flushAll();

    expect(api.createPurchaseOrder).toHaveBeenCalledWith({
      vendorName: 'PT Supplier Jaya',
      lines: [
        {
          prLineId: 'pr-line-1',
          itemCode: 'ITEM-001',
          itemName: 'Bearing',
          qtyOrdered: 2,
          uom: 'PCS',
          unitPrice: 100,
          siteCode: 'JKT-WH',
          requiredDate: null,
        },
      ],
    });
    expect(api.getPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(wrapper.text()).toContain('PO PO-2026-0001 saved as DRAFT. 1 open line(s) available for GR.');
  });

  test('creates and submits PO when Save And Submit is clicked', async () => {
    const wrapper = mount(PurchaseOrderCreatePage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    api.createPurchaseOrder.mockResolvedValue({ id: 'po-2' });
    api.submitPurchaseOrder.mockResolvedValue({ id: 'po-2', poNumber: 'PO-2026-0002', status: 'SUBMITTED' });
    api.getPurchaseOrderOpenLines.mockResolvedValue({ openLines: [] });

    const table = wrapper.findComponent(PurchaseOrderLineAllocationTable);
    table.vm.$emit('update:lines', [
      {
        selected: true,
        prLineId: 'pr-line-1',
        prNumber: 'PR-2026-0001',
        prLineNo: 1,
        itemCode: 'ITEM-001',
        itemName: 'Bearing',
        qtyRemaining: 3,
        qtyAllocate: 2,
        uom: 'PCS',
        unitPrice: 100,
        siteCode: 'JKT-WH',
        requiredDate: '',
      },
    ]);
    await nextTick();

    const vendorInput = wrapper.find('input[placeholder="Type..."]');
    await vendorInput.setValue('PT Supplier Jaya');

    const saveAndSubmitButton = wrapper.findAll('button').find((button) => button.text() === 'Save And Submit');
    await saveAndSubmitButton.trigger('click');
    await flushAll();

    expect(api.submitPurchaseOrder).toHaveBeenCalledWith('po-2');
    expect(wrapper.text()).toContain('PO PO-2026-0002 submitted successfully. 0 open line(s) available for GR.');
  });
});
