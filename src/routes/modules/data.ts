import type { RouteRecordRaw } from 'vue-router';
import { h } from 'vue';

export const dataRoute: RouteRecordRaw = {
  path: '/data',
  name: 'DataCenter',
  meta: {
    title: '数据中心',
    icon: 'DataLine',
  },
  children: [
    {
      path: 'analysis',
      name: 'DataAnalysis',
      meta: {
        title: '数据分析',
        icon: 'TrendCharts',
      },
      children: [
        {
          path: 'monitor',
          name: 'Monitor',
          meta: {
            title: '实时监控',
            icon: 'Monitor',
          },
          children: [
            {
              path: 'performance',
              name: 'Performance',
              component: {
                render() {
                  return h('div', 'Performance Page');
                },
              },
              meta: {
                title: '性能指标',
                permission: ['data:performance'],
                icon: 'Odometer',
              },
            },
            {
              path: 'alert',
              name: 'Alert',
              component: {
                render() {
                  return h('div', 'Alert Page');
                },
              },
              meta: {
                title: '告警信息',
                permission: ['data:alert'],
                icon: 'Warning',
              },
            },
          ],
        },
      ],
    },
  ],
};
