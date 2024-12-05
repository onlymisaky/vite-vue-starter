export const menuData: IMenuItem[] = [
  {
    index: '1',
    title: '系统管理',
    icon: 'Setting',
    route: '/system',
    items: [
      {
        index: '1-1',
        title: '用户管理',
        icon: 'User',
        route: '/system/user',
        items: [
          {
            index: '1-1-1',
            title: '用户列表',
            route: '/system/user/list',
            items: [
              {
                index: '1-1-1-1',
                title: '详细信息',
                route: '/system/user/list/detail',
              },
              {
                index: '1-1-1-2',
                title: '权限分配',
                route: '/system/user/list/permission',
              },
            ],
          },
          {
            index: '1-1-2',
            title: '角色管理',
            route: '/system/user/role',
          },
        ],
      },
      {
        index: '1-2',
        title: '系统配置',
        icon: 'Tools',
        route: '/system/config',
      },
      {
        index: '1-3',
        title: '外部链接',
        icon: 'Link',
        externalLink: 'https://example.com',
      },
    ],
  },
  {
    index: '2',
    title: '数据中心',
    icon: 'DataLine',
    route: '/data',
    items: [
      {
        index: '2-1',
        title: '数据分析',
        route: '/data/analysis',
        items: [
          {
            index: '2-1-1',
            title: '实时监控',
            route: '/data/analysis/monitor',
            items: [
              {
                index: '2-1-1-1',
                title: '性能指标',
                route: '/data/analysis/monitor/performance',
              },
              {
                index: '2-1-1-2',
                title: '告警信息',
                route: '/data/analysis/monitor/alert',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    index: '3',
    title: '内容管理',
    icon: 'Document',
    route: '/content',
    items: [
      {
        index: '3-1',
        title: '文章管理',
        route: '/content/article',
        items: [
          {
            index: '3-1-1',
            title: '草稿箱',
            route: '/content/article/draft',
          },
          {
            index: '3-1-2',
            title: '已发布',
            route: '/content/article/published',
            items: [
              {
                index: '3-1-2-1',
                title: '热门文章',
                route: '/content/article/published/hot',
              },
              {
                index: '3-1-2-2',
                title: '归档文章',
                route: '/content/article/published/archive',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    index: '4',
    title: '开发工具',
    icon: 'Tools',
    route: '/dev-tools',
    items: [
      {
        index: '4-1',
        title: 'API文档',
        externalLink: 'https://api-docs.example.com',
      },
      {
        index: '4-2',
        title: '开发指南',
        externalLink: 'https://dev-guide.example.com',
      },
    ],
  },
  {
    index: '5',
    title: '帮助文档',
    icon: 'QuestionFilled',
    route: '/help',
    disabled: true,
  },
  {
    index: '6',
    title: '工作流程',
    icon: 'Operation',
    route: '/workflow',
    items: [
      {
        index: '6-1',
        title: '审批流程',
        route: '/workflow/approval',
        items: [
          {
            index: '6-1-1',
            title: '待办事项',
            route: '/workflow/approval/todo',
            items: [
              {
                index: '6-1-1-1',
                title: '紧急审批',
                route: '/workflow/approval/todo/urgent',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    index: '7',
    title: '消息中心',
    icon: 'Message',
    route: '/message',
    items: [
      {
        index: '7-1',
        title: '系统通知',
        route: '/message/system',
      },
      {
        index: '7-2',
        title: '个人消息',
        route: '/message/personal',
      },
    ],
  },
  {
    index: '8',
    title: '统计报表',
    icon: 'PieChart',
    route: '/statistics',
    items: [
      {
        index: '8-1',
        title: '销售报表',
        route: '/statistics/sales',
        items: [
          {
            index: '8-1-1',
            title: '月度统计',
            route: '/statistics/sales/monthly',
            items: [
              {
                index: '8-1-1-1',
                title: '区域分析',
                route: '/statistics/sales/monthly/region',
              },
            ],
          },
        ],
      },
    ],
  },
  {
    index: '9',
    title: '资源管理',
    icon: 'Files',
    route: '/resources',
    items: [
      {
        index: '9-1',
        title: '文件管理',
        route: '/resources/files',
      },
      {
        index: '9-2',
        title: '图片管理',
        route: '/resources/images',
      },
    ],
  },
  {
    index: '10',
    title: '系统日志',
    icon: 'List',
    route: '/logs',
    items: [
      {
        index: '10-1',
        title: '操作日志',
        route: '/logs/operation',
      },
      {
        index: '10-2',
        title: '登录日志',
        route: '/logs/login',
      },
    ],
  },
];
