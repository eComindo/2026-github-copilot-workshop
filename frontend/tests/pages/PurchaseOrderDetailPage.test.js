import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import PurchaseOrderDetailPage from '../../src/pages/PurchaseOrderDetailPage.vue';
import { api } from '../../src/api';

vi.mock('../../src/api', () => ({
  api: {
    getPurchaseOrder: vi.fn(),
    submitPurchaseOrder: vi.fn(),
  },
}));

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/purchase-orders/:id', component: PurchaseOrderDetailPage },
      { path: '/purchase-orders', component: { template: '<div />' } },
    ],
  });
}

describe('PurchaseOrderDetailPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders PO detail and line data', async () => {
    api.getPurchaseOrder.mockResolvedValue({
      id: 'po-1',
      poNumber: 'PO-2026-0001',
      status: 'DRAFT',
      vendorName: 'PT Vendor',
      createdAt: '2026-05-01T00:00:00.000Z',
      lines: [
        {
          id: 'line-1',
          lineNo: 1,
          itemCode: 'BRG-001',
          itemName: 'Bearing',
          qtyOrdered: 5,
          qtyReceived: 0,
          uom: 'PCS',
          unitPrice: 45000,
          siteCode: 'JKT',
          allocations: [{ prLineId: 'prl-1', prNumber: 'PR-2026-0001', allocatedQty: 5 }],
        },
      ],
    });

    const router = makeRouter();
    router.push('/purchase-orders/po-1');
    await router.isReady();

    const wrapper = mount(PurchaseOrderDetailPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).toContain('Detail Purchase Order');
    expect(wrapper.text()).toContain('PO-2026-0001');
    expect(wrapper.text()).toContain('BRG-001');
    expect(wrapper.text()).toContain('Submit PO');
  });

  it('hides Submit PO button when status is not DRAFT', async () => {
    api.getPurchaseOrder.mockResolvedValue({
      id: 'po-1',
      poNumber: 'PO-2026-0001',
      status: 'SUBMITTED',
      vendorName: 'PT Vendor',
      createdAt: '2026-05-01T00:00:00.000Z',
      lines: [],
    });

    const router = makeRouter();
    router.push('/purchase-orders/po-1');
    await router.isReady();

    const wrapper = mount(PurchaseOrderDetailPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).not.toContain('Submit PO');
  });

  it('submits draft PO and refreshes status', async () => {
    api.getPurchaseOrder.mockResolvedValue({
      id: 'po-1',
      poNumber: 'PO-2026-0001',
      status: 'DRAFT',
      vendorName: 'PT Vendor',
      createdAt: '2026-05-01T00:00:00.000Z',
      lines: [],
    });
    api.submitPurchaseOrder.mockResolvedValue({
      id: 'po-1',
      poNumber: 'PO-2026-0001',
      status: 'SUBMITTED',
      vendorName: 'PT Vendor',
      createdAt: '2026-05-01T00:00:00.000Z',
      lines: [],
    });

    const router = makeRouter();
    router.push('/purchase-orders/po-1');
    await router.isReady();

    const wrapper = mount(PurchaseOrderDetailPage, { global: { plugins: [router] } });
    await flushPromises();

    await wrapper.find('button.btn-primary').trigger('click');
    await flushPromises();

    expect(api.submitPurchaseOrder).toHaveBeenCalledWith('po-1');
    expect(wrapper.text()).toContain('SUBMITTED');
  });

  it('shows load error message', async () => {
    api.getPurchaseOrder.mockRejectedValue(new Error('Load failed'));

    const router = makeRouter();
    router.push('/purchase-orders/po-1');
    await router.isReady();

    const wrapper = mount(PurchaseOrderDetailPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).toContain('Load failed');
  });
});