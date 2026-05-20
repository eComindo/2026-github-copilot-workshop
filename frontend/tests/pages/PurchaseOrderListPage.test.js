import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import PurchaseOrderListPage from '../../src/pages/PurchaseOrderListPage.vue';
import { api } from '../../src/api';

vi.mock('../../src/api', () => ({
  api: {
    listPurchaseOrders: vi.fn(),
  },
}));

describe('PurchaseOrderListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders purchase order rows from API response', async () => {
    api.listPurchaseOrders.mockResolvedValue({
      items: [
        {
          id: 'po-1',
          poNumber: 'PO-2026-0001',
          vendorName: 'PT Supplier Jaya',
          status: 'DRAFT',
          createdAt: '2026-05-20T00:00:00.000Z',
        },
      ],
    });

    const wrapper = mount(PurchaseOrderListPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    await flushPromises();

    expect(api.listPurchaseOrders).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('Purchase Orders');
    expect(wrapper.text()).toContain('PO-2026-0001');
    expect(wrapper.text()).toContain('PT Supplier Jaya');
    expect(wrapper.text()).toContain('DRAFT');
  });

  test('shows API error message when loading fails', async () => {
    api.listPurchaseOrders.mockRejectedValue(new Error('PO service unavailable'));

    const wrapper = mount(PurchaseOrderListPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('PO service unavailable');
  });
});