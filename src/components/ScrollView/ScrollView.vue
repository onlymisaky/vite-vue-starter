<script setup lang="ts">
import type { PropType } from 'vue';
import { throttle } from 'lodash-es';
import { computed, ref, useTemplateRef } from 'vue';
import Bar from './Bar.vue';
import { useResizeObserver } from './composables';
import { calculateNextScrollDistanceByDeltaScrollDistance, getScrollableAreaInfo } from './utils';

const props = defineProps({
  direction: {
    type: String as PropType<'horizontal' | 'vertical'>,
    default: 'vertical',
  },
  resizeCallback: {
    type: Function as PropType<() => void>,
    default: () => { },
  },
});

const visibleContainerRef = useTemplateRef<HTMLDivElement>('visibleContainerRef');
const totalContentRef = useTemplateRef<HTMLDivElement>('totalContentRef');
const visibleContainerSize = ref(0);
const totalContentSize = ref(0);
const currentScrollDistance = ref(0);
const maxScrollableDistance = computed(() => {
  return Math.max(totalContentSize.value - visibleContainerSize.value, 0);
});
const contentStyle = computed(() => {
  if (props.direction === 'horizontal') {
    return { transform: `translateX(${-currentScrollDistance.value}px)` };
  }
  if (props.direction === 'vertical') {
    return { transform: `translateY(${-currentScrollDistance.value}px)` };
  }
  return '';
});

function getScrollInfo() {
  const scrollableInfo = getScrollableAreaInfo(
    props.direction,
    visibleContainerRef.value,
    totalContentRef.value,
  );

  visibleContainerSize.value = scrollableInfo.visibleContainerSize;
  totalContentSize.value = scrollableInfo.totalContentSize;

  if (scrollableInfo.maxScrollableDistance <= 0) {
    currentScrollDistance.value = 0;
  }

  return scrollableInfo;
}

const resizeObserverCallback = throttle((_entries: ResizeObserverEntry[]) => {
  const { maxScrollableDistance } = getScrollInfo();

  if (typeof props.resizeCallback === 'function') {
    props.resizeCallback();
  }

  if (maxScrollableDistance <= 0) {
    currentScrollDistance.value = 0;
    return;
  }

  // 已滚动的距离大于可滚动的距离
  if (currentScrollDistance.value > maxScrollableDistance) {
    currentScrollDistance.value = -maxScrollableDistance;
  }
}, 80);

useResizeObserver(visibleContainerRef, resizeObserverCallback);
useResizeObserver(totalContentRef, resizeObserverCallback);

function scroll(deltaScrollDistance: number) {
  const { maxScrollableDistance } = getScrollInfo();

  if (maxScrollableDistance <= 0) {
    return;
  }

  currentScrollDistance.value = calculateNextScrollDistanceByDeltaScrollDistance(
    currentScrollDistance.value,
    maxScrollableDistance,
    deltaScrollDistance,
  );
}

function scrollTo(x: number) {
  const deltaScrollDistance = x - currentScrollDistance.value;

  scroll(deltaScrollDistance);
}

function handleScroll(event: WheelEvent) {
  event.stopPropagation();
  event.preventDefault();

  const deltaScrollDistance = event.deltaY / 2.5;

  scroll(deltaScrollDistance);
}

function handleBarMove(mouseMovementDistance: number, thumb: {
  thumbSize: number
  availableThumbSpace: number
  thumbPosition: number
}) {
  // 计算滑块移动距离与内容滚动距离的比例
  const scrollDistanceRatio = maxScrollableDistance.value / thumb.availableThumbSpace;

  // 将滑块的移动距离转换为内容的滚动距离
  const deltaScrollDistance = mouseMovementDistance * scrollDistanceRatio;

  scroll(deltaScrollDistance);
}

function handleBarClick(_event: MouseEvent, { isThumb, position }: {
  isThumb: boolean
  position: number
}) {
  if (isThumb)
    return;

  // 计算点击位置对应的滚动位置
  // 点击位置与可滚动内容位置的比例关系：position / visibleContainerSize = targetScrollDistance / maxScrollableDistance
  const scrollPositionRatio = position / visibleContainerSize.value;
  const targetScrollDistance = scrollPositionRatio * maxScrollableDistance.value;

  scrollTo(targetScrollDistance);
}

defineExpose({
  scrollTo,
  scroll,
  getScrollInfo: () => getScrollInfo(),
});
</script>

<template>
  <div
    ref="visibleContainerRef"
    class="w-full h-full overflow-hidden p-0 m-0 border-0 relative group"
    @wheel="handleScroll"
  >
    <div
      ref="totalContentRef"
      :class="{
        'w-[max-content]': direction === 'horizontal',
        'h-[max-content]': direction === 'vertical',
      }"
      class="p-0 m-0 border-0 transition-transform duration-200 ease-out"
      :style="contentStyle"
    >
      <slot />
    </div>
    <Bar
      :current-scroll-distance="currentScrollDistance"
      :direction="direction"
      :visible-container-size="visibleContainerSize"
      :total-content-size="totalContentSize"
      :max-scrollable-distance="maxScrollableDistance"
      class="hidden group-hover:block"
      @move="handleBarMove"
      @bar-click="handleBarClick"
    />
  </div>
</template>
