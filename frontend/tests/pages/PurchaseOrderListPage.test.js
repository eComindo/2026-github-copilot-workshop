import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import PurchaseOrderListPage from '../../src/pages/PurchaseOrderListPage.vue';
import { api } from '../../src/api';

vi.mock('../../src/api', () => ({
  api: {
    listPurchaseOrders: vi.fn(),
  },
}));

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/purchase-orders', component: { template: '<div />' } },
    { path: '/purchase-orders/new', component: { template: '<div />' } },
    { path: '/purchase-orders/:id', component: { template: '<div />' } },
  ],
});

describe('PurchaseOrderListPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('renders page header and New PO button', async () => {
    api.listPurchaseOrders.mockResolvedValue({ items: [] });

    const wrapper = mount(PurchaseOrderListPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).toContain('Purchase Orders');
    expect(wrapper.text()).toContain('+ New PO');
  });

  it('renders fetched rows and status badge class', async () => {
    api.listPurchaseOrders.mockResolvedValue({
      items: [
        {
          id: 'po-1',
          poNumber: 'PO-2026-0001',
          vendorName: 'PT Vendor',
          status: 'DRAFT',
          createdAt: '2026-05-01T00:00:00.000Z',
        },
      ],
    });

    const wrapper = mount(PurchaseOrderListPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(api.listPurchaseOrders).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('PO-2026-0001');
    expect(wrapper.text()).toContain('PT Vendor');
    expect(wrapper.find('.status-badge').classes()).toContain('draft');
  });

  it('shows API error message', async () => {
    api.listPurchaseOrders.mockRejectedValue(new Error('Failed to fetch'));

    const wrapper = mount(PurchaseOrderListPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.text()).toContain('Failed to fetch');
  });
});