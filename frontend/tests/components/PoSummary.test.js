import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import PoSummary from '../../src/components/PoSummary.vue';

describe('PoSummary', () => {
  it('renders the two summary labels', () => {
    const wrapper = mount(PoSummary);
    expect(wrapper.text()).toContain('Selected Lines');
    expect(wrapper.text()).toContain('Estimated Total');
  });

  it('displays zero values by default', () => {
    const wrapper = mount(PoSummary);
    const values = wrapper.findAll('.po-summary-value');
    expect(values[0].text()).toBe('0');
    expect(values[1].text()).toBe('0.00');
  });

  it('displays the selected count', () => {
    const wrapper = mount(PoSummary, { props: { selectedCount: 3, estimatedTotal: 0 } });
    const values = wrapper.findAll('.po-summary-value');
    expect(values[0].text()).toBe('3');
  });

  it('formats the estimated total with commas and decimals', () => {
    const wrapper = mount(PoSummary, {
      props: { selectedCount: 2, estimatedTotal: 1234567.5 },
    });
    const values = wrapper.findAll('.po-summary-value');
    expect(values[1].text()).toBe('1,234,567.50');
  });

  it('formats zero total as 0.00', () => {
    const wrapper = mount(PoSummary, {
      props: { selectedCount: 0, estimatedTotal: 0 },
    });
    const values = wrapper.findAll('.po-summary-value');
    expect(values[1].text()).toBe('0.00');
  });
});
