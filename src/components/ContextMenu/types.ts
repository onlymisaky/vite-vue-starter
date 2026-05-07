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
  /**
   * 菜单项点击事件回调，在 select 之前触发
   * @param context 点击事件上下文
   * @returns 若显式的返回 false | Promise<false> 则不会触发 select 事件，也不会关闭菜单
   */
  onClick?: (context: ContextMenuContext<T>) => void | boolean | Promise<void | boolean>
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

/**
 * 菜单行为配置。
 */
export interface ContextMenuBehaviorOptions {
  /** 点击菜单项后是否自动关闭 */
  closeOnClick?: boolean
  /** 点击菜单外部后是否自动关闭 */
  closeOnOutsideClick?: boolean
  /** 菜单打开时再次右键外部是否关闭 */
  closeOnContextMenu?: boolean
  /** 滚动时是否关闭菜单 */
  closeOnScroll?: boolean
  /** 菜单面板偏移量 */
  offset?: number
  /** 菜单 Z-index */
  zIndex?: number
}

/**
 * 菜单内容配置。
 */
export interface ContextMenuContentOptions<T = unknown> {
  /** 菜单项列表 */
  items: MenuItem<T>[]
  /** 菜单上下文数据 */
  data?: T
}

/**
 * 菜单生命周期回调。
 */
export interface ContextMenuLifecycleCallbacks<T = unknown> {
  /** 菜单选择回调 */
  onSelect?: (payload: ContextMenuSelectPayload<T>) => void
  /** 菜单打开回调 */
  onOpen?: (context: ContextMenuContext<T>) => void
  /** 菜单关闭回调 */
  onClose?: (context?: ContextMenuContext<T>) => void
}

/**
 * 通用菜单配置协议。
 */
export type ContextMenuSharedOptions<T = unknown> = ContextMenuContentOptions<T>
  & ContextMenuBehaviorOptions
  & ContextMenuLifecycleCallbacks<T>;

export interface ContextMenuBaseProps<T = unknown>
  extends Pick<ContextMenuContentOptions<T>, 'items'>,
  Pick<ContextMenuBehaviorOptions, 'offset' | 'zIndex' | 'closeOnClick'> {}

export interface ContextMenuProps<T = unknown>
  extends ContextMenuContentOptions<T>,
  ContextMenuBehaviorOptions {
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
