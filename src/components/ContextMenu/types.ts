import type { Component, VNodeChild } from 'vue';

/**
 * 上下文菜单来源类型。
 */
export type ContextMenuSource = 'component' | 'directive' | 'hook' | 'service';

/**
 * 右键菜单运行时上下文。
 */
export interface ContextMenuContext<T = unknown> {
  event: MouseEvent
  target: HTMLElement | null
  data?: T
  source: ContextMenuSource
}

/**
 * 右键菜单项定义。
 */
export interface MenuItem<T = unknown> {
  /** 菜单项的唯一标识符 */
  key: string
  /** 菜单项的显示文本 */
  label: string
  /** 菜单项的图标 */
  icon?: string | Component
  /** 是否禁用该菜单项 */
  disabled?: boolean
  /** 是否隐藏该菜单项 */
  hidden?: boolean
  /** 是否显示分隔线(在当前菜单底部显示) */
  divided?: boolean
  /** 是否显示为危险操作 */
  danger?: boolean
  /** 子菜单项 */
  children?: MenuItem<T>[]
  /** 菜单项内容区的自定义渲染函数 */
  render?: (props: {
    item: MenuItem<T>
    context: ContextMenuContext<T>
    active: boolean
  }) => VNodeChild
  /** 点击事件处理函数 */
  onClick?: (context: ContextMenuContext<T>) => void | Promise<void>
  /** 菜单项的元数据 */
  meta?: Record<string, unknown>
}

/**
 * 菜单选择事件载荷。
 */
export interface ContextMenuSelectPayload<T = unknown> {
  key: string
  item: MenuItem<T>
  context: ContextMenuContext<T>
}
