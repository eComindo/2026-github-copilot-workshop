import { describe, test, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import RequisitionListPage from '../RequisitionListPage.vue';
import { api } from '../../api';

vi.mock('../../api', () => ({
  api: {
    listRequisitions: vi.fn(),
  },
}));

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: { template: '<div />' } },
      { path: '/requisitions', component: RequisitionListPage },
      { path: '/requisitions/new', component: { template: '<div />' } },
      { path: '/requisitions/:id', component: { template: '<div />' } },
    ],
  });
}

function flushPromises() {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('RequisitionListPage', () => {
  beforeEach(() => {
    api.listRequisitions.mockReset();
  });

  test('renders a table row for each requisition', async () => {
    api.listRequisitions.mockResolvedValue({
      items: [
        { id: 'pr-1', prNumber: 'PR-2026-0001', requesterName: 'Rina', departmentName: 'Ops', title: 'Spare parts', status: 'DRAFT', neededByDate: '2026-06-15' },
        { id: 'pr-2', prNumber: 'PR-2026-0002', requesterName: 'Budi', departmentName: 'IT', title: 'Laptops', status: 'APPROVED', neededByDate: null },
      ],
    });

    const router = makeRouter();
    router.push('/requisitions');
    await router.isReady();

    const wrapper = mount(RequisitionListPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(2);
    expect(wrapper.text()).toContain('PR-2026-0001');
    expect(wrapper.text()).toContain('Rina');
    expect(wrapper.find('.status-badge').text()).toBe('DRAFT');
  });

  test('shows an empty table when there are no requisitions', async () => {
    api.listRequisitions.mockResolvedValue({ items: [] });

    const router = makeRouter();
    router.push('/requisitions');
    await router.isReady();

    const wrapper = mount(RequisitionListPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.findAll('tbody tr')).toHaveLength(0);
    expect(wrapper.find('.error').exists()).toBe(false);
  });

  test('shows an error message when the API call fails', async () => {
    api.listRequisitions.mockRejectedValue(new Error('Network error'));

    const router = makeRouter();
    router.push('/requisitions');
    await router.isReady();

    const wrapper = mount(RequisitionListPage, { global: { plugins: [router] } });
    await flushPromises();

    expect(wrapper.find('.error').text()).toBe('Network error');
  });
});
