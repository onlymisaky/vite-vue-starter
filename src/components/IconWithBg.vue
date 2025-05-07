<script setup lang="ts">
import type { ElTooltipProps, IconProps } from 'element-plus';
import { computed, useAttrs } from 'vue';

interface Props extends /* @vue-ignore */ IconProps {
  bgPadding?: number
  tip?: string | Partial<ElTooltipProps>
}

const props = withDefaults(defineProps<Props>(), {
  bgPadding: 8,
});

const slots = defineSlots();
const attrs = useAttrs();

/**
 * 不确定上面这声明 props 的方式，是否会把 bgPadding、tip、size 等等属性挂在 $porps 上
 * 还是放在 $attrs 上，所以这里为了避免bug，直接合并到一个对象上
 * 后记：
 *  在上面声明 props 的时候，如果使用 @vue-ignore 注释，
 *  除了内部声明的 props 会挂在到 $props 上，(bgPadding、tip)
 *  其他属性都会挂在到 $attrs 上
 */
const propsAndAttrs = computed(() => {
  return { ...attrs, ...props };
});

// 将剩余属性全部绑定到 icon 上，例如事件、样式等
const iconProps = computed(() => {
  const { tip, bgPadding, ...rest } = propsAndAttrs.value;
  return rest;
});

const tipProps = computed<ElTooltipProps>(() => {
  const { tip } = propsAndAttrs.value;
  const defaultProps = { showAfter: 200, hideAfter: 0 } as ElTooltipProps;
  if (!tip || typeof tip === 'string') {
    return defaultProps;
  }
  if (typeof tip === 'object') {
    return { ...defaultProps, ...tip };
  }
  return defaultProps;
});

const tipStr = computed(() => {
  const { tip } = propsAndAttrs.value;
  if (tip) {
    if (typeof tip === 'string') {
      return tip;
    }
    return tip.content;
  }
  return null;
});

const hasTip = computed(() => tipStr.value || slots.tip);

const padding = computed(() => `-${props.bgPadding}px`);
</script>

<template>
  <ElIcon
    v-bind="iconProps"
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
