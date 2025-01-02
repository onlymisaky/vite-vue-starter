import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/Layout.vue';
import { FORBIDDEN_ROUTE_NAME, LOGIN_ROUTE_NAME, NOT_FOUND_ROUTE_NAME } from './constant';
import { contentRoute } from './modules/content';
import { dataRoute } from './modules/data';
import { messageRoute } from './modules/message';
import { personalRoute } from './modules/personal';
import { resourceRoute } from './modules/resource';
import { statisticsRoute } from './modules/statistics';
import { systemRoute } from './modules/system';
import { workflowRoute } from './modules/workflow';

export const layoutRoute: RouteRecordRaw = {
  path: '/',
  name: 'Layout',
  component: Layout,
  children: [
    contentRoute,
    dataRoute,
    messageRoute,
    personalRoute,
    resourceRoute,
    statisticsRoute,
    systemRoute,
    workflowRoute,
    {
      path: '/403',
      name: FORBIDDEN_ROUTE_NAME,
      component: () => import('@/views/Error/Forbidden.vue'),
      meta: {
        title: '403',
        hideInMenu: true,
      },
    },
  ],
};

export const routes: RouteRecordRaw[] = [
  layoutRoute,
  {
    path: '/login',
    name: LOGIN_ROUTE_NAME,
    component: () => import('@/views/Login/Login.vue'),
    meta: {
      title: '登录',
      hidden: true,
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: NOT_FOUND_ROUTE_NAME,
    component: () => import('@/views/Error/NotFound.vue'),
    meta: {
      title: '404',
    },
  },
];
