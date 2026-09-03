import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { reactive } from 'vue';
import PoHeaderForm from '../PoHeaderForm.vue';

describe('PoHeaderForm', () => {
  test('renders vendor, delivery address, and delivery date fields', () => {
    const form = reactive({ vendorName: '', deliveryAddress: '', deliveryDate: '' });
    const wrapper = mount(PoHeaderForm, { props: { form } });

    expect(wrapper.find('label:first-of-type').text()).toBe('Vendor Name');
    expect(wrapper.findAll('input')).toHaveLength(3);
  });

  test('updates the bound form when the vendor name input changes', async () => {
    const form = reactive({ vendorName: '', deliveryAddress: '', deliveryDate: '' });
    const wrapper = mount(PoHeaderForm, { props: { form } });

    const vendorInput = wrapper.findAll('input')[0];
    await vendorInput.setValue('PT Supplier Jaya');

    expect(form.vendorName).toBe('PT Supplier Jaya');
  });
});
