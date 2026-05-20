import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import PurchaseOrderDetailPage from '../../src/pages/PurchaseOrderDetailPage.vue';
import { api } from '../../src/api';

vi.mock('../../src/api', () => ({
  api: {
    getPurchaseOrder: vi.fn(),
    getPurchaseOrderOpenLines: vi.fn(),
    submitPurchaseOrder: vi.fn(),
  },
}));

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router');
  return {
    ...actual,
    useRoute: () => ({ params: { id: 'po-1' } }),
  };
});

function poDetailPayload(status = 'DRAFT') {
  return {
    id: 'po-1',
    poNumber: 'PO-2026-0001',
    status,
    vendorName: 'PT Supplier Jaya',
    lines: [
      {
        id: 'po-line-1',
        lineNo: 1,
        itemCode: 'ITEM-001',
        itemName: 'Bearing',
        qtyOrdered: 5,
        qtyReceived: 1,
        qtyOpenForGr: 4,
        uom: 'PCS',
        unitPrice: 100,
        siteCode: 'JKT-WH',
        requiredDate: null,
        allocations: [{ prLineId: 'pr-line-1', prNumber: 'PR-2026-0001', allocatedQty: 5 }],
      },
    ],
  };
}

describe('PurchaseOrderDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads PO detail and open line count', async () => {
    api.getPurchaseOrder.mockResolvedValue(poDetailPayload('DRAFT'));
    api.getPurchaseOrderOpenLines.mockResolvedValue({ openLines: [{ id: 'po-line-1' }] });

    const wrapper = mount(PurchaseOrderDetailPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    await flushPromises();

    expect(api.getPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(api.getPurchaseOrderOpenLines).toHaveBeenCalledWith('po-1');
    expect(wrapper.text()).toContain('Detail Purchase Order');
    expect(wrapper.text()).toContain('PO-2026-0001');
    const headerInputs = wrapper.findAll('.form-row .form-group input');
    expect(headerInputs[1].element.value).toBe('PT Supplier Jaya');
    expect(wrapper.text()).toContain('PR-2026-0001 (5)');
    expect(wrapper.text()).toContain('Submit PO');
  });

  test('submits draft PO and refreshes open lines', async () => {
    api.getPurchaseOrder.mockResolvedValue(poDetailPayload('DRAFT'));
    api.getPurchaseOrderOpenLines
      .mockResolvedValueOnce({ openLines: [{ id: 'po-line-1' }] })
      .mockResolvedValueOnce({ openLines: [] });
    api.submitPurchaseOrder.mockResolvedValue(poDetailPayload('SUBMITTED'));

    const wrapper = mount(PurchaseOrderDetailPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    await flushPromises();
    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(api.submitPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(api.getPurchaseOrderOpenLines).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain('SUBMITTED');
  });

  test('shows API error message when loading fails', async () => {
    api.getPurchaseOrder.mockRejectedValue(new Error('PO not found'));

    const wrapper = mount(PurchaseOrderDetailPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('PO not found');
  });
});