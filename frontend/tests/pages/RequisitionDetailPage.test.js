import { describe, it, expect, vi } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import RequisitionDetailPage from '../../src/pages/RequisitionDetailPage.vue';

vi.mock('../../src/api', () => ({
  api: {
    getRequisition: vi.fn().mockResolvedValue({
      id: 'pr-1',
      prNumber: 'PR-2026-0001',
      status: 'DRAFT',
      requesterName: 'Sari',
      departmentName: 'Maintenance',
      title: 'Test',
      notes: null,
      neededByDate: null,
      isBookmarked: false,
      lines: [],
    }),
    submitRequisition: vi.fn(),
    approveRequisition: vi.fn(),
    addBookmark: vi.fn().mockResolvedValue({}),
    removeBookmark: vi.fn().mockResolvedValue({}),
  },
}));

const { api: apiMock } = await import('../../src/api');

async function mountPage() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/requisitions/:id', component: RequisitionDetailPage }],
  });
  router.push('/requisitions/pr-1');
  await router.isReady();

  const wrapper = mount(RequisitionDetailPage, {
    global: { plugins: [router] },
  });
  await flushPromises();
  return wrapper;
}

describe('RequisitionDetailPage bookmark', () => {
  it('toggles bookmark from detail page', async () => {
    const wrapper = await mountPage();

    const bookmarkButton = wrapper.find('.btn-group .btn-outline');
    expect(bookmarkButton.text()).toBe('Bookmark');
    await bookmarkButton.trigger('click');
    await flushPromises();
    expect(apiMock.addBookmark).toHaveBeenCalledWith('PR', 'pr-1');
    expect(bookmarkButton.text()).toBe('Remove Bookmark');
  });
});
