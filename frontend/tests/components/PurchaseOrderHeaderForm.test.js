import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PurchaseOrderHeaderForm from '../../src/components/PurchaseOrderHeaderForm.vue';

function buildModelValue() {
  return {
    poNumber: '',
    vendorName: '',
    orderDate: '',
    expectedDeliveryDate: '',
    paymentTerms: 'Net 30',
    currency: 'IDR',
    sourcePrNumber: '',
    notes: '',
  };
}

describe('PurchaseOrderHeaderForm', () => {
  test('marks vendor field as required', () => {
    const wrapper = mount(PurchaseOrderHeaderForm, {
      props: {
        modelValue: buildModelValue(),
      },
    });

    const vendorInput = wrapper.find('input[required]');

    expect(vendorInput.exists()).toBe(true);
    expect(vendorInput.attributes('placeholder')).toBe('Type...');
  });

  test('emits updated model when vendor name changes', async () => {
    const modelValue = buildModelValue();
    const wrapper = mount(PurchaseOrderHeaderForm, {
      props: {
        modelValue,
      },
    });

    const vendorInput = wrapper.find('input[required]');
    await vendorInput.setValue('PT Sumber Maju');

    const emits = wrapper.emitted('update:modelValue');
    expect(emits).toBeTruthy();
    expect(emits[0][0]).toEqual({
      ...modelValue,
      vendorName: 'PT Sumber Maju',
    });
  });
});
