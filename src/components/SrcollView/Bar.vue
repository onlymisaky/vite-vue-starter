<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, useTemplateRef } from 'vue';
import { useDragScrollBar } from './composables';

const props = defineProps({
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'vertical',
  },
  size: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits(['scroll']);

const barRef = useTemplateRef<HTMLDivElement>('barRef');
const thumbRef = useTemplateRef<HTMLDivElement>('thumbRef');
const barSize = computed(() => {
  if (!props.size) {
    return {};
  }
  if (props.direction === 'vertical') {
    return {
      height: `${props.size}px`,
    };
  }
  if (props.direction === 'horizontal') {
    return {
      width: `${props.size}px`,
    };
  }
  return {};
});

const { isDragging, locateToClickPosition, startDrag } = useDragScrollBar(
  barRef,
  thumbRef,
  computed(() => ({
    size: props.size,
    direction: props.direction,
    onScroll: (delta: number) => emit('scroll', delta),
  })),
);
</script>

<template>
  <div
    ref="barRef"
    class="absolute cursor-pointer ransition-opacity duration-200 ease-out"
    :class="{
      'top-0 bottom-0 right-0 w-[6px]': direction === 'vertical',
      'left-0 right-0 bottom-0 h-[6px]': direction === 'horizontal',
      '!block': isDragging,
    }"
    @click="locateToClickPosition"
  >
    <div
      ref="thumbRef"
      class="absolute rounded-[4px] opacity-30 bg-[var(--el-text-color-secondary)] cursor-pointer
      transition-opacity duration-200 ease-out
      hover:opacity-100
      "
      :class="{
        'left-0 right-0': direction === 'vertical',
        'top-0 bottom-0': direction === 'horizontal',
        '!cursor-grabbing !opacity-100': isDragging,
      }"
      :style="barSize"
      @mousedown="startDrag"
    />
  </div>
</template>
