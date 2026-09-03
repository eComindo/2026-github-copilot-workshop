import { describe, test, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { createRouter, createMemoryHistory } from 'vue-router';
import PurchaseOrderCreatePage from '../PurchaseOrderCreatePage.vue';

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/purchase-orders', component: { template: '<div />' } },
      { path: '/purchase-orders/new', component: PurchaseOrderCreatePage },
    ],
  });
}

describe('PurchaseOrderCreatePage', () => {
  test('renders the header form and line allocation table', async () => {
    const router = makeRouter();
    router.push('/purchase-orders/new');
    await router.isReady();

    const wrapper = mount(PurchaseOrderCreatePage, { global: { plugins: [router] } });

    expect(wrapper.text()).toContain('Create Purchase Order');
    expect(wrapper.text()).toContain('PO Header');
    expect(wrapper.text()).toContain('Approved PR Lines');
    expect(wrapper.find('button.btn-primary').text()).toBe('Save As Draft');
  });
});
