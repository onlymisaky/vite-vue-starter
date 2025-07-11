<script setup lang="ts">
/**
 * 为 ElIcon 添加一个鼠标悬浮的背景 和 悬浮时提示文案
 */

import type { ElTooltipProps, IconProps } from 'element-plus';
import { computed } from 'vue';

interface Props extends IconProps {
  /**
   * 背景的内边距
   */
  bgPadding?: number

  /**
   * 提示信息，可以是字符串，也可以是 ElTooltipProps
   */
  tip?: string | Partial<ElTooltipProps>
}

const props = withDefaults(defineProps<Props>(), {
  bgPadding: 8,
});

const slots = defineSlots<{
  default: () => any
  tip: () => any
}>();

// 将剩余属性全部绑定到 icon 上，例如事件、样式等
const iconProps = computed(() => {
  const { tip, bgPadding, ...rest } = props;
  return rest;
});

const tipProps = computed<ElTooltipProps>(() => {
  const { tip } = props;
  const defaultProps = { showAfter: 200, hideAfter: 0 } as ElTooltipProps;
  if (!tip || typeof tip === 'string') {
    return { ...defaultProps, content: tip as string };
  }
  if (typeof tip === 'object') {
    return { ...defaultProps, ...tip };
  }
  return defaultProps;
});

const tipStr = computed(() => {
  return tipProps.value.content;
});

const hasTip = computed(() => tipStr.value || slots.tip);

const padding = computed(() => `-${props.bgPadding}px`);
</script>

<template>
  <ElIcon
    v-bind="{ ...$attrs, ...iconProps }"
    class="icon-wrapper"
  >
    <ElTooltip
      v-if="hasTip"
      v-bind="tipProps"
    >
      <template v-if="tipStr || $slots.tip" #content>
        <slot
          v-if="$slots.tip"
          name="tip"
        />
        <template v-else>
          {{ tipStr }}
        </template>
      </template>
      <slot />
    </ElTooltip>
    <slot v-else />
  </ElIcon>
</template>

<style scoped>
.icon-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--app-text-color-primary);
  border-radius: 50%;
  position: relative;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: var(--app-bg-color-page);
    z-index: -1;
    transform: scale(0);
    transition: all 0.1s ease;
  }

  &:hover::after {
    inset: v-bind('padding');
    transform: scale(1);
  }
}
</style>
