import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from '../pages/DashboardPage.vue';
import RequisitionListPage from '../pages/RequisitionListPage.vue';
import RequisitionCreatePage from '../pages/RequisitionCreatePage.vue';
import RequisitionDetailPage from '../pages/RequisitionDetailPage.vue';
import PurchaseOrderCreatePage from '../pages/PurchaseOrderCreatePage.vue';
import PurchaseOrderListPage from '../pages/PurchaseOrderListPage.vue';
import PurchaseOrderDetailPage from '../pages/PurchaseOrderDetailPage.vue';

const routes = [
  { path: '/', name: 'dashboard', component: DashboardPage },
  { path: '/requisitions', name: 'requisitions-list', component: RequisitionListPage },
  { path: '/requisitions/new', name: 'requisitions-create', component: RequisitionCreatePage },
  { path: '/requisitions/:id', name: 'requisitions-detail', component: RequisitionDetailPage, props: true },
  { path: '/purchase-order', name: 'purchase-order-list', component: PurchaseOrderListPage },
  { path: '/purchase-order/new', name: 'purchase-order-create', component: PurchaseOrderCreatePage },
  { path: '/purchase-order/:id', name: 'purchase-order-detail', component: PurchaseOrderDetailPage, props: true },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
