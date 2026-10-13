import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import PurchaseOrderDetailPage from './PurchaseOrderDetailPage.vue';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    getPurchaseOrder: vi.fn(),
    submitPurchaseOrder: vi.fn(),
  },
}));

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useRoute: () => ({ params: { id: 'po-1' } }),
}));

const purchaseOrder = {
  id: 'po-1',
  poNumber: 'PO-2026-0001',
  vendorName: 'PT Supplier Jaya',
  status: 'DRAFT',
  createdAt: '2026-10-12T00:00:00.000Z',
  lines: [{
    id: 'po-line-1',
    lineNo: 1,
    itemCode: 'BRG-001',
    itemName: 'Safety Helmet',
    qtyOrdered: 5,
    qtyReceived: 1,
    qtyOpenForGr: 4,
    uom: 'PCS',
    unitPrice: 150000,
    siteCode: 'WH-JKT',
    requiredDate: '2026-10-30',
    allocations: [{ prLineId: 'pr-line-1', prNumber: 'PR-2026-0001', allocatedQty: 5 }],
  }],
};

const mountPage = () => mount(PurchaseOrderDetailPage, {
  global: {
    stubs: {
      RouterLink: { template: '<a><slot /></a>' },
    },
  },
});

describe('PurchaseOrderDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    api.getPurchaseOrder.mockResolvedValue(purchaseOrder);
  });

  test('loads PO detail and submits a draft purchase order', async () => {
    api.submitPurchaseOrder.mockResolvedValue({ ...purchaseOrder, status: 'SUBMITTED' });
    const wrapper = mountPage();
    await flushPromises();

    expect(api.getPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(wrapper.text()).toContain('PR-2026-0001 (5)');
    await wrapper.get('button.btn-primary').trigger('click');
    await flushPromises();

    expect(api.submitPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(wrapper.find('.status-badge').classes()).toContain('submitted');
    expect(wrapper.find('button.btn-primary').exists()).toBe(false);
  });
});
