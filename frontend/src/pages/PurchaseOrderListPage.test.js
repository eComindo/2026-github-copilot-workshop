import { mount, flushPromises } from '@vue/test-utils';
import { api } from '../api';
import PurchaseOrderListPage from './PurchaseOrderListPage.vue';

vi.mock('../api', () => ({
  api: {
    listPurchaseOrders: vi.fn(),
    setPurchaseOrderBookmark: vi.fn(),
  },
}));

describe('PurchaseOrderListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('loads purchase orders and allows bookmarking one', async () => {
    api.listPurchaseOrders.mockResolvedValue({
      items: [{
        id: 'po-1',
        poNumber: 'PO-2026-0001',
        vendorName: 'PT Maju',
        status: 'DRAFT',
        isBookmarked: false,
      }],
    });
    api.setPurchaseOrderBookmark.mockResolvedValue({
      id: 'po-1',
      poNumber: 'PO-2026-0001',
      vendorName: 'PT Maju',
      status: 'DRAFT',
      isBookmarked: true,
    });

    const wrapper = mount(PurchaseOrderListPage, {
      global: { stubs: ['RouterLink'] },
    });
    await flushPromises();

    expect(wrapper.text()).toContain('PO-2026-0001');
    await wrapper.get('button[aria-label="Bookmark PO-2026-0001"]').trigger('click');
    await flushPromises();

    expect(api.setPurchaseOrderBookmark).toHaveBeenCalledWith('po-1', true);
    expect(wrapper.get('button[aria-label="Remove bookmark from PO-2026-0001"]').text()).toBe('Bookmarked');
  });
});
