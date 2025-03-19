<script setup lang="ts">
import type { PropType } from 'vue';
import { throttle } from 'lodash-es';
import { computed, ref, useTemplateRef } from 'vue';
import Bar from './Bar.vue';
import { useResizeObserver } from './composables';
import { calculateScrollSize, getScrollableAreaInfo } from './utils';

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

const containerRef = useTemplateRef<HTMLDivElement>('containerRef');
const viewRef = useTemplateRef<HTMLDivElement>('viewRef');

const thumbSize = ref(0);

const scrolledSize = ref(0);
const viewStyle = computed(() => {
  if (props.direction === 'horizontal') {
    return { transform: `translateX(${-scrolledSize.value}px)` };
  }
  if (props.direction === 'vertical') {
    return { transform: `translateY(${-scrolledSize.value}px)` };
  }
  return '';
});

function getScrollInfo() {
  const scrollableIfno = getScrollableAreaInfo(
    props.direction,
    containerRef.value,
    viewRef.value,
  );

  thumbSize.value = scrollableIfno.thumbSize;

  if (scrollableIfno.scrollableSize <= 0) {
    scrolledSize.value = 0;
  }

  return scrollableIfno;
}

const resizeObserverCallback = throttle((_entries: ResizeObserverEntry[]) => {
  const { scrollableSize } = getScrollInfo();

  if (typeof props.resizeCallback === 'function') {
    props.resizeCallback();
  }

  if (scrollableSize <= 0) {
    scrolledSize.value = 0;
    return;
  }

  // 已滚动的距离大于可滚动的距离
  if (Math.abs(scrolledSize.value) > scrollableSize) {
    scrolledSize.value = -scrollableSize;
  }
}, 80);

useResizeObserver(containerRef, resizeObserverCallback);
useResizeObserver(viewRef, resizeObserverCallback);

function scroll(wantScrollSize: number) {
  const { scrollableSize } = getScrollInfo();

  if (scrollableSize <= 0) {
    return;
  }

  scrolledSize.value = calculateScrollSize(scrolledSize.value, scrollableSize, wantScrollSize);
}

function scrollTo(x: number) {
  const wantScrollSize = x - scrolledSize.value;

  scroll(wantScrollSize);
}

function handleScroll(event: WheelEvent) {
  event.stopPropagation();
  event.preventDefault();

  const wantScrollSize = event.deltaY / 2.5;

  scroll(wantScrollSize);
}

defineExpose({
  scrollTo,
  scroll,
  getScrollInfo: () => getScrollInfo(),
});
</script>

<template>
  <div
    ref="containerRef"
    class="w-full h-full overflow-hidden p-0 m-0 border-0 relative group"
    @wheel="handleScroll"
  >
    <div
      ref="viewRef"
      :class="{
        'w-[max-content]': direction === 'horizontal',
        'h-[max-content]': direction === 'vertical',
      }"
      class="p-0 m-0 border-0 transition-transform duration-200 ease-out"
      :style="viewStyle"
    >
      <slot />
    </div>
    <!-- TODO -->
    <Bar
      :direction="direction"
      :thumb-size="thumbSize"
      class="hidden group-hover:block"
    />
  </div>
</template>
