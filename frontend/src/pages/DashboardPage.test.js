import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import DashboardPage from './DashboardPage.vue';
import { api } from '../api';

vi.mock('../api', () => ({
  api: {
    getDashboard: vi.fn(),
  },
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(api.getDashboard).mockReset();
  });

  test('renders dashboard statistics and recent requisitions', async () => {
    vi.mocked(api.getDashboard).mockResolvedValue({
      totalPr: 4,
      draftPr: 1,
      submittedPr: 2,
      approvedPr: 1,
      recentPr: [{
        id: 'pr-1',
        prNumber: 'PR-2026-0001',
        requesterName: 'Rina',
        status: 'APPROVED',
        createdAt: '2026-05-01T00:00:00.000Z',
      }],
    });

    const wrapper = mount(DashboardPage, {
      global: {
        stubs: {
          RouterLink: { template: '<a><slot /></a>' },
        },
      },
    });
    await flushPromises();

    expect(api.getDashboard).toHaveBeenCalledTimes(1);
    expect(wrapper.text()).toContain('Open PR');
    expect(wrapper.text()).toContain('4');
    expect(wrapper.text()).toContain('PR-2026-0001');
    expect(wrapper.find('.status-badge').classes()).toContain('approved');
  });
});
