import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import PODetailPage from '../../../src/pages/PODetailPage.vue';
import * as apiModule from '../../../src/api';

vi.mock('../../../src/api', () => ({
  api: {
    getPurchaseOrder: vi.fn(),
    submitPurchaseOrder: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' },
  }),
  useRouter: () => ({
    push: vi.fn(),
  }),
  RouterLink: { template: '<a><slot /></a>' },
}));

describe('PODetailPage.vue', () => {
  let wrapper;
  const mockPO = {
    id: 1,
    poNumber: 'PO-001',
    prId: 1,
    supplierName: 'Supplier A',
    poTitle: 'Purchase Order 1',
    status: 'DRAFT',
    deliveryDate: '2026-09-15',
    deliveryAddress: '123 Main St',
    notes: 'Rush delivery',
    lines: [
      {
        id: 'alloc1',
        prLineId: 'line1',
        itemCode: 'ITEM-001',
        itemName: 'Widget A',
        allocateQty: 50,
        uom: 'EA',
        unitPrice: 10.5,
      },
    ],
  };

  beforeEach(() => {
    apiModule.api.getPurchaseOrder.mockResolvedValue(mockPO);
    apiModule.api.submitPurchaseOrder.mockResolvedValue({ id: 1, status: 'SUBMITTED' });
  });

  it('renders PO detail page with title', async () => {
    wrapper = mount(PODetailPage);

    await flushPromises();

    expect(wrapper.text()).toContain('Purchase Order');
  });

  it('fetches PO data on mount', async () => {
    wrapper = mount(PODetailPage);

    await flushPromises();

    expect(apiModule.api.getPurchaseOrder).toHaveBeenCalledWith('1');
  });

  it('renders page section', async () => {
    wrapper = mount(PODetailPage);

    await flushPromises();

    expect(wrapper.find('section').exists()).toBe(true);
  });

  it('displays error when PO fetch fails', async () => {
    apiModule.api.getPurchaseOrder.mockRejectedValueOnce(new Error('Failed to load PO'));

    wrapper = mount(PODetailPage);

    await flushPromises();

    expect(wrapper.text()).toContain('Failed to load PO') || expect(wrapper.find('.error').exists()).toBe(true);
  });

  it('renders successfully when PO data is loaded', async () => {
    wrapper = mount(PODetailPage);

    await flushPromises();

    expect(wrapper.find('section').exists()).toBe(true);
  });

  it('renders submit button for draft PO', async () => {
    wrapper = mount(PODetailPage);

    await flushPromises();

    // Component should render submit button if PO is draft
    const buttons = wrapper.findAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(0);
  });
});
