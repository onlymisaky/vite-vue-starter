<script setup lang="ts">
import type { VNode } from 'vue';
import { computed, getCurrentInstance } from 'vue';
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

const ctx = getCurrentInstance();

const slotNodes = computed(() => {
  const slot = ctx?.parent?.slots[props.name || 'default'];

  if (!slot) {
    return undefined;
  }

  const attrs = ctx.attrs || {};

  return slot(attrs);
});

const hasContent = computed(() => {
  return !props.isFallback(slotNodes.value);
});

const RenderSlotNodes = () => slotNodes.value;
</script>

<template>
  <RenderSlotNodes v-if="hasContent" />
  <slot v-else />
</template>
