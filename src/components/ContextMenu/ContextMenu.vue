<script setup lang="ts" generic="T">
import type { ContextMenuContext, MenuItem } from './types';
import { computed, ref, useTemplateRef, watch } from 'vue';
import ContextMenuItem from './ContextMenuItem.vue';
import { useContextMenu } from './hooks/useContextMenu';
import { getVisibleChildren, useMenuKeyboard } from './hooks/useMenuKeyboard';

const props = withDefaults(defineProps<{
  /** 菜单项列表 */
  items: MenuItem<T>[]
  /** 菜单上下文数据 */
  data?: T
  /** 点击菜单项后是否自动关闭 */
  closeOnClick?: boolean
  /** 点击菜单外部后是否自动关闭 */
  closeOnOutsideClick?: boolean
  /** 菜单打开时再次右键外部是否关闭 */
  closeOnContextMenu?: boolean
  /** 菜单面板偏移量 */
  offset?: number
  /** 菜单 Z-index */
  zIndex?: number
  /** 是否禁用菜单 */
  disabled?: boolean
}>(), {
  closeOnClick: true,
  closeOnOutsideClick: true,
  closeOnContextMenu: true,
  offset: 4,
  disabled: false,
});

const emit = defineEmits<{
  select: [key: string, item: MenuItem<T>, context: ContextMenuContext<T>]
  open: [context: ContextMenuContext<T>]
  close: []
}>();

defineSlots<{
  default?: () => any
  item?: (props: {
    item: MenuItem<T>
    context: ContextMenuContext<T>
    active: boolean
  }) => any
}>();

const triggerRef = useTemplateRef('triggerRef');
const menuRef = useTemplateRef('menuRef');
const currentContext = ref<ContextMenuContext<T>>();

const normalizedItems = computed(() => {
  return props.items.filter(item => !item.hidden);
});

const {
  closeMenu: closeMenuState,
  menuStyle,
  visible,
  handleTriggerContextmenu,
} = useContextMenu(() => ({
  triggerElRef: triggerRef,
  menuElRef: menuRef,
  disabled: props.disabled,
  closeOnContextMenu: props.closeOnContextMenu,
  closeOnOutsideClick: props.closeOnOutsideClick,
  offset: props.offset,
  padding: 8,
  zIndex: props.zIndex,
  onClose: handleMenuClosed,
  onOpen: handleMenuOpened,
}));

/**
 * 执行菜单项选择逻辑。
 * @param item 当前菜单项
 */
async function handleSelectItem(item: MenuItem<T>) {
  if (!currentContext.value || item.disabled || getVisibleChildren(item).length > 0) {
    return;
  }

  await item.onClick?.(currentContext.value);
  emit('select', item.key, item, currentContext.value);

  if (props.closeOnClick) {
    closeMenuState();
  }
}

const { activePath, handleKeydown } = useMenuKeyboard(
  visible,
  closeMenuState,
  normalizedItems,
  handleSelectItem,
);

/**
 * 判断路径是否有效。
 * @param path 菜单项路径
 * @returns 是否有效
 */
function isPathValid(path: number[]) {
  let currentItems = normalizedItems.value;

  for (const index of path) {
    const currentItem = currentItems[index];
    if (!currentItem) {
      return false;
    }
    currentItems = getVisibleChildren(currentItem);
  }

  return true;
}

/**
 * 处理菜单打开。
 * @param event 右键事件
 */
function handleMenuOpened(event: MouseEvent) {
  currentContext.value = {
    event,
    target: event.target instanceof HTMLElement ? event.target : null,
    data: props.data,
    source: 'component',
  };
  activePath.value = [];
  emit('open', currentContext.value);
}

/**
 * 处理菜单关闭后的状态清理。
 */
function handleMenuClosed() {
  activePath.value = [];
  currentContext.value = undefined;
  emit('close');
}

watch(() => props.items, () => {
  if (!activePath.value.length) {
    return;
  }

  if (!isPathValid(activePath.value)) {
    activePath.value = [];
  }
}, { deep: true });

defineExpose({
  close: closeMenuState,
});
</script>

<template>
  <div
    ref="triggerRef"
    class="contents"
    @contextmenu="handleTriggerContextmenu"
  >
    <slot />
  </div>

  <Teleport to="body">
    <Transition name="el-zoom-in-top">
      <div
        v-if="visible && currentContext"
        ref="menuRef"
        class="context-menu-panel"
        :style="menuStyle"
        tabindex="-1"
        role="menu"
        @contextmenu.prevent
        @keydown="handleKeydown"
      >
        <ul class="context-menu-list" role="none">
          <ContextMenuItem
            v-for="(item, index) in normalizedItems"
            :key="item.key"
            :item="item"
            :context="currentContext"
            :path="[index]"
            :active-path="activePath"
            :offset="offset"
            :z-index="zIndex || 3000"
            @activate="activePath = $event"
            @select="handleSelectItem"
          >
            <template #item="slotProps">
              <slot name="item" v-bind="slotProps" />
            </template>
          </ContextMenuItem>
        </ul>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
@forward './style';

.context-menu-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
