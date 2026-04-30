import type { CSSProperties, MaybeRefOrGetter, Ref, TemplateRef } from 'vue';
import { computed, nextTick, onBeforeUnmount, ref, toValue, unref, watch } from 'vue';
import { useRouter } from 'vue-router';

interface Position {
  x: number
  y: number
}

/**
 * 通用菜单定位与关闭配置。
 */
export interface ContextMenuOptions {
  /** 触发元素引用 */
  triggerElRef?: TemplateRef<HTMLElement | null>
  /** 菜单根节点引用 */
  menuElRef?: TemplateRef<HTMLElement | null>
  /** 是否禁用菜单 */
  disabled?: boolean
  /** 菜单向右下偏移量 */
  offset?: number
  /**
   * 视口边界预留间距
   * 当菜单宽度很大（几乎占满视口）时，右侧边界可能会小于 padding，导致菜单被截断
   * 此时需要设置 padding 来避免截断
   */
  padding?: number
  /** 菜单 Z-index */
  zIndex?: number
  /** 是否点击菜单外部关闭菜单 */
  closeOnOutsideClick?: boolean
  /** 菜单打开时再次右键外部是否关闭 */
  closeOnContextMenu?: boolean
  /** 菜单打开后的回调 */
  onOpen?: (event: MouseEvent) => void
  /** 菜单关闭后的回调 */
  onClose?: () => void
}

interface Size {
  width: number
  height: number
}

/**
 * 限制位置在视口范围内。
 * @param x 位置 x 坐标
 * @param y 位置 y 坐标
 * @param width 菜单宽度
 * @param height 菜单高度
 * @param padding 边界预留间距
 * @returns 修正后的位置
 */
function clampPosition(x: number, y: number, width: number, height: number, padding: number) {
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  const position: Position = {
    x: Math.min(Math.max(x, padding), Math.max(padding, viewportWidth - width - padding)),
    y: Math.min(Math.max(y, padding), Math.max(padding, viewportHeight - height - padding)),
  };

  return position;
}

/**
 * @description 获取菜单布局尺寸。
 * 过渡动画会对 getBoundingClientRect() 产生 transform 缩放影响，
 * 首次打开时需要优先使用未受 transform 影响的布局尺寸来计算定位。
 * @param menuEl 菜单根节点
 * @returns 菜单尺寸
 */
function getMenuSize(menuEl: HTMLElement): Size {
  return {
    width: menuEl.offsetWidth || menuEl.getBoundingClientRect().width,
    height: menuEl.offsetHeight || menuEl.getBoundingClientRect().height,
  };
}

/**
 * 注册菜单打开后的全局关闭监听。
 * @param triggerElRef 触发元素引用
 * @param menuElRef 菜单根节点引用
 * @param visible 菜单显隐状态
 * @param closeMenu 关闭菜单方法
 * @param options 运行配置
 */
function useGlobalListeners(
  triggerElRef: TemplateRef<HTMLElement | null> | undefined,
  /** 菜单根节点引用 */
  menuElRef: TemplateRef<HTMLElement | null> | undefined,
  visible: Ref<boolean>,
  closeMenu: () => boolean,
  options: MaybeRefOrGetter<Pick<ContextMenuOptions, 'closeOnContextMenu' | 'closeOnOutsideClick'>>,
) {
  const hasListeners = ref(false);

  /**
   * 处理外部指针按下关闭。
   * @param event Pointer 事件
   */
  function handleDocumentPointerDown(event: PointerEvent) {
    if (!visible.value || !toValue(options).closeOnOutsideClick) {
      return;
    }

    const path = event.composedPath();
    const menuEl = unref(menuElRef);
    const triggerEl = unref(triggerElRef);

    if (menuEl && path.includes(menuEl)) {
      return;
    }

    if (triggerEl && path.includes(triggerEl)) {
      return;
    }

    closeMenu();
  }

  /**
   * 处理外部点击关闭。
   * @param event 鼠标事件
   */
  function handleDocumentClick(event: MouseEvent) {
    if (!visible.value || !toValue(options).closeOnOutsideClick) {
      return;
    }

    const path = event.composedPath();
    const menuEl = unref(menuElRef);

    if (menuEl && path.includes(menuEl)) {
      return;
    }

    closeMenu();
  }

  /**
   * 处理菜单打开状态下的额外右键。
   * @param event 鼠标事件
   */
  function handleDocumentContextMenu(event: MouseEvent) {
    if (!visible.value || !toValue(options).closeOnContextMenu) {
      return;
    }

    const path = event.composedPath();
    const menuEl = unref(menuElRef);
    const triggerEl = unref(triggerElRef);

    if (menuEl && path.includes(menuEl)) {
      return;
    }

    if (triggerEl && path.includes(triggerEl)) {
      return;
    }

    closeMenu();
  }

  /**
   * 处理全局 Escape 关闭。
   * @param event 键盘事件
   */
  function handleDocumentKeyDown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeMenu();
    }
  }

  /**
   * 处理窗口尺寸变化。
   */
  function handleWindowResize() {
    closeMenu();
  }

  /**
   * 处理滚动关闭。
   */
  function handleWindowScroll() {
    closeMenu();
  }

  /**
   * 添加全局监听。
   */
  function addGlobalListeners() {
    if (hasListeners.value) {
      return;
    }

    document.addEventListener('pointerdown', handleDocumentPointerDown);
    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('contextmenu', handleDocumentContextMenu, true);
    document.addEventListener('keydown', handleDocumentKeyDown);
    window.addEventListener('scroll', handleWindowScroll, true);
    window.addEventListener('resize', handleWindowResize);
    hasListeners.value = true;
  }

  /**
   * 移除全局监听。
   */
  function removeGlobalListeners() {
    if (!hasListeners.value) {
      return;
    }

    document.removeEventListener('pointerdown', handleDocumentPointerDown);
    document.removeEventListener('click', handleDocumentClick);
    document.removeEventListener('contextmenu', handleDocumentContextMenu, true);
    document.removeEventListener('keydown', handleDocumentKeyDown);
    window.removeEventListener('scroll', handleWindowScroll, true);
    window.removeEventListener('resize', handleWindowResize);
    hasListeners.value = false;
  }

  watch(visible, (nextVisible) => {
    if (nextVisible) {
      addGlobalListeners();
      return;
    }

    removeGlobalListeners();
  });

  onBeforeUnmount(() => {
    removeGlobalListeners();
  });
}

/**
 * 管理菜单的触发、定位与全局关闭。
 * @param options 运行配置
 * @returns 菜单状态与控制方法
 */
export function useContextMenu(
  options: MaybeRefOrGetter<ContextMenuOptions> = {},
) {
  const router = useRouter();
  const visible = ref(false);
  const position = ref<Position>({ x: 0, y: 0 });
  const menuPosition = ref<Position>({ x: 0, y: 0 });

  const menuStyle = computed<CSSProperties>(() => {
    const resolvedOptions = toValue(options);

    return {
      left: `${menuPosition.value.x}px`,
      top: `${menuPosition.value.y}px`,
      zIndex: `${resolvedOptions.zIndex || 3000}`,
    };
  });

  /**
   * 更新菜单根面板位置。
   */
  function updateMenuPosition() {
    const resolvedOptions = toValue(options);
    const menuEl = unref(resolvedOptions.menuElRef);
    if (!menuEl) {
      return;
    }

    const menuSize = getMenuSize(menuEl);
    const padding = resolvedOptions.padding || 8;
    const offset = resolvedOptions.offset || 0;

    menuPosition.value = clampPosition(
      position.value.x + offset,
      position.value.y + offset,
      menuSize.width,
      menuSize.height,
      padding,
    );
  }

  /**
   * 根据指定坐标打开或更新菜单。
   * @param x 菜单起始 x 坐标
   * @param y 菜单起始 y 坐标
   * @param event 关联鼠标事件
   */
  function openAtPosition(x: number, y: number, event?: MouseEvent) {
    const resolvedOptions = toValue(options);

    if (resolvedOptions.disabled) {
      return;
    }

    visible.value = true;
    position.value = { x, y };
    menuPosition.value = {
      x: x + (resolvedOptions.offset || 0),
      y: y + (resolvedOptions.offset || 0),
    };

    if (event) {
      resolvedOptions.onOpen?.(event);
    }

    nextTick(() => {
      updateMenuPosition();
      requestAnimationFrame(updateMenuPosition);
    });
  }

  /**
   * 根据右键事件打开或更新菜单。
   * @param event 鼠标事件
   */
  function openMenu(event: MouseEvent) {
    event.preventDefault();
    openAtPosition(event.clientX, event.clientY, event);
  }

  /**
   * 关闭菜单。
   * @returns 是否实际关闭了菜单
   */
  function closeMenu() {
    if (!visible.value) {
      return false;
    }

    visible.value = false;
    toValue(options).onClose?.();
    return true;
  }

  /**
   * 处理触发区右键。
   * @param event 鼠标事件
   */
  function handleTriggerContextmenu(event: MouseEvent) {
    openMenu(event);
  }

  useGlobalListeners(
    toValue(options).triggerElRef!,
    toValue(options).menuElRef!,
    visible,
    closeMenu,
    options,
  );

  watch(() => router.currentRoute.value.fullPath, () => {
    closeMenu();
  });

  watch(visible, async (nextVisible) => {
    if (!nextVisible) {
      return;
    }

    await nextTick();
    unref(toValue(options).menuElRef)?.focus();
  });

  return {
    handleTriggerContextmenu,
    closeMenu,
    menuPosition,
    menuStyle,
    openAtPosition,
    openMenu,
    position,
    updateMenuPosition,
    visible,
  };
}
