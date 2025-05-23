import type { RouteRecordRaw } from 'vue-router';

export const domainRoute: RouteRecordRaw = {
  path: '/domain',
  name: 'domain',
  component: () => import('./DomainList.vue'),
  meta: {
    title: '业务',
    cache: true,
  },
};
