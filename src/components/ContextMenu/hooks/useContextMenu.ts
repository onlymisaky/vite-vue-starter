import type { CSSProperties, MaybeRefOrGetter, Ref } from 'vue';
import { computed, nextTick, onBeforeUnmount, ref, toValue, watch } from 'vue';
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
  triggerElRef?: MaybeRefOrGetter<HTMLElement | null | undefined>
  /** 菜单根节点引用 */
  menuElRef?: MaybeRefOrGetter<HTMLElement | null | undefined>
  /** 是否禁用菜单 */
  disabled?: boolean
  /** 菜单向右下偏移量 */
  offset?: number
  /**
   * 视口边界预留间距。
   * 当菜单宽度很大时，边界预留距离用于避免菜单被裁切。
   */
  padding?: number
  /** 菜单 Z-index */
  zIndex?: number
  /** 是否点击菜单外部关闭菜单 */
  closeOnOutsideClick?: boolean
  /** 菜单打开时再次右键外部是否关闭 */
  closeOnContextMenu?: boolean
  /** 是否滚动关闭菜单 */
  closeOnScroll?: boolean
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
 * 解析元素引用。
 * @param elementRef 元素引用
 * @returns 解析后的元素
 */
function resolveElement(elementRef?: MaybeRefOrGetter<HTMLElement | null | undefined>) {
  return elementRef ? toValue(elementRef) || null : null;
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
 * 获取菜单布局尺寸。
 * @param menuEl 菜单根节点
 * @returns 菜单尺寸
 */
function getMenuSize(menuEl: HTMLElement): Size {
  /**
   * 过渡动画会对 getBoundingClientRect() 产生 transform 缩放影响，
   * 首次打开时需要优先使用未受 transform 影响的布局尺寸来计算定位。
   */
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
  triggerElRef: MaybeRefOrGetter<HTMLElement | null | undefined> | undefined,
  menuElRef: MaybeRefOrGetter<HTMLElement | null | undefined> | undefined,
  visible: Ref<boolean>,
  closeMenu: () => boolean,
  options: MaybeRefOrGetter<Pick<ContextMenuOptions, 'closeOnContextMenu' | 'closeOnOutsideClick' | 'closeOnScroll'>>,
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

    const menuEl = resolveElement(menuElRef);
    if (menuEl && path.includes(menuEl)) {
      return;
    }

    const triggerEl = resolveElement(triggerElRef);
    if (triggerEl && path.includes(triggerEl)) {
      /**
       * 菜单已打开时，再次右击触发区会先触发 pointerdown，随后才触发 contextmenu。
       * 这里保留右键流程，让后续 contextmenu 直接复用当前菜单并更新位置；
       * 左键点击触发区则视为外部点击，应当关闭菜单。
       */
      if (event.button === 2) {
        // TODO
        // return;
      }
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

    const menuEl = resolveElement(menuElRef);
    if (menuEl && path.includes(menuEl)) {
      return;
    }

    // TODO
    // const triggerEl = resolveElement(triggerElRef);
    // if (triggerEl && path.includes(triggerEl)) {
    //   return;
    // }

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
    if (!visible.value || !toValue(options).closeOnScroll) {
      return;
    }
    closeMenu();
  }

  /**
   * 添加全局监听。
   */
  function addGlobalListeners() {
    if (hasListeners.value) {
      return;
    }

    /**
     * 使用 pointerdown 统一处理外部关闭有两个好处：
     * 1. 点击触发打开的场景中，pointerdown 发生在 open() 之前，不会误关刚显示的菜单；
     * 2. 对触摸、鼠标和触控笔输入保持一致。
     *
     * 这里使用捕获阶段，避免被业务层 stopPropagation 干扰。
     */
    document.addEventListener('pointerdown', handleDocumentPointerDown, true);
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

    document.removeEventListener('pointerdown', handleDocumentPointerDown, true);
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

  const menuPositionStyle = computed<CSSProperties>(() => {
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
    const menuEl = resolveElement(resolvedOptions.menuElRef);
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
   * @param emitOpen 是否触发打开回调
   */
  function openAtPosition(x: number, y: number, event?: MouseEvent, emitOpen = true) {
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

    if (event && emitOpen) {
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
    openAtPosition(event.clientX, event.clientY, event, true);
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
  function handleTriggerContextMenu(event: MouseEvent) {
    openMenu(event);
  }

  useGlobalListeners(
    toValue(options).triggerElRef,
    toValue(options).menuElRef,
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
    resolveElement(toValue(options).menuElRef)?.focus();
  });

  return {
    handleTriggerContextMenu,
    closeMenu,
    menuPosition,
    menuPositionStyle,
    openAtPosition,
    openMenu,
    position,
    updateMenuPosition,
    visible,
  };
}
