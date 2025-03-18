<script setup lang="ts">
import type { PropType } from 'vue';
import { computed, nextTick, onMounted, onUnmounted, ref, useTemplateRef } from 'vue';

const props = defineProps({
  resizeCallback: {
    type: Function as PropType<() => void>,
    default: () => { },
  },
});

const scrollContainerRef = useTemplateRef<HTMLDivElement>('scrollContainerRef');
const scrollViewRef = useTemplateRef<HTMLDivElement>('scrollViewRef');

const translateX = ref(0);
const transform = computed(() => `translateX(${translateX.value}px)`);

function checkCanScroll() {
  const viewWidth = scrollViewRef.value?.offsetWidth || 0;
  const containerWidth = scrollContainerRef.value?.offsetWidth || 0;
  let canScrollWidth = viewWidth - containerWidth;

  let canScroll = true;
  if (canScrollWidth <= 0) {
    canScroll = false;
    translateX.value = 0;
    canScrollWidth = 0;
  }

  return {
    canScroll,
    viewWidth,
    containerWidth,
    canScrollWidth,
    scrollWidth: translateX.value,
  };
}

function calculateScrollWidth(scrollWidth: number, canScrollWidth: number) {
  let width = scrollWidth;
  if (width > 0) {
    width = 0;
  }

  width = Math.abs(width);

  width = Math.min(width, canScrollWidth);
  width = Math.max(width, 0);

  return -width;
}

function handleScroll(event: WheelEvent) {
  event.stopPropagation();
  event.preventDefault();

  const { canScroll, canScrollWidth } = checkCanScroll();
  if (!canScroll) {
    return;
  }

  const scrollWidth = translateX.value - event.deltaY / 3;

  translateX.value = calculateScrollWidth(scrollWidth, canScrollWidth);
}

function resizeObserverCallback() {
  const { canScroll, canScrollWidth } = checkCanScroll();
  if (!canScroll) {
    return;
  }

  // 已滚动的宽度大于可滚动的宽度
  if (Math.abs(translateX.value) > canScrollWidth) {
    translateX.value = -canScrollWidth;
  }

  if (typeof props.resizeCallback === 'function') {
    props.resizeCallback();
  }
}

let scrollContainerResizeObserver: ResizeObserver;

onMounted(() => {
  nextTick(() => {
    scrollContainerResizeObserver = new ResizeObserver(resizeObserverCallback);
    if (scrollContainerRef.value) {
      scrollContainerResizeObserver.observe(scrollContainerRef.value);
    }
  });
});

onUnmounted(() => {
  if (scrollContainerResizeObserver) {
    scrollContainerResizeObserver.disconnect();
  }
});

function scrollTo(x: number) {
  const { canScroll, canScrollWidth } = checkCanScroll();

  if (!canScroll) {
    return;
  }

  translateX.value = calculateScrollWidth(-Math.abs(x), canScrollWidth);
}

function scrollLeft(x: number) {
  scrollTo(translateX.value + x);
}

function scrollRight(x: number) {
  scrollTo(translateX.value - x);
}

defineExpose({
  scrollTo,
  scrollLeft,
  scrollRight,
  checkCanScroll,
});
</script>

<template>
  <div
    ref="scrollContainerRef"
    class="overflow-hidden p-0 m-0 border-0"
    @wheel="handleScroll"
  >
    <div
      ref="scrollViewRef"
      class="w-[max-content] p-0 m-0 border-0 transition-transform duration-200 ease-out"
      :style="{ transform }"
    >
      <slot />
    </div>
  </div>
</template>
