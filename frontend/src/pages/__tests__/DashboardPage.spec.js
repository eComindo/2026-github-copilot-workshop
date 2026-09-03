import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import DashboardPage from '../DashboardPage.vue';
import { api } from '../../api';

vi.mock('../../api', () => ({
  api: {
    getDashboard: vi.fn(),
  },
}));

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: DashboardPage },
      { path: '/requisitions', component: { template: '<div />' } },
      { path: '/requisitions/new', component: { template: '<div />' } },
      { path: '/requisitions/:id', component: { template: '<div />' } },
    ],
  });
}

describe('DashboardPage', () => {
  beforeEach(() => {
    api.getDashboard.mockReset();
  });

  test('renders stat cards with values from the dashboard payload', async () => {
    api.getDashboard.mockResolvedValue({
      totalPr: 3,
      draftPr: 1,
      submittedPr: 1,
      approvedPr: 1,
      recentPr: [],
    });

    const router = makeRouter();
    router.push('/');
    await router.isReady();

    const wrapper = mount(DashboardPage, { global: { plugins: [router] } });
    await flushPromises();

    const values = wrapper.findAll('.stat-card-value').map((el) => el.text());
    expect(values).toEqual(['3', '1', '1', '1']);
  });

  test('renders one row per recent requisition', async () => {
    api.getDashboard.mockResolvedValue({
      totalPr: 2,
      draftPr: 0,
      submittedPr: 0,
      approvedPr: 2,
      recentPr: [
        { id: 'pr-1', prNumber: 'PR-2026-0001', requesterName: 'Rina', status: 'APPROVED', createdAt: null },
        { id: 'pr-2', prNumber: 'PR-2026-0002', requesterName: 'Budi', status: 'APPROVED', createdAt: null },
      ],
    });

    const router = makeRouter();
    router.push('/');
    await router.isReady();

    const wrapper = mount(DashboardPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.text()).toContain('PR-2026-0001');
    expect(wrapper.text()).toContain('PR-2026-0002');
  });
});

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}
