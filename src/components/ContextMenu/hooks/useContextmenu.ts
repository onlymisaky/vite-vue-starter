import type { CSSProperties, MaybeRef, MaybeRefOrGetter, Ref } from 'vue';
import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, ref, toValue, unref, watch } from 'vue';
import { useRouter } from 'vue-router';

interface ContextmenuOptions {
  /** 是否禁用菜单 */
  disabled?: boolean
  /** 菜单向右下偏移量 */
  offset?: number
  menuElRef?: MaybeRef<HTMLElement | undefined | null>
  /**
   * 当菜单宽度很大（几乎占满视口）时，右侧边界可能会小于 padding，导致菜单被截断
   * 此时需要设置 padding 来避免截断
   */
  padding?: number
  /** 菜单 Z-index */
  zIndex?: number
  onMenuContext?: (event: MouseEvent) => void
  /** 是否点击外部关闭菜单 */
  closeOnOutsideClick?: boolean
}

interface Position {
  x: number
  y: number
}

/**
 * 限制位置在视口范围内
 * @param x 位置x坐标
 * @param y 位置y坐标
 * @param width 宽度
 * @param height 高度
 * @param padding 间距 padding
 * @returns 限制后的位置
 */
function clampPosition(x: number, y: number, width: number, height: number, padding: number) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const position: Position = { x: 0, y: 0 };

  position.x = Math.min(Math.max(x, padding), Math.max(padding, viewportWidth - width - padding));
  position.y = Math.min(Math.max(y, padding), Math.max(padding, viewportHeight - height - padding));

  return position;
}

function useGlobalListeners(
  triggerEl: MaybeRef<HTMLElement | undefined | null>,
  visible: Ref<boolean>,
  closeMenu: () => void,
  options: MaybeRefOrGetter<Pick<ContextmenuOptions, 'closeOnOutsideClick' | 'menuElRef'>>,
) {
  const hasListeners = ref(false);
  // const indexPath = ref<number[]>([]);

  function handleDocumentPointerDown(event: PointerEvent) {
    if (!toValue(options).closeOnOutsideClick || !visible.value) {
      return;
    }
    const path = event.composedPath();

    const menuEl = unref(toValue(options).menuElRef);
    if (menuEl && path.includes(menuEl)) {
      return;
    }

    const el = unref(triggerEl);

    if (el && path.includes(el)) {
      return;
    }

    closeMenu();
  }

  function handleDocumentKeyDown(event: KeyboardEvent) {
    const key = event.key;
    if (key === 'Escape') {
      closeMenu();
    }
    // 处理上下左右和Enter键
    // const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'];
  }

  function handleWindowResize() {
    closeMenu();
  }

  function handleWindowScroll() {
    closeMenu();
  }

  function addGlobalListeners() {
    if (hasListeners.value) {
      return;
    }
    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('keydown', handleDocumentKeyDown);
    window.addEventListener('scroll', handleWindowScroll, true);
    window.addEventListener('resize', handleWindowResize);
    hasListeners.value = true;
  }

  function removeGlobalListeners() {
    if (!hasListeners.value) {
      return;
    }
    document.removeEventListener('pointerdown', handleDocumentPointerDown);
    document.removeEventListener('keydown', handleDocumentKeyDown);
    window.removeEventListener('scroll', handleWindowScroll, true);
    window.removeEventListener('resize', handleWindowResize);
    hasListeners.value = false;
  }

  watch(visible, () => {
    if (visible.value) {
      addGlobalListeners();
    }
    else {
      removeGlobalListeners();
    }
  });

  onBeforeUnmount(() => {
    removeGlobalListeners();
  });
}

export function useContextmenu(
  triggerEl: MaybeRef<HTMLElement | undefined | null>,
  options: MaybeRefOrGetter<ContextmenuOptions> = {},
) {
  const router = useRouter();

  // 触发元素位置
  const position = ref<Position>({ x: 0, y: 0 });

  // 菜单是否可见
  const visible = ref(false);

  // 菜单位置
  const menuPosition = ref<Position>({ x: 0, y: 0 });

  // 菜单位置样式
  const menuStyle = computed<CSSProperties>(() => {
    return {
      left: `${menuPosition.value.x}px`,
      top: `${menuPosition.value.y}px`,
      zIndex: `${toValue(options).zIndex || 3000}`,
    };
  });

  // 更新菜单位置
  function updateMenuPosition() {
    const el = unref(toValue(options).menuElRef);
    if (!el) {
      return;
    }

    const menuRect = el.getBoundingClientRect();

    if (!menuRect) {
      return;
    }

    const padding = toValue(options).padding || 8;
    const x = position.value.x + (toValue(options).offset || 0);
    const y = position.value.y + (toValue(options).offset || 0);
    const width = menuRect.width;
    const height = menuRect.height;

    menuPosition.value = clampPosition(x, y, width, height, padding);
  }

  async function handleContextMenumenu(event: MouseEvent) {
    if (toValue(options).disabled) {
      return;
    }

    event.preventDefault();

    visible.value = true;

    position.value = { x: event.clientX, y: event.clientY };

    menuPosition.value = {
      x: event.clientX + (toValue(options).offset || 0),
      y: event.clientY + (toValue(options).offset || 0),
    };

    nextTick(updateMenuPosition);

    toValue(options).onMenuContext?.(event);
  }

  function closeMenu() {
    if (!visible.value) {
      return;
    }

    visible.value = false;
  }

  useGlobalListeners(triggerEl, visible, closeMenu, options);

  onMounted(() => {
    const el = unref(triggerEl);
    if (el) {
      el.addEventListener('contextmenu', handleContextMenumenu);
    }
  });

  onUnmounted(() => {
    const el = unref(triggerEl);
    if (el) {
      el.removeEventListener('contextmenu', handleContextMenumenu);
    }
  });

  watch(() => router.currentRoute.value.fullPath, closeMenu);

  return {
    position,
    visible,
    menuPosition,
    menuStyle,
    closeMenu,
  };
}
