import type { RouteRecordRaw } from 'vue-router';
import { h } from 'vue';

export const messageRoute: RouteRecordRaw = {
  path: '/message',
  name: 'Message',
  meta: {
    title: '消息中心',
    icon: 'Message',
  },
  children: [
    {
      path: 'system',
      name: 'SystemMessage',
      component: {
        render() {
          return h('div', 'System Message Page');
        },
      },
      meta: {
        title: '系统通知',
        permission: ['message:system'],
        icon: 'Bell',
      },
    },
    {
      path: 'personal',
      name: 'PersonalMessage',
      component: {
        render() {
          return h('div', 'Personal Message Page');
        },
      },
      meta: {
        title: '个人消息',
        permission: ['message:personal'],
        icon: 'ChatDotRound',
      },
    },
  ],
};
