import type { RouteRecordRaw } from 'vue-router';
import { h } from 'vue';

export const contentRoute: RouteRecordRaw = {
  path: '/content',
  name: 'ContentManagement',
  meta: {
    title: '内容管理',
    icon: 'Document',
  },
  children: [
    {
      path: 'draft',
      name: 'Draft',
      component: {
        render() {
          return h('div', 'Draft Page');
        },
      },
      meta: {
        title: '草稿箱',
        permission: ['content:draft'],
        icon: 'EditPen',
      },
    },
    {
      path: 'article',
      name: 'Article',
      meta: {
        title: '文章管理',
        icon: 'Files',
      },
      children: [
        {
          path: 'hot',
          name: 'HotArticle',
          component: {
            render() {
              return h('div', 'Hot Article Page');
            },
          },
          meta: {
            title: '热门文章',
            permission: ['content:article:hot'],
            icon: 'Star',
          },
        },
        {
          path: 'archive',
          name: 'ArchiveArticle',
          component: {
            render() {
              return h('div', 'Archive Article Page');
            },
          },
          meta: {
            title: '归档文章',
            permission: ['content:article:archive'],
            icon: 'Box',
          },
        },
      ],
    },
  ],
};
