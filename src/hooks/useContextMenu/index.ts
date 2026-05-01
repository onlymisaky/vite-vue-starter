import type { ContextMenuOpenPayload, ContextMenuUpdatePayload, UseContextMenuOptions, UseContextMenuReturn } from './types';
import { computed, getCurrentInstance, onBeforeUnmount } from 'vue';
import { createContextMenuManager } from './utils';

/**
 * 提供自动挂载宿主的 Hook 版右键菜单 API。
 * @param options controller 默认配置
 * @returns 打开、关闭与更新菜单的方法
 */
export function useContextMenu<T = unknown>(
  options: UseContextMenuOptions<T> = {},
): UseContextMenuReturn<T> {
  const instance = getCurrentInstance();
  const manager = createContextMenuManager(instance?.appContext);
  const visible = computed(() => manager.visible.value);

  if (instance) {
    onBeforeUnmount(() => {
      manager.destroy();
    });
  }

  /**
   * 打开菜单。
   * @param payload 本次打开参数
   */
  function open(payload?: ContextMenuOpenPayload<T>) {
    manager.open(options, payload);
  }

  /**
   * 关闭菜单。
   * @returns 是否实际关闭
   */
  function close() {
    return manager.close();
  }

  /**
   * 更新当前活动菜单。
   * @param payload 更新参数
   * @returns 是否成功更新
   */
  function update(payload?: ContextMenuUpdatePayload<T>) {
    return manager.update(payload);
  }

  return {
    open,
    close,
    update,
    visible,
  };
}
