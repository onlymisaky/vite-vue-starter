<script setup lang="ts" generic="T">
import type { CSSProperties } from 'vue';
import type { ContextMenuContext, MenuItem } from './types';
import { computed, nextTick, ref, watch } from 'vue';
import SlotFallback from '../SlotFallback/SlotFallback.vue';

const props = withDefaults(defineProps<{
  /** 当前菜单项 */
  item: MenuItem<T>
  /** 当前菜单上下文 */
  context: ContextMenuContext<T>
  /** 当前菜单项路径 */
  path: number[]
  /** 当前激活路径 */
  activePath: number[]
  /** 子菜单偏移量 */
  offset: number
  /** 菜单层级 */
  level?: number
  /** 菜单基础 z-index */
  zIndex: number
  /** 子菜单优先展开方向 */
  preferredDirection?: 'left' | 'right'
}>(), {
  level: 0,
  preferredDirection: 'right',
});

const emit = defineEmits<{
  activate: [path: number[]]
  select: [item: MenuItem<T>]
}>();

defineSlots<{
  item?: (props: {
    item: MenuItem<T>
    context: ContextMenuContext<T>
    active: boolean
  }) => any
}>();

const itemContentRef = ref<HTMLElement>();
const submenuRef = ref<HTMLElement>();
const submenuPosition = ref({ x: 0, y: 0 });
const submenuDirection = ref<'left' | 'right'>(props.preferredDirection);

const children = computed(() => {
  return (props.item.children || []).filter(child => !child.hidden);
});

const hasChildren = computed(() => {
  return children.value.length > 0;
});

const exactActive = computed(() => {
  return isSamePath(props.path, props.activePath);
});

const submenuVisible = computed(() => {
  return hasChildren.value && isPathPrefix(props.path, props.activePath);
});

const displayActive = computed(() => {
  return exactActive.value || submenuVisible.value;
});

const renderContentProps = computed(() => {
  return {
    item: props.item,
    context: props.context,
    active: displayActive.value,
  };
});

const RenderItemContent = () => props.item.render?.(renderContentProps.value);

const submenuStyle = computed<CSSProperties>(() => {
  return {
    left: `${submenuPosition.value.x}px`,
    top: `${submenuPosition.value.y}px`,
    zIndex: `${props.zIndex + props.level + 1}`,
  };
});

/**
 * 判断两个路径是否完全一致。
 * @param left 左侧路径
 * @param right 右侧路径
 * @returns 是否一致
 */
function isSamePath(left: number[], right: number[]) {
  if (left.length !== right.length) {
    return false;
  }

  return left.every((value, index) => value === right[index]);
}

/**
 * 判断分支路径是否为当前激活路径的前缀。
 * @param branchPath 分支路径
 * @param activePath 当前激活路径
 * @returns 是否处于当前展开分支
 */
function isPathPrefix(branchPath: number[], activePath: number[]) {
  if (branchPath.length > activePath.length) {
    return false;
  }

  return branchPath.every((value, index) => value === activePath[index]);
}

/**
 * 更新子菜单在视口内的位置。
 */
function updateSubmenuPosition() {
  const triggerRect = itemContentRef.value?.getBoundingClientRect();
  const submenuRect = submenuRef.value?.getBoundingClientRect();

  if (!triggerRect || !submenuRect) {
    return;
  }

  const padding = 8;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;

  let direction = props.preferredDirection;
  let x = direction === 'left'
    ? triggerRect.left - submenuRect.width - props.offset
    : triggerRect.right + props.offset;
  let y = triggerRect.top;

  if (direction === 'right' && x + submenuRect.width > viewportWidth - padding) {
    x = triggerRect.left - submenuRect.width - props.offset;
    direction = 'left';
  }

  if (direction === 'left' && x < padding) {
    x = triggerRect.right + props.offset;
    direction = 'right';
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

  submenuDirection.value = direction;
  submenuPosition.value = { x, y };
}

/**
 * 处理鼠标移入激活。
 */
function handleMouseEnter() {
  emit('activate', props.path);
}

/**
 * 处理菜单项点击。
 */
function handleClick() {
  if (props.item.disabled) {
    return;
  }

  if (hasChildren.value) {
    emit('activate', props.path);
    return;
  }

  emit('select', props.item);
}

watch(submenuVisible, async (nextVisible) => {
  if (!nextVisible) {
    return;
  }

  await nextTick();
  updateSubmenuPosition();
});
</script>

<template>
  <li
    class="context-menu-item"
    :class="{
      'is-active': displayActive,
      'is-disabled': item.disabled,
      'is-danger': item.danger,
      'is-divided': item.divided,
      'has-children': hasChildren,
    }"
    role="menuitem"
    :aria-disabled="item.disabled || undefined"
    :aria-expanded="hasChildren ? submenuVisible : undefined"
  >
    <div
      ref="itemContentRef"
      class="context-menu-item__content"
      @mouseenter="handleMouseEnter"
      @click.stop="handleClick"
    >
      <RenderItemContent v-if="item.render" />
      <SlotFallback
        v-else
        name="item"
        v-bind="renderContentProps"
      >
        <span class="context-menu-item__main">
          <span v-if="item.icon" class="context-menu-item__icon">
            <component :is="item.icon" v-if="typeof item.icon !== 'string'" />
            <i v-else :class="item.icon" />
          </span>
          <span class="context-menu-item__label">{{ item.label }}</span>
        </span>
      </SlotFallback>
      <ElIcon v-if="hasChildren" class="context-menu-item__arrow">
        <ArrowRight />
      </ElIcon>
    </div>

    <ul
      v-if="submenuVisible"
      ref="submenuRef"
      class="context-menu-panel context-menu-submenu"
      :style="submenuStyle"
      role="menu"
      @contextmenu.prevent
    >
      <ContextMenuItem
        v-for="(child, childIndex) in children"
        :key="child.key"
        :item="child"
        :context="context"
        :path="[...path, childIndex]"
        :active-path="activePath"
        :offset="offset"
        :z-index="zIndex"
        :level="level + 1"
        :preferred-direction="submenuDirection"
        @activate="emit('activate', $event)"
        @select="emit('select', $event)"
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
}

.context-menu-item__content {
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
  outline: none;
}

.context-menu-item.is-divided>.context-menu-item__content {
  margin-top: 4px;
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}

.context-menu-item.is-active>.context-menu-item__content {
  background-color: var(--el-fill-color-light);
}

.context-menu-item.is-danger>.context-menu-item__content {
  color: var(--el-color-danger);
}

.context-menu-item.is-disabled>.context-menu-item__content {
  color: var(--el-text-color-disabled);
  cursor: not-allowed;
}

.context-menu-item.is-disabled.is-active>.context-menu-item__content {
  background-color: transparent;
}

.context-menu-item__main {
  display: inline-flex;
  min-width: 0;
  flex: 1;
  align-items: center;
  gap: 8px;
}

.context-menu-item__icon {
  display: inline-flex;
  width: 16px;
  height: 16px;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
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
