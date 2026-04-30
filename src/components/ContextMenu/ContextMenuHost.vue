<script setup lang="ts" generic="T">
import type { ContextMenuContext, ContextMenuHostProps, MenuItem } from './types';
import { computed, toRef, useTemplateRef, watch } from 'vue';
import ContextMenuItem from './ContextMenuItem.vue';
import { getVisibleChildren, useMenuKeyboard } from './hooks/useMenuKeyboard';

const props = withDefaults(defineProps<ContextMenuHostProps<T>>(), {
  closeOnClick: true,
});

const emit = defineEmits<{
  select: [key: string, item: MenuItem<T>, context: ContextMenuContext<T>]
}>();

defineSlots<{
  item?: (props: {
    item: MenuItem<T>
    context: ContextMenuContext<T>
    active: boolean
  }) => any
}>();

const panelRef = useTemplateRef('panelRef');

const normalizedItems = computed(() => {
  return props.items.filter(item => !item.hidden);
});

/**
 * 执行菜单项选择逻辑。
 * @param item 当前菜单项
 */
async function handleSelectItem(item: MenuItem<T>) {
  if (!props.context || item.disabled || getVisibleChildren(item).length > 0) {
    return;
  }

  await item.onClick?.(props.context);
  emit('select', item.key, item, props.context);

  if (props.closeOnClick) {
    props.closeMenu();
  }
}

const { activePath, handleKeydown } = useMenuKeyboard(
  toRef(props, 'visible'),
  props.closeMenu,
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

watch(() => props.items, () => {
  if (!activePath.value.length) {
    return;
  }

  if (!isPathValid(activePath.value)) {
    activePath.value = [];
  }
}, { deep: true });

watch(() => props.visible, (nextVisible) => {
  if (nextVisible) {
    activePath.value = [];
  }
});

defineExpose({
  panelRef,
});
</script>

<template>
  <Transition name="el-zoom-in-top">
    <div
      v-if="visible && context"
      ref="panelRef"
      class="context-menu-panel"
      tabindex="-1"
      role="menu"
      :style="[menuPositionStyle]"
      @contextmenu.prevent
      @keydown.stop="handleKeydown"
    >
      <ul class="context-menu-list">
        <ContextMenuItem
          v-for="(item, index) in normalizedItems"
          :key="item.key"
          :item="item"
          :context="context"
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
</template>

<style scoped lang="scss">
@forward './style';

.context-menu-list {
  margin: 0;
  padding: 0;
  list-style: none;
}
</style>
