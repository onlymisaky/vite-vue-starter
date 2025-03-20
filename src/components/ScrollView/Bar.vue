<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, ref, useTemplateRef, watch } from 'vue';
import { useDragScrollBar } from './composables';
import { calculateThumbPositionByScrollDistance, calculateThumbSize } from './utils';

const props = defineProps({
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'vertical',
  },
  visibleContainerSize: {
    type: Number,
    default: 0,
  },
  totalContentSize: {
    type: Number,
    default: 0,
  },
  maxScrollableDistance: {
    type: Number,
    default: 0,
  },
  currentScrollDistance: {
    type: Number,
    default: 0,
  },
});

const emit = defineEmits<{
  move: [mouseMovementDistance: number, thumb: {
    thumbSize: number
    thumbPosition: number
    availableThumbSpace: number
  }]
  barClick: [event: MouseEvent, data: {
    isThumb: boolean
    position: number
  }]
}>();

const thumbSize = computed(() => {
  return calculateThumbSize(props.visibleContainerSize, props.totalContentSize);
});

const availableThumbSpace = computed(() => {
  return props.visibleContainerSize - thumbSize.value;
});

/**
 * 期初的思路是通过 computed 计算出 currentThumbPosition
 * 在滑块移动过程中，修改 currentScrollDistance
 * 但是实际操作中，返现拖动滑块的时候跟手
 * 所以最终还是决定 currentThumbPosition 和 currentScrollDistance 由各组件维护
 * 同步两者状态，交由事件出来
 */
const currentThumbPosition = ref(0);
const watchHandler = watch(() => [props.visibleContainerSize, props.totalContentSize, props.currentScrollDistance, thumbSize.value], () => {
  currentThumbPosition.value = calculateThumbPositionByScrollDistance(
    props.visibleContainerSize,
    props.totalContentSize,
    props.currentScrollDistance,
    thumbSize.value,
  );
});

const barRef = useTemplateRef<HTMLDivElement>('barRef');
const thumbRef = useTemplateRef<HTMLDivElement>('thumbRef');
const thumbStyle = computed(() => {
  if (!thumbSize.value) {
    return {};
  }
  if (props.direction === 'vertical') {
    return {
      height: `${thumbSize.value}px`,
      transform: `translateY(${currentThumbPosition.value}px)`,
    };
  }
  if (props.direction === 'horizontal') {
    return {
      width: `${thumbSize.value}px`,
      transform: `translateX(${currentThumbPosition.value}px)`,
    };
  }
  return {};
});

const { isDragging, startDrag } = useDragScrollBar(
  currentThumbPosition,
  computed(() => ({
    thumbSize: thumbSize.value,
    direction: props.direction,
    availableThumbSpace: availableThumbSpace.value,
    onScroll: (mouseMovementDistance: number) => {
      emit('move', mouseMovementDistance, {
        thumbSize: thumbSize.value,
        availableThumbSpace: availableThumbSpace.value,
        thumbPosition: currentThumbPosition.value,
      });
    },
  })),
);

watch(() => isDragging.value, (value) => {
  if (value) {
    watchHandler.pause();
    return;
  }
  watchHandler.resume();
});

function handleBarClick(event: MouseEvent) {
  let isThumb = false;
  if (event.target === thumbRef.value) {
    isThumb = true;
  }

  let position = 0;

  if (props.direction === 'vertical') {
    position = event.offsetY;
  }

  if (props.direction === 'horizontal') {
    position = event.offsetX;
  }

  emit('barClick', event, { isThumb, position });
}
</script>

<template>
  <div
    v-show="thumbSize > 0"
    ref="barRef"
    class="absolute cursor-pointer transition-opacity duration-200 ease-out"
    :class="{
      'top-0 bottom-0 right-0 w-[6px]': direction === 'vertical',
      'left-0 right-0 bottom-0 h-[6px]': direction === 'horizontal',
      '!block': isDragging,
    }"
    @click="handleBarClick"
  >
    <div
      ref="thumbRef"
      class="rounded-[4px] opacity-30 bg-[var(--el-text-color-secondary)] cursor-pointer
      transition-[transform,opacity] duration-200 ease-out
      hover:opacity-100
      "
      :class="{
        'w-full': direction === 'vertical',
        'h-full': direction === 'horizontal',
        '!cursor-grabbing !opacity-100': isDragging,
      }"
      :style="thumbStyle"
      @mousedown="startDrag"
    />
  </div>
</template>
