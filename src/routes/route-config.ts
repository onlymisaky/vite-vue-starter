import type { RouteRecordRaw } from 'vue-router';
import Layout from '@/layout/Layout.vue';

import { h } from 'vue';
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
      component: {
        render() {
          return h('div', 'Forbidden Page');
        },
      },
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
    component: {
      render() {
        return h('div', 'Login Page');
      },
    },
    meta: {
      title: '登录',
    },
  },
  {
    path: '/404',
    name: NOT_FOUND_ROUTE_NAME,
    component: {
      render() {
        return h('div', 'NotFound Page');
      },
    },
    meta: {
      title: '404',
    },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: {
      render() {
        return h('div', 'NotFound Page');
      },
    },
    meta: {
      title: '404',
    },
  },
];
