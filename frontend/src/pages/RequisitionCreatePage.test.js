import { mount } from '@vue/test-utils';
import { describe, expect, test } from 'vitest';
import RequisitionCreatePage from './RequisitionCreatePage.vue';

const mountPage = () => mount(RequisitionCreatePage, {
  global: {
    stubs: {
      RouterLink: { template: '<a><slot /></a>' },
    },
  },
});

describe('RequisitionCreatePage', () => {
  test('renders required fields and quantity validation constraints', () => {
    const wrapper = mountPage();
    const inputs = wrapper.findAll('input');
    const qtyInput = inputs.find((input) => input.attributes('type') === 'number');

    expect(wrapper.get('h2').text()).toBe('Create Purchase Requisition');
    expect(wrapper.get('input[placeholder="Type..."]').attributes('required')).toBeDefined();
    expect(qtyInput.attributes('min')).toBe('0.01');
    expect(qtyInput.attributes('step')).toBe('0.01');
  });

  test('adds and removes line items without removing the final line', async () => {
    const wrapper = mountPage();

    await wrapper.get('button.btn-outline').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(2);

    await wrapper.findAll('button.btn-danger-icon')[0].trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);

    await wrapper.get('button.btn-danger-icon').trigger('click');
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
  });
});
