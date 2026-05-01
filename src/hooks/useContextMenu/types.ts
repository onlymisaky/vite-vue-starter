import type { Ref } from 'vue';
import type { ContextMenuContext, ContextMenuHostProps, ContextMenuSelectPayload, MenuItem } from '@/components/ContextMenu';

export interface UseContextMenuOptions<T = unknown> {
  /** 菜单显示位置 x 坐标 */
  x?: number
  /** 菜单显示位置 y 坐标 */
  y?: number
  /** 菜单项列表 */
  items?: MenuItem<T>[]
  /** 菜单上下文数据 */
  data?: T
  /** 菜单目标元素 */
  target?: HTMLElement | null
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
  /** 菜单选择回调 */
  onSelect?: (payload: ContextMenuSelectPayload<T>) => void
  /** 菜单打开回调 */
  onOpen?: (context: ContextMenuContext<T>) => void
  /** 菜单关闭回调 */
  onClose?: (context?: ContextMenuContext<T>) => void
}

/**
 * Hook 版右键菜单打开参数。
 */
export interface ContextMenuOpenPayload<T = unknown> extends UseContextMenuOptions<T> {
  /** 本次打开关联的鼠标事件 */
  event?: MouseEvent
}

/**
 * Hook 版右键菜单更新参数。
 */
export type ContextMenuUpdatePayload<T = unknown> = Partial<ContextMenuOpenPayload<T>>;

/**
 * Hook 版右键菜单返回值。
 */
export interface UseContextMenuReturn<T = unknown> {
  /** 打开菜单 */
  open: (payload?: ContextMenuOpenPayload<T>) => void
  /** 关闭菜单 */
  close: () => boolean
  /** 更新菜单内容或上下文 */
  update: (payload?: ContextMenuUpdatePayload<T>) => boolean
  /** 菜单显隐状态 */
  visible: Readonly<Ref<boolean>>
}

export interface ContextMenuEventCallbacks {
  onSelect?: (payload: ContextMenuSelectPayload<unknown>) => void
  onOpen?: (context: ContextMenuContext<unknown>) => void
  onClose?: (context?: ContextMenuContext<unknown>) => void
}

export interface RuntimeSessionState {
  /** 当前会话菜单项 */
  items: MenuItem<unknown>[]
  /** 当前会话上下文 */
  context: ContextMenuContext<unknown>
  /** 当前会话显示位置 x 坐标 */
  x: number
  /** 当前会话显示位置 y 坐标 */
  y: number
  /** 当前会话目标元素 */
  target: HTMLElement | null
  /** 当前会话业务数据 */
  data?: unknown
  /** 当前会话点击项后是否关闭 */
  closeOnClick: boolean
  /** 当前会话点击外部是否关闭 */
  closeOnOutsideClick: boolean
  /** 当前会话再次右键外部是否关闭 */
  closeOnContextMenu: boolean
  /** 当前会话滚动时是否关闭菜单 */
  closeOnScroll: boolean
  /** 当前会话偏移量 */
  offset: number
  /** 当前会话 z-index */
  zIndex?: number
  /** 当前会话级回调 */
  eventCallbacks: ContextMenuEventCallbacks
  /** 当前 controller 默认回调 */
  defaultCallbacks: ContextMenuEventCallbacks
}

export interface ContextMenuManager {
  /** 当前激活会话 */
  activeSession: Ref<RuntimeSessionState | undefined>
  /** 菜单根节点 */
  panelRef: Ref<HTMLElement | null>
  /** 菜单显隐状态 */
  visible: Readonly<Ref<boolean>>
  /** 菜单位置样式 */
  menuPositionStyle: Readonly<Ref<ContextMenuHostProps['menuPositionStyle']>>
  /** 关闭菜单 */
  close: () => boolean
  /** 打开菜单 */
  open: <T = unknown>(options: UseContextMenuOptions<T>, payload?: ContextMenuOpenPayload<T>) => void
  /** 更新菜单 */
  update: <T = unknown>(payload?: ContextMenuUpdatePayload<T>) => boolean
  /** 销毁当前实例 */
  destroy: () => void
}
