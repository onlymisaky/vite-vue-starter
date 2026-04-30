<script setup lang="ts">
import type { VNode } from 'vue';
import { getCurrentInstance, useAttrs, useSlots } from 'vue';
import { isRenderableVNode } from './utils';

const props = withDefaults(defineProps<{
  name?: string
  /** 自定义判断是否渲染 fallback */
  isFallback?: (vNodes: VNode[] | undefined) => boolean
}>(), {
  name: 'default',
  isFallback: (vNodes: VNode[] | undefined) => {
    if (!vNodes?.length) {
      return true;
    }
    return !vNodes.some(node => isRenderableVNode(node));
  },
});

const instance = getCurrentInstance();

const attrs = useAttrs();
const slots = useSlots();

function RenderResolvedSlot() {
  const slot = instance?.parent?.slots[props.name];

  if (!slot) {
    return slots.default?.();
  }

  const nodes = slot(attrs);

  if (props.isFallback(nodes)) {
    return slots.default?.();
  }

  return nodes;
}
</script>

<template>
  <RenderResolvedSlot />
</template>
