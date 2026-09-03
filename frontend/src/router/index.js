import { createRouter, createWebHistory } from 'vue-router';
import DashboardPage from '../pages/DashboardPage.vue';
import RequisitionListPage from '../pages/RequisitionListPage.vue';
import RequisitionCreatePage from '../pages/RequisitionCreatePage.vue';
import RequisitionDetailPage from '../pages/RequisitionDetailPage.vue';
import POCreatePageNew from '../pages/POCreatePageNew.vue';
import POListPage from '../pages/POListPage.vue';
import PODetailPage from '../pages/PODetailPage.vue';
const routes = [
  { path: '/', name: 'dashboard', component: DashboardPage },
  { path: '/requisitions', name: 'requisitions-list', component: RequisitionListPage },
  { path: '/requisitions/new', name: 'requisitions-create', component: RequisitionCreatePage },
  { path: '/requisitions/:id', name: 'requisitions-detail', component: RequisitionDetailPage, props: true },
  {
  path: '/purchase-orders',
  name: 'purchase-orders-list',
  component: POListPage,
},
  {
  path: '/purchase-orders/:id',
  name: 'purchase-orders-detail',
  component: PODetailPage,
  props: true,
},
  {
  path: '/po-create',
  name: 'POCreate',
  component: POCreatePageNew,
}
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
