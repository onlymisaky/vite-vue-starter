<script setup lang="ts">
import type { CSSProperties } from 'vue';
import type { ContextMenuContext, MenuItem } from './types';
import { computed, nextTick, ref } from 'vue';

const props = withDefaults(defineProps<{
  item: MenuItem
  context: ContextMenuContext
  closeOnClick: boolean
  offset: number
  zIndex: number
  level?: number
}>(), {
  level: 0,
});

const emit = defineEmits<{
  select: [payload: { key: string, item: MenuItem, context: ContextMenuContext }]
  close: []
}>();

defineSlots<{
  item?: (props: {
    item: MenuItem
    context: ContextMenuContext
    active: boolean
  }) => any
}>();

const itemRef = ref<HTMLElement>();
const submenuRef = ref<HTMLElement>();
const active = ref(false);
const submenuVisible = ref(false);
const submenuPosition = ref({ x: 0, y: 0 });

const children = computed(() => {
  return (props.item.children || []).filter(child => !child.hidden);
});

const hasChildren = computed(() => {
  return props.level < 1 && children.value.length > 0;
});

const submenuStyle = computed<CSSProperties>(() => {
  return {
    left: `${submenuPosition.value.x}px`,
    top: `${submenuPosition.value.y}px`,
    zIndex: `${props.zIndex + props.level + 1}`,
  };
});

function updateSubmenuPosition() {
  const triggerRect = itemRef.value?.getBoundingClientRect();
  const submenuRect = submenuRef.value?.getBoundingClientRect();

  if (!triggerRect || !submenuRect) {
    return;
  }

  const padding = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let x = triggerRect.right + props.offset;
  let y = triggerRect.top;

  if (x + submenuRect.width > viewportWidth - padding) {
    x = triggerRect.left - submenuRect.width - props.offset;
  }

  if (y + submenuRect.height > viewportHeight - padding) {
    y = viewportHeight - submenuRect.height - padding;
  }

  if (x < padding) {
    x = padding;
  }

  if (y < padding) {
    y = padding;
  }

  submenuPosition.value = { x, y };
}

function handleMouseEnter() {
  active.value = true;

  if (!hasChildren.value) {
    return;
  }

  submenuVisible.value = true;
  nextTick(updateSubmenuPosition);
}

function handleMouseLeave() {
  active.value = false;
  submenuVisible.value = false;
}

async function handleClick() {
  if (props.item.disabled || hasChildren.value) {
    return;
  }

  await props.item.onClick?.(props.context);

  emit('select', {
    key: props.item.key,
    item: props.item,
    context: props.context,
  });

  if (props.closeOnClick) {
    emit('close');
  }
}

function handleChildSelect(payload: { key: string, item: MenuItem, context: ContextMenuContext }) {
  emit('select', payload);
}
</script>

<template>
  <li
    ref="itemRef"
    class="context-menu-item"
    :class="{
      'is-active': active,
      'is-disabled': item.disabled,
      'is-danger': item.danger,
      'is-divided': item.divided,
      'has-children': hasChildren,
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
    @click.stop="handleClick"
  >
    <slot name="item" :item="item" :context="context" :active="active || submenuVisible">
      <span class="context-menu-item__main">
        <span v-if="item.icon" class="context-menu-item__icon">
          <component :is="item.icon" v-if="typeof item.icon !== 'string'" />
          <i v-else :class="item.icon" />
        </span>
        <span class="context-menu-item__label">{{ item.label }}</span>
      </span>
    </slot>

    <ElIcon v-if="hasChildren" class="context-menu-item__arrow">
      <ArrowRight />
    </ElIcon>

    <ul
      v-if="hasChildren && submenuVisible"
      ref="submenuRef"
      class="context-menu-panel context-menu-submenu"
      :style="submenuStyle"
      @contextmenu.prevent
    >
      <ContextMenuItem
        v-for="child in children"
        :key="child.key"
        :item="child"
        :context="context"
        :close-on-click="closeOnClick"
        :offset="offset"
        :z-index="zIndex"
        :level="level + 1"
        @select="handleChildSelect"
        @close="emit('close')"
      >
        <template #item="slotProps">
          <slot name="item" v-bind="slotProps" />
        </template>
      </ContextMenuItem>
    </ul>
  </li>
</template>

<style scoped lang="scss">
@forward './style';

.context-menu-item {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 180px;
  gap: 12px;
  padding: 8px 12px;
  font-size: 13px;
  line-height: 20px;
  color: var(--el-text-color-primary);
  cursor: pointer;
  user-select: none;
  transition: background-color .15s ease, color .15s ease;

  &.is-divided {
    border-top: 1px solid var(--el-border-color-lighter);
    margin-top: 4px;
    padding-top: 12px;
  }

  &.is-active {
    background-color: var(--el-fill-color-light);
  }

  &.is-danger {
    color: var(--el-color-danger);
  }

  &.is-disabled {
    color: var(--el-text-color-disabled);
    cursor: not-allowed;
  }

  &.is-disabled.is-active {
    background-color: transparent;
  }
}

.context-menu-item__main {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  gap: 8px;
  flex: 1;
}

.context-menu-item__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

.context-menu-item__label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.context-menu-item__arrow {
  flex-shrink: 0;
  color: var(--el-text-color-secondary);
}

.context-menu-submenu {
  position: fixed;
  margin: 0;
  padding: 6px;
  list-style: none;
}
</style>
