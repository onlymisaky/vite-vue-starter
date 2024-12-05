import type { RouteRecordRaw } from 'vue-router';
import { h } from 'vue';

export const personalRoute: RouteRecordRaw = {
  path: '/personal',
  name: 'Personal',
  component: {
    render() {
      return h('div', 'Personal Page');
    },
  },
  meta: {
    title: '个人中心',
    hideInMenu: true,
    icon: 'User',
    permission: ['personal:view'],
  },
};
