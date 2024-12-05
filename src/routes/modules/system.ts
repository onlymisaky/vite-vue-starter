import type { RouteRecordRaw } from 'vue-router';
import { h } from 'vue';

export const systemRoute: RouteRecordRaw = {
  path: '/system',
  name: 'System',
  meta: {
    title: '系统管理',
    icon: 'Setting',
  },
  children: [
    {
      path: 'user',
      name: 'UserManagement',
      meta: {
        title: '用户管理',
        icon: 'User',
      },
      children: [
        {
          path: 'list',
          name: 'UserList',
          meta: {
            title: '用户列表',
            icon: 'UserFilled',
          },
          children: [
            {
              path: 'detail',
              name: 'UserDetail',
              component: {
                render() {
                  return h('div', 'UserDetail Page');
                },
              },
              meta: {
                title: '详细信息',
                permission: ['system:user:detail'],
                icon: 'InfoFilled',
              },
            },
            {
              path: 'permission',
              name: 'UserPermission',
              component: {
                render() {
                  return h('div', 'UserPermission Page');
                },
              },
              meta: {
                title: '权限分配',
                permission: ['system:user:permission'],
                icon: 'Lock',
              },
            },
          ],
        },
        {
          path: 'role',
          name: 'RoleManagement',
          component: {
            render() {
              return h('div', 'RoleManagement Page');
            },
          },
          meta: {
            title: '角色管理',
            permission: ['system:role:list'],
            icon: 'CreditCard',
          },
        },
      ],
    },
    {
      path: 'config',
      name: 'SystemConfig',
      component: {
        render() {
          return h('div', 'SystemConfig Page');
        },
      },
      meta: {
        title: '系统配置',
        permission: ['system:config'],
        icon: 'Tools',
      },
    },
  ],
};
