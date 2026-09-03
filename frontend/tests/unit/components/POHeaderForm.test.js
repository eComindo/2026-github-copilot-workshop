import { describe, it, expect, beforeEach, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import POHeaderForm from '../../../src/components/POHeaderForm.vue';
import * as apiModule from '../../../src/api';

vi.mock('../../../src/api', () => ({
  api: {
    listRequisitions: vi.fn(),
  },
}));

describe('POHeaderForm.vue', () => {
  let wrapper;
  const mockPRs = [
    { id: 1, prNumber: 'PR-001', title: 'Item Purchase', status: 'APPROVED' },
    { id: 2, prNumber: 'PR-002', title: 'Equipment', status: 'APPROVED' },
    { id: 3, prNumber: 'PR-003', title: 'Services', status: 'DRAFT' },
  ];

  beforeEach(() => {
    apiModule.api.listRequisitions.mockResolvedValue({ items: mockPRs });
  });

  it('renders form with title', async () => {
    wrapper = mount(POHeaderForm, {
      props: {
        modelValue: {
          prId: '',
          supplierName: '',
          poTitle: '',
          deliveryDate: '',
          deliveryAddress: '',
          notes: '',
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('PO Header');
    expect(wrapper.find('select').exists()).toBe(true);
  });

  it('loads and displays only APPROVED PRs on mount', async () => {
    wrapper = mount(POHeaderForm, {
      props: {
        modelValue: {
          prId: '',
          supplierName: '',
          poTitle: '',
          deliveryDate: '',
          deliveryAddress: '',
          notes: '',
        },
      },
    });

    await flushPromises();

    const options = wrapper.findAll('select option');
    const approvedPRs = options.filter((opt) => opt.text().includes('PR-001') || opt.text().includes('PR-002'));
    const draftPR = options.filter((opt) => opt.text().includes('PR-003'));

    expect(approvedPRs.length).toBe(2);
    expect(draftPR.length).toBe(0);
  });

  it('emits update:modelValue when form data changes', async () => {
    wrapper = mount(POHeaderForm, {
      props: {
        modelValue: {
          prId: '',
          supplierName: '',
          poTitle: '',
          deliveryDate: '',
          deliveryAddress: '',
          notes: '',
        },
      },
    });

    await flushPromises();

    const supplierInput = wrapper.find('input[placeholder="Type supplier name..."]');
    await supplierInput.setValue('Test Supplier');

    const updates = wrapper.emitted('update:modelValue');
    expect(updates.length).toBeGreaterThan(0);
    expect(updates[updates.length - 1][0].supplierName).toBe('Test Supplier');
  });

  it('validates supplier name on blur', async () => {
    wrapper = mount(POHeaderForm, {
      props: {
        modelValue: {
          prId: '',
          supplierName: '',
          poTitle: '',
          deliveryDate: '',
          deliveryAddress: '',
          notes: '',
        },
      },
    });

    await flushPromises();

    const supplierInput = wrapper.find('input[placeholder="Type supplier name..."]');
    await supplierInput.setValue('');
    await supplierInput.trigger('blur');

    const errors = wrapper.emitted('error');
    expect(errors).toBeDefined();
    expect(errors[errors.length - 1][0]).toContain('Supplier name is required');
  });

  it('emits error when PR list fails to load', async () => {
    apiModule.api.listRequisitions.mockRejectedValueOnce(new Error('Network error'));

    wrapper = mount(POHeaderForm, {
      props: {
        modelValue: {
          prId: '',
          supplierName: '',
          poTitle: '',
          deliveryDate: '',
          deliveryAddress: '',
          notes: '',
        },
      },
    });

    await flushPromises();

    const errors = wrapper.emitted('error');
    expect(errors).toBeDefined();
    expect(errors[0][0]).toBe('Network error');
  });

  it('updates form when modelValue prop changes', async () => {
    const initialValue = {
      prId: '',
      supplierName: '',
      poTitle: '',
      deliveryDate: '',
      deliveryAddress: '',
      notes: '',
    };

    wrapper = mount(POHeaderForm, {
      props: { modelValue: initialValue },
    });

    await flushPromises();

    const newValue = {
      prId: '1',
      supplierName: 'Supplier A',
      poTitle: 'Purchase Title',
      deliveryDate: '2026-09-10',
      deliveryAddress: '123 Main St',
      notes: 'Rush order',
    };

    await wrapper.setProps({ modelValue: newValue });
    await wrapper.vm.$nextTick();

    const supplierInput = wrapper.find('input[placeholder="Type supplier name..."]');
    expect(supplierInput.element.value).toBe('Supplier A');
  });
});
