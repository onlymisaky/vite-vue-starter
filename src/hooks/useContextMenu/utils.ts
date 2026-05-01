import type { AppContext, ComponentPublicInstance, Ref } from 'vue';
import type { ContextMenuEventCallbacks, ContextMenuManager, ContextMenuOpenPayload, ContextMenuUpdatePayload, RuntimeSessionState, UseContextMenuOptions } from './types';
import type { ContextMenuContext, ContextMenuSelectPayload, MenuItem } from '@/components/ContextMenu';
import { computed, defineComponent, effectScope, h, ref, render, Teleport } from 'vue';
import { DEFAULT_MENU_OPTIONS } from '@/components/ContextMenu/constant';
import ContextMenuHost from '@/components/ContextMenu/ContextMenuHost.vue';
import { useContextMenu as useContextMenuCore } from '@/components/ContextMenu/hooks/useContextMenu';

/**
 * 判断对象是否为 HTMLElement。
 * @param value 待判断的值
 * @returns 是否为 HTMLElement
 */
function isHTMLElement(value: unknown): value is HTMLElement {
  return value instanceof HTMLElement;
}

/**
 * 从宿主组件实例中提取菜单面板元素。
 * @param instance 宿主组件实例
 * @returns 菜单面板元素
 */
function resolvePanelElement(instance: ComponentPublicInstance | null) {
  const exposedPanel = instance?.$?.exposed?.panelRef;

  if (isHTMLElement(exposedPanel)) {
    return exposedPanel;
  }

  if (isHTMLElement((exposedPanel as Ref<HTMLElement | null | undefined> | undefined)?.value)) {
    return (exposedPanel as Ref<HTMLElement | null | undefined>).value || null;
  }

  return null;
}

/**
 * 创建兜底鼠标事件。
 * @param x 事件 x 坐标
 * @param y 事件 y 坐标
 * @returns 兜底鼠标事件
 */
function createSyntheticEvent(x: number, y: number) {
  return new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y,
  });
}

/**
 * 解析会话坐标。
 * @param previousSession 上一个活动会话
 * @param defaults controller 默认配置
 * @param payload 本次打开参数
 * @returns 最终坐标
 */
function resolveCoordinates<T>(
  previousSession: RuntimeSessionState | undefined,
  defaults: UseContextMenuOptions<T>,
  payload?: ContextMenuOpenPayload<T>,
) {
  const event = payload?.event;

  if (event) {
    return {
      event,
      x: event.clientX,
      y: event.clientY,
    };
  }

  const x = payload?.x ?? defaults.x ?? previousSession?.x;
  const y = payload?.y ?? defaults.y ?? previousSession?.y;

  if (x === undefined || y === undefined) {
    return {};
  }

  return {
    event: createSyntheticEvent(x, y),
    x,
    y,
  };
}

/**
 * 构建运行时会话。
 * @param defaults controller 默认配置
 * @param payload 本次打开参数
 * @returns 运行时会话
 */
function buildRuntimeSession<T>(
  defaults: UseContextMenuOptions<T>,
  payload?: ContextMenuOpenPayload<T>,
) {
  const coordinates = resolveCoordinates(undefined, defaults, payload);

  if (coordinates.x === undefined || coordinates.y === undefined || !coordinates.event) {
    return;
  }

  const items = payload?.items ?? defaults.items;
  if (!items?.length) {
    return;
  }

  const target = payload?.target
    ?? defaults.target
    ?? (isHTMLElement(coordinates.event.target) ? coordinates.event.target : null);

  const context: ContextMenuContext<T> = {
    event: coordinates.event,
    target,
    data: payload?.data ?? defaults.data,
    source: 'hook',
  };

  return {
    items: items as MenuItem<unknown>[],
    context: context as ContextMenuContext<unknown>,
    x: coordinates.x,
    y: coordinates.y,
    target,
    data: context.data,
    closeOnClick: payload?.closeOnClick ?? defaults.closeOnClick ?? DEFAULT_MENU_OPTIONS.closeOnClick,
    closeOnOutsideClick: payload?.closeOnOutsideClick ?? defaults.closeOnOutsideClick ?? DEFAULT_MENU_OPTIONS.closeOnOutsideClick,
    closeOnContextMenu: payload?.closeOnContextMenu ?? defaults.closeOnContextMenu ?? DEFAULT_MENU_OPTIONS.closeOnContextMenu,
    closeOnScroll: payload?.closeOnScroll ?? defaults.closeOnScroll ?? DEFAULT_MENU_OPTIONS.closeOnScroll,
    offset: payload?.offset ?? defaults.offset ?? DEFAULT_MENU_OPTIONS.offset,
    zIndex: payload?.zIndex ?? defaults.zIndex,
    eventCallbacks: {
      onSelect: (payload?.onSelect as ContextMenuEventCallbacks['onSelect']),
      onOpen: (payload?.onOpen as ContextMenuEventCallbacks['onOpen']),
      onClose: (payload?.onClose as ContextMenuEventCallbacks['onClose']),
    },
    defaultCallbacks: {
      onSelect: defaults.onSelect as ContextMenuEventCallbacks['onSelect'],
      onOpen: defaults.onOpen as ContextMenuEventCallbacks['onOpen'],
      onClose: defaults.onClose as ContextMenuEventCallbacks['onClose'],
    },
  } satisfies RuntimeSessionState;
}

/**
 * 构建更新后的会话。
 * @param currentSession 当前活动会话
 * @param payload 更新参数
 * @returns 更新后的运行时会话
 */
function buildUpdatedSession(
  currentSession: RuntimeSessionState,
  payload?: ContextMenuUpdatePayload<unknown>,
) {
  if (!payload) {
    return currentSession;
  }

  const coordinates = resolveCoordinates(currentSession, {}, payload);
  const nextEvent = coordinates.event ?? currentSession.context.event;
  const nextTarget = payload.target
    ?? currentSession.target
    ?? (isHTMLElement(nextEvent.target) ? nextEvent.target : null);
  const nextContext: ContextMenuContext<unknown> = {
    event: nextEvent,
    target: nextTarget,
    data: payload.data ?? currentSession.data,
    source: 'hook',
  };

  return {
    ...currentSession,
    items: payload.items ?? currentSession.items,
    context: nextContext,
    x: coordinates.x ?? currentSession.x,
    y: coordinates.y ?? currentSession.y,
    target: nextTarget,
    data: nextContext.data,
    closeOnClick: payload.closeOnClick ?? currentSession.closeOnClick,
    closeOnOutsideClick: payload.closeOnOutsideClick ?? currentSession.closeOnOutsideClick,
    closeOnContextMenu: payload.closeOnContextMenu ?? currentSession.closeOnContextMenu,
    offset: payload.offset ?? currentSession.offset,
    zIndex: payload.zIndex ?? currentSession.zIndex,
    eventCallbacks: {
      onSelect: (payload.onSelect as ContextMenuEventCallbacks['onSelect']) ?? currentSession.eventCallbacks.onSelect,
      onOpen: (payload.onOpen as ContextMenuEventCallbacks['onOpen']) ?? currentSession.eventCallbacks.onOpen,
      onClose: (payload.onClose as ContextMenuEventCallbacks['onClose']) ?? currentSession.eventCallbacks.onClose,
    },
  } satisfies RuntimeSessionState;
}

/**
 * 创建菜单宿主组件。
 * @param manager 菜单实例管理器
 * @returns 宿主组件
 */
function createContextMenuRoot(manager: ContextMenuManager) {
  return defineComponent({
    name: 'ContextMenuHookRoot',
    setup() {
      /**
       * 同步宿主组件实例。
       * @param instance 宿主组件实例
       */
      function bindHostRef(instance: Element | ComponentPublicInstance | null) {
        manager.panelRef.value = instance && '$' in instance
          ? resolvePanelElement(instance)
          : null;
      }

      /**
       * 处理宿主组件的菜单选择事件。
       * @param key 菜单项 key
       * @param item 菜单项
       * @param context 菜单上下文
       */
      function handleSelect(key: string, item: MenuItem<unknown>, context: ContextMenuContext<unknown>) {
        const activeSession = manager.activeSession.value;
        if (!activeSession) {
          return;
        }

        const payload: ContextMenuSelectPayload<unknown> = { key, item, context };
        activeSession.eventCallbacks.onSelect?.(payload);
        activeSession.defaultCallbacks.onSelect?.(payload);
      }

      return () => h(Teleport, { to: 'body' }, [
        h(ContextMenuHost, {
          ref: bindHostRef,
          items: manager.activeSession.value?.items || [],
          context: manager.activeSession.value?.context,
          visible: manager.visible.value,
          menuPositionStyle: manager.menuPositionStyle.value,
          offset: manager.activeSession.value?.offset ?? DEFAULT_MENU_OPTIONS.offset,
          zIndex: manager.activeSession.value?.zIndex,
          closeOnClick: manager.activeSession.value?.closeOnClick ?? DEFAULT_MENU_OPTIONS.closeOnClick,
          closeMenu: manager.close,
          onSelect: handleSelect,
        }),
      ]);
    },
  });
}

/**
 * 创建菜单实例管理器。
 * @returns 菜单实例管理器
 */
function createManager() {
  const panelRef = ref<HTMLElement | null>(null);
  const activeSession = ref<RuntimeSessionState>();
  const offset = computed(() => activeSession.value?.offset ?? DEFAULT_MENU_OPTIONS.offset);
  const zIndex = computed(() => activeSession.value?.zIndex);
  const closeOnOutsideClick = computed(() => activeSession.value?.closeOnOutsideClick ?? DEFAULT_MENU_OPTIONS.closeOnOutsideClick);
  const closeOnContextMenu = computed(() => activeSession.value?.closeOnContextMenu ?? DEFAULT_MENU_OPTIONS.closeOnContextMenu);
  const closeOnScroll = computed(() => activeSession.value?.closeOnScroll ?? DEFAULT_MENU_OPTIONS.closeOnScroll);

  /**
   * 这种情况下，拿不到 triggerElRef，这就导致 pointerdown 和 contextmenu 事件判断不准确
   */
  const core = useContextMenuCore(() => ({
    menuElRef: panelRef,
    offset: offset.value,
    padding: 8,
    zIndex: zIndex.value,
    closeOnOutsideClick: closeOnOutsideClick.value,
    closeOnContextMenu: closeOnContextMenu.value,
    closeOnScroll: closeOnScroll.value,
    onOpen: (event) => {
      const currentSession = activeSession.value;
      if (!currentSession) {
        return;
      }

      currentSession.context.event = event;
      currentSession.eventCallbacks.onOpen?.(currentSession.context);
      currentSession.defaultCallbacks.onOpen?.(currentSession.context);
    },
    onClose: () => {
      const closedContext = activeSession.value?.context;
      const closedSession = activeSession.value;

      activeSession.value = undefined;

      closedSession?.eventCallbacks.onClose?.(closedContext);
      closedSession?.defaultCallbacks.onClose?.(closedContext);
    },
  }));

  let destroyed = false;

  /**
   * 销毁当前菜单实例。
   */
  function destroy() {
    if (destroyed) {
      return;
    }

    destroyed = true;
    core.closeMenu();
  }

  return {
    activeSession,
    panelRef,
    visible: core.visible,
    menuPositionStyle: core.menuPositionStyle,
    close() {
      if (destroyed) {
        return false;
      }

      return core.closeMenu();
    },
    /**
     * 打开菜单。
     * @param defaults controller 默认配置
     * @param payload 本次打开参数
     */
    open<T>(defaults: UseContextMenuOptions<T>, payload?: ContextMenuOpenPayload<T>) {
      if (destroyed) {
        return;
      }

      const nextSession = buildRuntimeSession(defaults, payload);
      if (!nextSession) {
        return;
      }

      nextSession.context.event.preventDefault();
      activeSession.value = nextSession;
      core.openAtPosition(nextSession.x, nextSession.y, nextSession.context.event, true);
    },
    /**
     * 更新当前活动菜单。
     * @param payload 更新参数
     * @returns 是否成功更新
     */
    update<T>(payload?: ContextMenuUpdatePayload<T>) {
      if (destroyed) {
        return false;
      }

      if (!activeSession.value || !core.visible.value) {
        return false;
      }

      const nextSession = buildUpdatedSession(activeSession.value, payload as ContextMenuUpdatePayload<unknown> | undefined);
      activeSession.value = nextSession;
      core.openAtPosition(nextSession.x, nextSession.y, nextSession.context.event, false);
      return true;
    },
    destroy,
  } satisfies ContextMenuManager;
}

/**
 * 创建并挂载当前 Hook 的菜单实例。
 * @param appContext 当前应用上下文
 * @returns 菜单实例管理器
 */
export function createContextMenuManager(appContext?: AppContext | null) {
  const scope = effectScope(true);
  const manager = appContext?.app.runWithContext
    ? appContext.app.runWithContext(() => scope.run(() => createManager()))
    : scope.run(() => createManager());

  if (!manager) {
    scope.stop();
    throw new Error('Failed to create context menu manager.');
  }

  const container = document.createElement('div');
  const Root = createContextMenuRoot(manager);
  const vnode = h(Root);
  const originalDestroy = manager.destroy;
  let unmounted = false;

  if (appContext) {
    vnode.appContext = appContext;
  }

  render(vnode, container);

  manager.destroy = () => {
    if (unmounted) {
      return;
    }

    unmounted = true;
    originalDestroy();
    render(null, container);
    container.remove();
    scope.stop();
  };

  return manager;
}
