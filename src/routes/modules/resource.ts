import type { RouteRecordRaw } from 'vue-router';
import { h } from 'vue';

export const resourceRoute: RouteRecordRaw = {
  path: '/resource',
  name: 'Resource',
  component: {
    render() {
      return h('div', 'Resource Page');
    },
  },
  meta: {
    title: '资源管理',
    icon: 'FolderOpened',
    permission: ['resource:view'],
  },
};
