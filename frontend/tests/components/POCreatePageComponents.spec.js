/**
 * Frontend component tests for PO Create page components
 * Focus: Component rendering, form validation, user interactions
 */

import { describe, test, expect, beforeEach, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import POHeaderForm from '../../src/components/POHeaderForm.vue';
import PRLineSelector from '../../src/components/PRLineSelector.vue';
import POLineAllocationTable from '../../src/components/POLineAllocationTable.vue';

// ═════════════════════════════════════════════════════════════
// PO HEADER FORM COMPONENT TESTS
// ═════════════════════════════════════════════════════════════

describe('POHeaderForm.vue - Component Rendering & Validation', () => {
  test('renders vendor name input field', () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: '' },
    });

    const input = wrapper.find('input#vendor-name');
    expect(input.exists()).toBe(true);
    expect(input.attributes('type')).toBe('text');
    expect(input.attributes('placeholder')).toBe('Enter vendor name');
  });

  test('displays "Vendor Name *" label as required', () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: '' },
    });

    const label = wrapper.find('label[for="vendor-name"]');
    expect(label.text()).toContain('Vendor Name *');
  });

  test('v-model updates vendor name value', async () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: '' },
    });

    const input = wrapper.find('input#vendor-name');
    await input.setValue('Acme Supplies');

    expect(wrapper.emitted('update:vendor-name')).toBeTruthy();
    expect(wrapper.emitted('update:vendor-name')[0]).toEqual(['Acme Supplies']);
  });

  test('validateVendorName() returns false for empty vendor name', async () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: '' },
    });

    const isValid = wrapper.vm.validateVendorName();

    expect(isValid).toBe(false);
  });

  test('validateVendorName() returns true for non-empty vendor name', async () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: 'Valid Vendor' },
    });

    const isValid = wrapper.vm.validateVendorName();

    expect(isValid).toBe(true);
  });

  test('displays error message when validation fails', async () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: '' },
    });

    wrapper.vm.validateVendorName();
    await wrapper.vm.$nextTick();

    const errorMsg = wrapper.find('.field-error');
    expect(errorMsg.exists()).toBe(true);
    expect(errorMsg.text()).toContain('Vendor name is required');
  });

  test('clears error message when vendor name becomes valid', async () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: '' },
    });

    // Validate (should fail)
    wrapper.vm.validateVendorName();
    await wrapper.vm.$nextTick();

    let errorMsg = wrapper.find('.field-error');
    expect(errorMsg.exists()).toBe(true);

    // Set valid vendor name
    const input = wrapper.find('input#vendor-name');
    await input.setValue('Valid Vendor');
    wrapper.vm.validateVendorName();
    await wrapper.vm.$nextTick();

    errorMsg = wrapper.find('.field-error');
    expect(errorMsg.exists()).toBe(false);
  });

  test('isValid computed property reflects validation state', async () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: '' },
    });

    expect(wrapper.vm.isValid).toBe(false);

    const input = wrapper.find('input#vendor-name');
    await input.setValue('Vendor Name');

    expect(wrapper.vm.isValid).toBe(true);
  });

  test('updates local vendor name when prop changes', async () => {
    const wrapper = mount(POHeaderForm, {
      props: { vendorName: 'Initial' },
    });

    expect(wrapper.vm.vendorName).toBe('Initial');

    await wrapper.setProps({ vendorName: 'Updated' });

    expect(wrapper.vm.vendorName).toBe('Updated');
  });
});

// ═════════════════════════════════════════════════════════════
// PR LINE SELECTOR COMPONENT TESTS
// ═════════════════════════════════════════════════════════════

describe('PRLineSelector.vue - Rendering & Selection', () => {
  const mockPrLines = [
    {
      id: 'pr-line-1',
      pr_number: 'PR-2026-0001',
      line_no: 1,
      item_code: 'ITEM-001',
      item_name: 'Item A',
      qty_requested: 100,
      qty_allocated: 0,
      est_unit_price: 50.0,
      uom: 'PCS',
      site_code: 'WH-01',
      required_date: '2026-09-15',
    },
    {
      id: 'pr-line-2',
      pr_number: 'PR-2026-0001',
      line_no: 2,
      item_code: 'ITEM-002',
      item_name: 'Item B',
      qty_requested: 50,
      qty_allocated: 20,
      est_unit_price: 100.0,
      uom: 'PACK',
      site_code: 'WH-01',
      required_date: '2026-09-20',
    },
  ];

  test('renders table with PR lines', () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: mockPrLines,
        selectedLineIds: [],
        loading: false,
        error: null,
      },
    });

    const table = wrapper.find('table.selector-table');
    expect(table.exists()).toBe(true);

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(2);
  });

  test('displays correct column headers', () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: mockPrLines,
        selectedLineIds: [],
        loading: false,
        error: null,
      },
    });

    const headers = wrapper.findAll('th');
    const headerTexts = headers.map((h) => h.text());

    expect(headerTexts).toContain('PR #');
    expect(headerTexts).toContain('Item Code');
    expect(headerTexts).toContain('Item Name');
    expect(headerTexts).toContain('Open Qty');
  });

  test('calculates and displays Open Qty (qty_requested - qty_allocated)', () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: [
          {
            id: 'l-1',
            pr_number: 'PR-1',
            line_no: 1,
            item_code: 'A',
            item_name: 'A',
            qty_requested: 100,
            qty_allocated: 30,
            est_unit_price: 10.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: '2026-09-15',
          },
        ],
        selectedLineIds: [],
        loading: false,
        error: null,
      },
    });

    // Component calculates openQty in computed property
    const openQtyCell = wrapper.find('td.open-qty');
    expect(openQtyCell.text()).toBe('70.00'); // 100 - 30
  });

  test('highlights fully allocated lines in red', () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: [
          {
            id: 'l-1',
            pr_number: 'PR-1',
            line_no: 1,
            item_code: 'A',
            item_name: 'A',
            qty_requested: 50,
            qty_allocated: 50, // Fully allocated
            est_unit_price: 10.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: null,
          },
        ],
        selectedLineIds: [],
        loading: false,
        error: null,
      },
    });

    const openQtyCell = wrapper.find('td.open-qty');
    expect(openQtyCell.classes()).toContain('no-open-qty');
  });

  test('emits update:selected-line-ids when checkbox checked', async () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: mockPrLines,
        selectedLineIds: [],
        loading: false,
        error: null,
      },
    });

    const checkbox = wrapper.findAll('input[type="checkbox"]')[1]; // Skip "select all"
    await checkbox.setValue(true);

    const emitted = wrapper.emitted('update:selected-line-ids');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toContain('pr-line-1');
  });

  test('getSelectedLines() returns full line objects for selected IDs', () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: mockPrLines,
        selectedLineIds: ['pr-line-1'],
        loading: false,
        error: null,
      },
    });

    const selected = wrapper.vm.getSelectedLines();

    expect(selected).toHaveLength(1);
    expect(selected[0].item_code).toBe('ITEM-001');
  });

  test('displays loading state when loading prop is true', () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: [],
        selectedLineIds: [],
        loading: true,
        error: null,
      },
    });

    const loadingState = wrapper.find('.loading-state');
    expect(loadingState.exists()).toBe(true);
    expect(loadingState.text()).toContain('Loading');
  });

  test('displays error message when error prop is set', () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: [],
        selectedLineIds: [],
        loading: false,
        error: 'Database connection failed',
      },
    });

    const errorState = wrapper.find('.error-state');
    expect(errorState.exists()).toBe(true);
    expect(errorState.text()).toContain('Database connection failed');
  });

  test('displays empty state when no lines available', () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: [],
        selectedLineIds: [],
        loading: false,
        error: null,
      },
    });

    const emptyState = wrapper.find('.empty-state');
    expect(emptyState.exists()).toBe(true);
  });

  test('shows selection summary counter', async () => {
    const wrapper = mount(PRLineSelector, {
      props: {
        lines: mockPrLines,
        selectedLineIds: ['pr-line-1', 'pr-line-2'],
        loading: false,
        error: null,
      },
    });

    const summary = wrapper.find('.summary-text');
    expect(summary.text()).toContain('2 lines selected');
  });
});

// ═════════════════════════════════════════════════════════════
// PO LINE ALLOCATION TABLE COMPONENT TESTS
// ═════════════════════════════════════════════════════════════

describe('POLineAllocationTable.vue - Rendering & Validation', () => {
  const mockPoLines = [
    {
      id: 'line-1',
      item_code: 'ITEM-001',
      item_name: 'Widget A',
      openQty: 100,
      qtyOrdered: 50,
      unitPrice: 25.0,
      uom: 'PCS',
      site_code: 'WH-01',
      required_date: '2026-09-15',
    },
  ];

  test('renders table with PO line items', () => {
    const wrapper = mount(POLineAllocationTable, {
      props: { lines: mockPoLines },
    });

    const table = wrapper.find('table.lines-table');
    expect(table.exists()).toBe(true);

    const rows = wrapper.findAll('tbody tr');
    expect(rows).toHaveLength(1);
  });

  test('displays empty state when no lines', () => {
    const wrapper = mount(POLineAllocationTable, {
      props: { lines: [] },
    });

    const emptyState = wrapper.find('.empty-state');
    expect(emptyState.exists()).toBe(true);
  });

  test('renders quantity input field', () => {
    const wrapper = mount(POLineAllocationTable, {
      props: { lines: mockPoLines },
    });

    const input = wrapper.find('input.qty-input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('type')).toBe('number');
  });

  test('renders unit price input field', () => {
    const wrapper = mount(POLineAllocationTable, {
      props: { lines: mockPoLines },
    });

    const input = wrapper.find('input.price-input');
    expect(input.exists()).toBe(true);
    expect(input.attributes('type')).toBe('number');
  });

  test('validates qty ordered <= open qty', async () => {
    const wrapper = mount(POLineAllocationTable, {
      props: {
        lines: [
          {
            id: 'l-1',
            item_code: 'A',
            item_name: 'A',
            openQty: 50,
            qtyOrdered: 60, // Exceeds open qty
            unitPrice: 10.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: null,
          },
        ],
      },
    });

    wrapper.vm.validateLineQuantity(0);
    await wrapper.vm.$nextTick();

    const errors = wrapper.vm.getLineErrors();
    expect(errors[0]).toContain('Cannot exceed open qty');
  });

  test('rejects qty ordered <= 0', async () => {
    const wrapper = mount(POLineAllocationTable, {
      props: {
        lines: [
          {
            id: 'l-1',
            item_code: 'A',
            item_name: 'A',
            openQty: 50,
            qtyOrdered: 0,
            unitPrice: 10.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: null,
          },
        ],
      },
    });

    wrapper.vm.validateLineQuantity(0);
    await wrapper.vm.$nextTick();

    const errors = wrapper.vm.getLineErrors();
    expect(errors[0]).toContain('Qty must be greater than 0');
  });

  test('validateAll() returns true when all lines valid', () => {
    const wrapper = mount(POLineAllocationTable, {
      props: {
        lines: [
          {
            id: 'l-1',
            item_code: 'A',
            item_name: 'A',
            openQty: 50,
            qtyOrdered: 30,
            unitPrice: 10.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: null,
          },
        ],
      },
    });

    const result = wrapper.vm.validateAll();

    expect(result).toBe(true);
  });

  test('validateAll() returns false when any line invalid', () => {
    const wrapper = mount(POLineAllocationTable, {
      props: {
        lines: [
          {
            id: 'l-1',
            item_code: 'A',
            item_name: 'A',
            openQty: 50,
            qtyOrdered: 60, // Invalid
            unitPrice: 10.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: null,
          },
        ],
      },
    });

    const result = wrapper.vm.validateAll();

    expect(result).toBe(false);
  });

  test('emits remove-line with correct index when remove button clicked', async () => {
    const wrapper = mount(POLineAllocationTable, {
      props: { lines: mockPoLines },
    });

    const removeBtn = wrapper.find('button.btn-remove');
    await removeBtn.trigger('click');

    const emitted = wrapper.emitted('remove-line');
    expect(emitted).toBeTruthy();
    expect(emitted[0][0]).toBe(0); // First line
  });

  test('calculates and displays total value', () => {
    const wrapper = mount(POLineAllocationTable, {
      props: {
        lines: [
          {
            id: 'l-1',
            item_code: 'A',
            item_name: 'A',
            openQty: 50,
            qtyOrdered: 10,
            unitPrice: 100.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: null,
          },
          {
            id: 'l-2',
            item_code: 'B',
            item_name: 'B',
            openQty: 20,
            qtyOrdered: 5,
            unitPrice: 50.0,
            uom: 'PACK',
            site_code: 'WH',
            required_date: null,
          },
        ],
      },
    });

    const totalValue = wrapper.vm.calculateTotalValue();
    // (10 * 100) + (5 * 50) = 1000 + 250 = 1250
    expect(totalValue).toBe('1250.00');
  });

  test('displays total lines count in summary', async () => {
    const wrapper = mount(POLineAllocationTable, {
      props: {
        lines: mockPoLines.concat({
          id: 'l-2',
          item_code: 'B',
          item_name: 'B',
          openQty: 30,
          qtyOrdered: 20,
          unitPrice: 50.0,
          uom: 'PACK',
          site_code: 'WH',
          required_date: null,
        }),
      },
    });

    const summary = wrapper.find('.summary-stat:first-child');
    // Check for "Total Lines:" with or without space before number
    expect(summary.text()).toMatch(/Total Lines:\s*2/);
  });

  test('displays inline error when qty validation fails', async () => {
    const wrapper = mount(POLineAllocationTable, {
      props: {
        lines: [
          {
            id: 'l-1',
            item_code: 'A',
            item_name: 'A',
            openQty: 50,
            qtyOrdered: 60,
            unitPrice: 10.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: null,
          },
        ],
      },
    });

    wrapper.vm.validateLineQuantity(0);
    await wrapper.vm.$nextTick();

    const errorMsg = wrapper.find('.field-error');
    expect(errorMsg.exists()).toBe(true);
    expect(errorMsg.text()).toContain('Cannot exceed open qty');
  });

  test('emits validation-change event when validation state changes', async () => {
    const wrapper = mount(POLineAllocationTable, {
      props: {
        lines: [
          {
            id: 'l-1',
            item_code: 'A',
            item_name: 'A',
            openQty: 50,
            qtyOrdered: 30,
            unitPrice: 10.0,
            uom: 'PCS',
            site_code: 'WH',
            required_date: null,
          },
        ],
      },
    });

    wrapper.vm.validateLineQuantity(0);

    const emitted = wrapper.emitted('validation-change');
    expect(emitted).toBeTruthy();
  });
});
