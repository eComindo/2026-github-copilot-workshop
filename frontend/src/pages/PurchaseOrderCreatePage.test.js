import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import PurchaseOrderCreatePage from './PurchaseOrderCreatePage.vue';
import { api } from '../api';

const { push } = vi.hoisted(() => ({
  push: vi.fn(),
}));

vi.mock('../api', () => ({
  api: {
    listRequisitions: vi.fn(),
    getRequisitionOpenLines: vi.fn(),
    createPurchaseOrder: vi.fn(),
  },
}));

vi.mock('vue-router', async (importOriginal) => ({
  ...(await importOriginal()),
  useRouter: () => ({ push }),
}));

const mountPage = () => mount(PurchaseOrderCreatePage, {
  global: {
    stubs: {
      RouterLink: { template: '<a><slot /></a>' },
    },
  },
});

describe('PurchaseOrderCreatePage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    push.mockReset();
    api.listRequisitions.mockResolvedValue({
      items: [{ id: 'pr-1', status: 'APPROVED' }],
    });
    api.getRequisitionOpenLines.mockResolvedValue({
      requisition: { id: 'pr-1', prNumber: 'PR-2026-0001' },
      openLines: [{
        id: 'pr-line-1',
        lineNo: 1,
        itemCode: 'BRG-001',
        itemName: 'Safety Helmet',
        qtyOpenForPo: 5,
        uom: 'PCS',
        estUnitPrice: 150000,
        siteCode: 'WH-JKT',
        requiredDate: '2026-10-30',
      }],
    });
  });

  test('prevents client-side over-allocation against the selected PR line', async () => {
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get('select[required]').setValue('pr-line-1');
    await wrapper.get('input[max="5"]').setValue(6);
    await wrapper.get('form').trigger('submit');

    expect(wrapper.text()).toContain('allocation quantity cannot exceed the remaining PR quantity (5)');
    expect(api.createPurchaseOrder).not.toHaveBeenCalled();
  });

  test('creates a PO using the selected PR line and API request contract', async () => {
    api.createPurchaseOrder.mockResolvedValue({ id: 'po-1', poNumber: 'PO-2026-0001' });
    const wrapper = mountPage();
    await flushPromises();

    await wrapper.get('#supplier').setValue('PT Supplier Jaya');
    await wrapper.get('select[required]').setValue('pr-line-1');
    await wrapper.get('form').trigger('submit');
    await flushPromises();

    expect(api.createPurchaseOrder).toHaveBeenCalledWith({
      vendorName: 'PT Supplier Jaya',
      lines: [{
        prLineId: 'pr-line-1',
        itemCode: 'BRG-001',
        itemName: 'Safety Helmet',
        qtyOrdered: 5,
        unitPrice: 150000,
        uom: 'PCS',
        siteCode: 'WH-JKT',
        requiredDate: '2026-10-30',
      }],
    });
    expect(push).toHaveBeenCalledWith('/purchase-orders/po-1');
  });
});
