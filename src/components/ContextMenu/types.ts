import type { Component, CSSProperties, VNodeChild } from 'vue';

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

export interface ContextMenuBaseProps<T = unknown> {
  /** 菜单项列表 */
  items: MenuItem<T>[]
  /** 菜单面板偏移量 */
  offset?: number
  /** 菜单 Z-index */
  zIndex?: number
  /** 点击菜单项后是否自动关闭 */
  closeOnClick?: boolean
}

export interface ContextMenuProps<T = unknown> extends ContextMenuBaseProps<T> {
  /** 菜单上下文数据 */
  data?: T
  /** 点击菜单外部后是否自动关闭 */
  closeOnOutsideClick?: boolean
  /** 菜单打开时再次右键外部是否关闭 */
  closeOnContextMenu?: boolean
  /** 是否禁用菜单 */
  disabled?: boolean
}

export interface ContextMenuHostProps<T = unknown> extends ContextMenuBaseProps<T> {
  /** 当前菜单上下文 */
  context?: ContextMenuContext<T>
  /** 菜单显隐状态 */
  visible: boolean
  /** 菜单面板样式 */
  menuPositionStyle: CSSProperties
  /** 关闭菜单方法 */
  closeMenu: () => void
}
