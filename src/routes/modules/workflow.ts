import type { RouteRecordRaw } from 'vue-router';
import { h } from 'vue';

export const workflowRoute: RouteRecordRaw = {
  path: '/workflow',
  name: 'Workflow',
  meta: {
    title: '工作流程',
    icon: 'Connection',
  },
  children: [
    {
      path: 'approval',
      name: 'Approval',
      meta: {
        title: '审批流程',
        icon: 'Stamp',
      },
      children: [
        {
          path: 'todo',
          name: 'Todo',
          meta: {
            title: '待办事项',
            icon: 'List',
          },
          children: [
            {
              path: 'urgent',
              name: 'UrgentApproval',
              component: {
                render() {
                  return h('div', 'Urgent Approval Page');
                },
              },
              meta: {
                title: '紧急审批',
                permission: ['workflow:approval:urgent'],
                icon: 'AlarmClock',
              },
            },
          ],
        },
      ],
    },
  ],
};
