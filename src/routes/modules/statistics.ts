import type { RouteRecordRaw } from 'vue-router';
import { h } from 'vue';

export const statisticsRoute: RouteRecordRaw = {
  path: '/statistics',
  name: 'Statistics',
  meta: {
    title: '统计报表',
    icon: 'PieChart',
  },
  children: [
    {
      path: 'sales',
      name: 'SalesStatistics',
      component: {
        render() {
          return h('div', 'Sales Statistics Page');
        },
      },
      meta: {
        title: '销售报表',
        permission: ['statistics:sales'],
        icon: 'ShoppingCart',
      },
    },
  ],
};
