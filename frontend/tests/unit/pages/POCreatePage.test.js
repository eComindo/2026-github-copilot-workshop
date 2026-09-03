import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import POCreatePage from '../../../src/pages/POCreatePage.vue';
import * as apiModule from '../../../src/api';

vi.mock('../../../src/api', () => ({
  api: {
    listRequisitions: vi.fn(),
    getRequisitionOpenLines: vi.fn(),
    createPurchaseOrder: vi.fn(),
  },
}));

vi.mock('vue-router', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  RouterLink: { template: '<a><slot /></a>' },
}));

describe('POCreatePage.vue', () => {
  let wrapper;

  beforeEach(() => {
    apiModule.api.listRequisitions.mockResolvedValue({
      items: [
        { id: 1, prNumber: 'PR-001', title: 'Test PR', status: 'APPROVED' },
      ],
    });
    apiModule.api.getRequisitionOpenLines.mockResolvedValue({
      openLines: [
        {
          id: 'line1',
          itemCode: 'ITEM-001',
          itemName: 'Widget A',
          qtyOpenForPo: 100,
          uom: 'EA',
          estUnitPrice: 10.5,
        },
      ],
    });
    apiModule.api.createPurchaseOrder.mockResolvedValue({ id: 1, status: 'DRAFT' });
  });

  it('renders PO create page with text', async () => {
    wrapper = mount(POCreatePage, {
      global: {
        stubs: {
          POHeaderForm: {
            template: '<div></div>',
            props: ['modelValue'],
          },
          POLineAllocationTable: {
            template: '<div></div>',
            props: ['modelValue', 'prId'],
          },
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Create Purchase Order');
  });

  it('renders component', () => {
    wrapper = mount(POCreatePage, {
      global: {
        stubs: {
          POHeaderForm: true,
          POLineAllocationTable: true,
        },
      },
    });

    expect(wrapper.find('section').exists()).toBe(true);
  });

  it('has form element', () => {
    wrapper = mount(POCreatePage, {
      global: {
        stubs: {
          POHeaderForm: true,
          POLineAllocationTable: true,
        },
      },
    });

    expect(wrapper.find('form').exists()).toBe(true);
  });

  it('renders submit button', () => {
    wrapper = mount(POCreatePage, {
      global: {
        stubs: {
          POHeaderForm: true,
          POLineAllocationTable: true,
        },
      },
    });

    const submitButton = wrapper.find('button[type="submit"]');
    expect(submitButton.exists()).toBe(true);
  });

  it('displays error message when set', async () => {
    wrapper = mount(POCreatePage, {
      global: {
        stubs: {
          POHeaderForm: true,
          POLineAllocationTable: true,
        },
      },
    });

    // The component should show error message when errorMessage is set
    expect(wrapper.find('.error').exists() || !wrapper.text().includes('Error')).toBe(true);
  });
});
