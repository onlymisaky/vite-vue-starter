# Vite Vue Starter

一个现代化的 Vue 3 + TypeScript 项目模板，集成了最佳实践和常用工具。

## 特性

- ⚡️ [Vite](https://vitejs.dev/) - 闪电般的前端构建工具
- 🖖 [Vue 3](https://vuejs.org/) - 渐进式 JavaScript 框架
- 🏷️ [TypeScript](https://www.typescriptlang.org/) - 带有类型系统的 JavaScript
- 📦 [Pinia](https://pinia.vuejs.org/) - Vue 官方状态管理方案
- 🎨 [TailwindCSS](https://tailwindcss.com/) - 实用优先的原子化 CSS 框架
- 🔍 ESLint + Stylelint - 代码规范和样式检查
- 🌟 [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged) - Git Hooks
- 📝 [Commitlint](https://commitlint.js.org/) - Git 提交信息规范
- 🚀 自动导入 - 组件和 API 自动导入
- 🔄 请求封装 - 基于 Axios 的请求库封装
- 🎯 Vue Router - 官方路由管理
- 🔀 混合开发 - 支持 TypeScript 和 JavaScript 混用

## 项目结构

```
├── src/                      # 源代码
│   ├── assets/              # 静态资源
│   ├── components/          # 通用组件
│   ├── hooks/              # Vue Hooks
│   ├── layout/             # 布局组件
│   ├── request/            # 网络请求
│   ├── routes/             # 路由配置
│   ├── store/              # 状态管理
│   ├── styles/             # 全局样式
│   ├── types/              # TypeScript 类型
│   ├── utils/              # 工具函数
│   └── views/              # 页面组件
├── environments/           # 环境配置
├── lints/                  # 代码规范配置
├── public/                 # 公共资源
└── types/                  # 全局类型声明
```

## 快速开始

```bash
# 克隆项目
git clone https://github.com/onlymisaky/vite-vue-starter.git

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

## 环境要求

- Node.js 20+
