import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import PurchaseOrderListPage from './PurchaseOrderListPage.vue';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    listPurchaseOrders: vi.fn(),
  },
}));

const mountPage = () => mount(PurchaseOrderListPage, {
  global: {
    stubs: {
      RouterLink: { template: '<a><slot /></a>' },
    },
  },
});

describe('PurchaseOrderListPage', () => {
  beforeEach(() => {
    vi.mocked(api.listPurchaseOrders).mockReset();
  });

  test('renders purchase orders returned by the list service', async () => {
    vi.mocked(api.listPurchaseOrders).mockResolvedValue({
      items: [{
        id: 'po-1',
        poNumber: 'PO-2026-0001',
        vendorName: 'PT Supplier Jaya',
        status: 'DRAFT',
        createdAt: '2026-10-12T00:00:00.000Z',
      }],
    });

    const wrapper = mountPage();
    await flushPromises();

    expect(api.listPurchaseOrders).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('PT Supplier Jaya');
    expect(wrapper.find('.status-badge').classes()).toContain('draft');
  });

  test('shows the service error when purchase orders cannot load', async () => {
    vi.mocked(api.listPurchaseOrders).mockRejectedValue(new Error('Unable to load purchase orders'));

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.find('.error').text()).toBe('Unable to load purchase orders');
  });
});
