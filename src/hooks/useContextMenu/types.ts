import type { Ref } from 'vue';
import type {
  ContextMenuBehaviorOptions,
  ContextMenuContentOptions,
  ContextMenuContext,
  ContextMenuHostProps,
  ContextMenuLifecycleCallbacks,
  ContextMenuSharedOptions,
} from '@/components/ContextMenu';

export interface UseContextMenuOptions<T = unknown> extends Partial<ContextMenuSharedOptions<T>> {
  /** 菜单显示位置 x 坐标 */
  x?: number
  /** 菜单显示位置 y 坐标 */
  y?: number
  /** 菜单目标元素 */
  target?: HTMLElement | null
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

export type ContextMenuEventCallbacks = ContextMenuLifecycleCallbacks<unknown>;

/**
 * 已解析默认值后的菜单行为配置。
 */
export interface ResolvedContextMenuBehaviorOptions
  extends Pick<Required<ContextMenuBehaviorOptions>, 'closeOnClick' | 'closeOnOutsideClick' | 'closeOnContextMenu' | 'closeOnScroll' | 'offset'>,
  Pick<ContextMenuBehaviorOptions, 'zIndex'> {}

export interface RuntimeSessionState
  extends ContextMenuContentOptions<unknown>,
  ResolvedContextMenuBehaviorOptions {
  /** 当前会话上下文 */
  context: ContextMenuContext<unknown>
  /** 当前会话显示位置 x 坐标 */
  x: number
  /** 当前会话显示位置 y 坐标 */
  y: number
  /** 当前会话目标元素 */
  target: HTMLElement | null
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
