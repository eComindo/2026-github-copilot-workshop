import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import RequisitionListPage from '../../src/pages/RequisitionListPage.vue';
import { api } from '../../src/api';

vi.mock('../../src/api', () => ({
  api: {
    listRequisitions: vi.fn(),
  },
}));

describe('RequisitionListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('renders requisition rows from API response', async () => {
    api.listRequisitions.mockResolvedValue({
      items: [
        {
          id: 'pr-1',
          prNumber: 'PR-2026-0001',
          requesterName: 'Ari',
          departmentName: 'OPS',
          title: 'Office chair',
          status: 'APPROVED',
          neededByDate: '2026-06-01',
        },
      ],
    });

    const wrapper = mount(RequisitionListPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    await flushPromises();

    expect(api.listRequisitions).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('Purchase Requisitions');
    expect(wrapper.text()).toContain('PR-2026-0001');
    expect(wrapper.text()).toContain('Ari');
    expect(wrapper.text()).toContain('APPROVED');
  });

  test('shows API error message when loading fails', async () => {
    api.listRequisitions.mockRejectedValue(new Error('Service unavailable'));

    const wrapper = mount(RequisitionListPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });

    await flushPromises();

    expect(wrapper.text()).toContain('Service unavailable');
  });
});
