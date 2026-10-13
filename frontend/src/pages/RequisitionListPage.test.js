import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import RequisitionListPage from './RequisitionListPage.vue';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    listRequisitions: vi.fn(),
  },
}));

const mountPage = () => mount(RequisitionListPage, {
  global: {
    stubs: {
      RouterLink: { template: '<a><slot /></a>' },
    },
  },
});

describe('RequisitionListPage', () => {
  beforeEach(() => {
    vi.mocked(api.listRequisitions).mockReset();
  });

  test('renders requisition rows returned by the list service', async () => {
    vi.mocked(api.listRequisitions).mockResolvedValue({
      items: [{
        id: 'pr-1',
        prNumber: 'PR-2026-0001',
        requesterName: 'Rina',
        departmentName: 'Operations',
        title: 'Safety helmets',
        status: 'SUBMITTED',
        neededByDate: '2026-06-15',
      }],
    });

    const wrapper = mountPage();
    await flushPromises();

    expect(api.listRequisitions).toHaveBeenCalledTimes(1);
    expect(wrapper.findAll('tbody tr')).toHaveLength(1);
    expect(wrapper.text()).toContain('Safety helmets');
    expect(wrapper.find('.status-badge').classes()).toContain('submitted');
  });

  test('shows the service error when the list cannot load', async () => {
    vi.mocked(api.listRequisitions).mockRejectedValue(new Error('Unable to load requisitions'));

    const wrapper = mountPage();
    await flushPromises();

    expect(wrapper.find('.error').text()).toBe('Unable to load requisitions');
  });
});
