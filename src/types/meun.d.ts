import type { RouteLocationRaw } from 'vue-router';

export { };

declare global {
  interface IMenuItem {
    // 对应路由的name
    index: string
    // 菜单标题
    title: string
    // 对应路由
    route?: RouteLocationRaw
    // 外部链接
    externalLink?: string
    // 图标
    icon?: string
    // 是否禁用
    disabled?: boolean
    // 子菜单
    items?: IMenuItem[]
    // 所有父菜单，跟节点在第一个，上一层在最后一个
    parents?: IMenuItem[]
  }
}
