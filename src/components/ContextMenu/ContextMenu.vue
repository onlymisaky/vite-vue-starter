<script setup lang="ts" generic="T">
import type { TemplateRef } from 'vue';
import type { ContextMenuContext, ContextMenuProps, MenuItem } from './types';
import { computed, ref, useTemplateRef } from 'vue';
import ContextMenuHost from './ContextMenuHost.vue';
import { useContextMenu } from './hooks/useContextMenu';

const props = withDefaults(defineProps<ContextMenuProps<T>>(), {
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
const hostRef = useTemplateRef('hostRef');
const menuRef = computed(() => hostRef.value?.panelRef);
const currentContext = ref<ContextMenuContext<T>>();

const {
  closeMenu,
  menuPositionStyle,
  visible,
  handleTriggerContextMenu,
} = useContextMenu(() => ({
  triggerElRef: triggerRef,
  menuElRef: menuRef as TemplateRef<HTMLElement>,
  disabled: props.disabled,
  closeOnContextMenu: props.closeOnContextMenu,
  closeOnOutsideClick: props.closeOnOutsideClick,
  offset: props.offset,
  padding: 8,
  zIndex: props.zIndex,
  onClose: () => {
    currentContext.value = undefined;
    emit('close');
  },
  onOpen: (event: MouseEvent) => {
    currentContext.value = {
      event,
      target: event.target instanceof HTMLElement ? event.target : null,
      data: props.data,
      source: 'component',
    };
    emit('open', currentContext.value);
  },
}));

/**
 * 处理组件菜单选择事件。
 * @param key 菜单项 key
 * @param item 菜单项
 * @param context 右键上下文
 */
function handleSelect(key: string, item: MenuItem<T>, context: ContextMenuContext<T>) {
  emit('select', key, item, context);
}

defineExpose({
  close: closeMenu,
});
</script>

<template>
  <div
    ref="triggerRef"
    class="contents"
    @contextmenu="handleTriggerContextMenu"
  >
    <slot />
  </div>

  <Teleport to="body">
    <ContextMenuHost
      ref="hostRef"
      :items="items"
      :context="currentContext"
      :visible="visible"
      :menu-position-style="menuPositionStyle"
      :offset="offset"
      :z-index="zIndex"
      :close-on-click="closeOnClick"
      :close-menu="closeMenu"
      @select="handleSelect"
    >
      <template #item="slotProps">
        <slot name="item" v-bind="slotProps" />
      </template>
    </ContextMenuHost>
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
