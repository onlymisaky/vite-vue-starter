import type { RouteRecordRaw } from 'vue-router';

const route: RouteRecordRaw = {
  path: '/domain',
  name: 'domain',
  component: () => import('./DomainList.vue'),
  meta: {
    title: '业务',
    cache: true,
  },
};

export default route;
