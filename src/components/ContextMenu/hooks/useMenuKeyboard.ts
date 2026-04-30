import type { MaybeRefOrGetter, Ref } from 'vue';
import type { MenuItem } from '../types';
import { ref, toValue } from 'vue';

/**
 * 获取菜单项的可见子项。
 * @param item 菜单项
 * @returns 可见子项
 */
export function getVisibleChildren<T>(item?: MenuItem<T>) {
  return (item?.children || []).filter(child => !child.hidden);
}

/**
 * 根据路径获取同级菜单项列表。
 * @param parentPath 父级路径
 * @param menuItems 菜单项列表
 * @returns 同级菜单项
 */
function getItemsByPath<T>(parentPath: number[], menuItems: MenuItem<T>[]) {
  let items = menuItems;
  for (const index of parentPath) {
    const currentItem = items[index];
    if (!currentItem) {
      return [];
    }
    items = getVisibleChildren(currentItem);
  }
  return items;
}

/**
 * 根据路径获取菜单项。
 * @param path 菜单项路径
 * @returns 对应菜单项
 */
function getItemByPath<T>(path: number[], menuItems: MenuItem<T>[]) {
  if (!path.length) {
    return undefined;
  }

  const parentItems = getItemsByPath(path.slice(0, -1), menuItems);
  return parentItems[path[path.length - 1]];
}

/**
 * 查找下一个可键盘访问的菜单项索引。
 * @param items 当前同级菜单项
 * @param currentIndex 当前索引
 * @param step 移动方向
 * @returns 下一个可用索引
 */
function findNextEnabledIndex<T>(items: MenuItem<T>[], currentIndex: number, step: 1 | -1) {
  if (!items.length) {
    return -1;
  }

  for (let offset = 1; offset <= items.length; offset += 1) {
    const nextIndex = (currentIndex + (offset * step) + items.length) % items.length;
    if (!items[nextIndex]?.disabled) {
      return nextIndex;
    }
  }

  return -1;
}

export function useMenuKeyboard<T>(
  visible: Ref<boolean>,
  close: () => void,
  menuItems: MaybeRefOrGetter<MenuItem<T>[]>,
  selectItem: (item: MenuItem<T>) => void,
) {
  const activePath = ref<number[]>([]);

  function moveActiveSibling(step: 1 | -1) {
    const parentPath = activePath.value.length ? activePath.value.slice(0, -1) : [];
    const items = getItemsByPath(parentPath, toValue(menuItems));

    if (items.length === 0) {
      return;
    }

    const currentIndex = activePath.value.length ? activePath.value[activePath.value.length - 1] : (step === 1 ? -1 : 0);
    const nextIndex = findNextEnabledIndex(items, currentIndex, step);

    if (nextIndex === -1) {
      return;
    }

    activePath.value = [...parentPath, nextIndex];
  }

  function openActiveChildren() {
    if (activePath.value.length === 0) {
      const index = toValue(menuItems).findIndex(item => !item.disabled);
      if (index === -1) {
        return;
      }
      activePath.value = [index];
      return;
    }

    const currentItem = getItemByPath(activePath.value, toValue(menuItems));
    const children = getVisibleChildren(currentItem);

    if (!currentItem || !children.length) {
      return;
    }

    const firstEnabledIndex = children.findIndex(child => !child.disabled);
    if (firstEnabledIndex === -1) {
      return;
    }

    activePath.value = [...activePath.value, firstEnabledIndex];
  }

  function closeActiveChildren() {
    if (activePath.value.length <= 1) {
      return;
    }

    activePath.value = activePath.value.slice(0, -1);
  }

  function triggerActiveItem() {
    if (activePath.value.length === 0) {
      return;
    }

    const currentItem = getItemByPath(activePath.value, toValue(menuItems));
    if (!currentItem || currentItem.disabled) {
      return;
    }

    selectItem(currentItem);
  }

  function handleKeydown(event: KeyboardEvent) {
    if (!visible.value) {
      return;
    }

    const key = event.key;

    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Enter', 'Escape'].includes(key)) {
      event.preventDefault();
    }

    switch (key) {
      case 'ArrowUp':
        moveActiveSibling(-1);
        break;
      case 'ArrowDown':
        moveActiveSibling(1);
        break;
      case 'ArrowLeft':
        closeActiveChildren();
        break;
      case 'ArrowRight':
        openActiveChildren();
        break;
      case ' ':
      case 'Enter':
        triggerActiveItem();
        break;
      case 'Escape':
        close();
        break;
    }
  }

  return {
    handleKeydown,
    activePath,
  };
}
