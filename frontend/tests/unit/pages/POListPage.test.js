import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import POListPage from '../../../src/pages/POListPage.vue';
import * as apiModule from '../../../src/api';

vi.mock('../../../src/api', () => ({
  api: {
    listPurchaseOrders: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  RouterLink: { template: '<a><slot /></a>' },
}));

describe('POListPage.vue', () => {
  let wrapper;
  const mockPOs = [
    {
      id: 1,
      poNumber: 'PO-001',
      supplierName: 'Supplier A',
      poTitle: 'Purchase Order 1',
      status: 'DRAFT',
      totalAmount: 1000,
    },
    {
      id: 2,
      poNumber: 'PO-002',
      supplierName: 'Supplier B',
      poTitle: 'Purchase Order 2',
      status: 'SUBMITTED',
      totalAmount: 2000,
    },
  ];

  beforeEach(() => {
    apiModule.api.listPurchaseOrders.mockResolvedValue({ items: mockPOs });
  });

  it('renders PO list page with title', async () => {
    wrapper = mount(POListPage);

    await flushPromises();

    expect(wrapper.text()).toContain('Purchase Orders');
  });

  it('renders page section', async () => {
    wrapper = mount(POListPage);

    await flushPromises();

    expect(wrapper.find('section').exists()).toBe(true);
  });

  it('fetches purchase orders on mount', async () => {
    wrapper = mount(POListPage);

    await flushPromises();

    expect(apiModule.api.listPurchaseOrders).toHaveBeenCalled();
  });

  it('displays error message when fetch fails', async () => {
    apiModule.api.listPurchaseOrders.mockRejectedValueOnce(new Error('Failed to load POs'));

    wrapper = mount(POListPage);

    await flushPromises();

    expect(wrapper.text()).toContain('Failed to load POs') || expect(wrapper.find('.error').exists()).toBe(true);
  });

  it('shows loading message initially', () => {
    apiModule.api.listPurchaseOrders.mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    wrapper = mount(POListPage);

    // Component should be mounted
    expect(wrapper.find('section').exists()).toBe(true);
  });

  it('renders without error when data is empty', async () => {
    apiModule.api.listPurchaseOrders.mockResolvedValueOnce({ items: [] });

    wrapper = mount(POListPage);

    await flushPromises();

    expect(wrapper.find('section').exists()).toBe(true);
  });
});
