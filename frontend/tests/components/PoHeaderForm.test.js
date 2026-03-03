import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PoHeaderForm from '../../src/components/PoHeaderForm.vue';

describe('PoHeaderForm', () => {
  const defaultProps = {
    modelValue: { vendorName: '' },
  };

  it('renders the PO Header title', () => {
    const wrapper = mount(PoHeaderForm, { props: defaultProps });
    expect(wrapper.text()).toContain('PO Header');
  });

  it('renders a Vendor Name label and input', () => {
    const wrapper = mount(PoHeaderForm, { props: defaultProps });
    expect(wrapper.find('label').text()).toBe('Vendor Name');
    expect(wrapper.find('input').exists()).toBe(true);
  });

  it('displays the current vendorName value', () => {
    const wrapper = mount(PoHeaderForm, {
      props: { modelValue: { vendorName: 'PT Maju Jaya' } },
    });
    expect(wrapper.find('input').element.value).toBe('PT Maju Jaya');
  });

  it('emits update:modelValue when typing', async () => {
    const wrapper = mount(PoHeaderForm, { props: defaultProps });
    await wrapper.find('input').setValue('New Vendor');
    const emitted = wrapper.emitted('update:modelValue');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toEqual({ vendorName: 'New Vendor' });
  });

  it('has the required attribute on the input', () => {
    const wrapper = mount(PoHeaderForm, { props: defaultProps });
    expect(wrapper.find('input').attributes('required')).toBeDefined();
  });
});
