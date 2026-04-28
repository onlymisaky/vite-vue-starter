<script setup lang="ts" generic="T">
import type { ContextMenuContext, MenuItem } from './types';
import { computed, ref, useTemplateRef } from 'vue';
import { useContextmenu } from '@/components/ContextMenu/hooks/useContextmenu';
import ContextMenuItem from './ContextMenuItem.vue';

const props = withDefaults(defineProps<{
  /** 菜单项列表 */
  items: MenuItem[]
  /** 自定义数据 */
  data?: T
  /** 是否在点击菜单项时关闭菜单 */
  closeOnClick?: boolean
  /** 是否在点击菜单外部时关闭菜单 */
  closeOnOutsideClick?: boolean
  /** 菜单向右下偏移量 */
  offset?: number
  /** 菜单 Z-index */
  zIndex?: number
  /** 是否禁用菜单 */
  disabled?: boolean
}>(), {
  closeOnClick: true,
  closeOnOutsideClick: true,
  offset: 4,
  disabled: false,
});

const emit = defineEmits<{
  select: [key: string, item: MenuItem, context: ContextMenuContext]
  open: [context: ContextMenuContext]
  close: []
}>();

defineSlots<{
  default?: () => any
  item?: (props: {
    item: MenuItem
    context: ContextMenuContext
    active: boolean
  }) => any
}>();

const triggerRef = useTemplateRef('triggerRef');
const menuRef = useTemplateRef('menuRef');
const currentContext = ref<ContextMenuContext>();

const normalizedItems = computed(() => {
  return props.items.filter(item => !item.hidden);
});

function handleSelect(payload: { key: string, item: MenuItem, context: ContextMenuContext }) {
  emit('select', payload.key, payload.item, payload.context);
}

const { closeMenu, menuStyle, visible } = useContextmenu(triggerRef, () => ({
  disabled: props.disabled,
  closeOnOutsideClick: props.closeOnOutsideClick,
  menuElRef: menuRef,
  offset: props.offset,
  zIndex: props.zIndex,
  padding: 8,
  onMenuContext: (event: MouseEvent) => {
    currentContext.value = {
      event,
      target: event.target instanceof HTMLElement ? event.target : null,
      data: props.data,
      source: 'component',
    };
    emit('open', currentContext.value);
  },
}));
</script>

<template>
  <div
    ref="triggerRef"
    class="contents"
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
        @contextmenu.prevent
      >
        <ul class="context-menu-list">
          <ContextMenuItem
            v-for="item in normalizedItems"
            :key="item.key"
            :item="item"
            :context="currentContext"
            :close-on-click="closeOnClick"
            :offset="offset"
            :z-index="zIndex || 3000"
            @select="handleSelect"
            @close="closeMenu"
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
