import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import PurchaseOrderCreatePage from '../../src/pages/PurchaseOrderCreatePage.vue';

// Mock the api module
vi.mock('../../src/api', () => ({
  api: {
    listRequisitions: vi.fn().mockResolvedValue({
      items: [
        { id: 'pr-1', status: 'APPROVED', prNumber: 'PR-2026-0001' },
      ],
    }),
    getRequisitionOpenLines: vi.fn().mockResolvedValue({
      requisition: { id: 'pr-1', prNumber: 'PR-2026-0001', status: 'APPROVED' },
      openLines: [
        {
          id: 'line-1',
          lineNo: 1,
          itemCode: 'BRG-6205',
          itemName: 'Bearing 6205',
          qtyRequested: 20,
          qtyOpenForPo: 8,
          uom: 'PCS',
          estUnitPrice: 45000,
          siteCode: 'JKT-PLANT',
          requiredDate: null,
        },
        {
          id: 'line-2',
          lineNo: 2,
          itemCode: 'GLV-IND',
          itemName: 'Industrial Safety Gloves',
          qtyRequested: 50,
          qtyOpenForPo: 30,
          uom: 'PAIR',
          estUnitPrice: 32000,
          siteCode: 'JKT-PLANT',
          requiredDate: null,
        },
      ],
    }),
    createPurchaseOrder: vi.fn().mockResolvedValue({ id: 'new-po-id' }),
  },
}));

// Minimal router stub so RouterLink resolves
const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/purchase-orders', component: { template: '<div />' } },
    { path: '/purchase-orders/new', component: { template: '<div />' } },
    { path: '/purchase-orders/:id', component: { template: '<div />' } },
  ],
});

async function mountPage() {
  const wrapper = mount(PurchaseOrderCreatePage, {
    global: { plugins: [router] },
  });
  await flushPromises();
  return wrapper;
}

describe('PurchaseOrderCreatePage', () => {
  it('renders the page title', async () => {
    const wrapper = await mountPage();
    expect(wrapper.find('h2').text()).toBe('Create Purchase Order');
  });

  it('renders the subtitle', async () => {
    const wrapper = await mountPage();
    expect(wrapper.text()).toContain('Allocate approved PR lines to a new Purchase Order');
  });

  it('renders the back button link', async () => {
    const wrapper = await mountPage();
    const backBtn = wrapper.find('.back-btn');
    expect(backBtn.exists()).toBe(true);
  });

  it('renders the PO Header form', async () => {
    const wrapper = await mountPage();
    expect(wrapper.text()).toContain('PO Header');
    expect(wrapper.text()).toContain('Vendor Name');
  });

  it('renders the summary bar', async () => {
    const wrapper = await mountPage();
    expect(wrapper.text()).toContain('Selected Lines');
    expect(wrapper.text()).toContain('Estimated Total');
  });

  it('renders the allocation table with fetched lines', async () => {
    const wrapper = await mountPage();
    expect(wrapper.text()).toContain('Allocate PR Lines');
    expect(wrapper.text()).toContain('BRG-6205');
    expect(wrapper.text()).toContain('GLV-IND');
  });

  it('renders Cancel and Save As Draft buttons', async () => {
    const wrapper = await mountPage();
    expect(wrapper.text()).toContain('Cancel');
    expect(wrapper.text()).toContain('Save As Draft');
  });

  it('shows error when submitting without vendor name', async () => {
    const wrapper = await mountPage();
    await wrapper.find('form').trigger('submit');
    expect(wrapper.text()).toContain('Vendor name is required');
  });

  it('shows error when submitting with vendor but no selected lines', async () => {
    const wrapper = await mountPage();
    const vendorInput = wrapper.find('.card-panel input');
    await vendorInput.setValue('PT Maju Jaya');
    await wrapper.find('form').trigger('submit');
    expect(wrapper.text()).toContain('Select at least one PR line to allocate');
  });

  it('computes estimated total from selected lines', async () => {
    const wrapper = await mountPage();
    // Select first line checkbox (qty 8 * price 45000 = 360,000)
    const checkboxes = wrapper.findAll('tbody input[type="checkbox"]');
    await checkboxes[0].setValue(true);

    expect(wrapper.text()).toContain('360,000.00');
  });
});
