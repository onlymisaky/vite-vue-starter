<script setup lang="ts">
import type { PropType } from 'vue';
import { throttle } from 'lodash-es';
import { computed, ref, useTemplateRef } from 'vue';
import Bar from './Bar.vue';
import { useResizeObserver } from './composables';
import { calculateScrollSize, checkCanScroll } from './utils';

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

const translate = ref(0);
const transform = computed(() => {
  if (props.direction === 'horizontal') {
    return `translateX(${translate.value}px)`;
  }
  if (props.direction === 'vertical') {
    return `translateY(${translate.value}px)`;
  }
  return '';
});

function handleScroll(event: WheelEvent) {
  event.stopPropagation();
  event.preventDefault();

  const { canScroll, canScrollSize } = checkCanScroll(props.direction, containerRef, viewRef, translate);
  if (!canScroll) {
    return;
  }

  const scrollSize = translate.value - event.deltaY / 2.5;

  translate.value = calculateScrollSize(scrollSize, canScrollSize);
}

const showBar = ref(false);
const scrollBarSize = ref(0);

const resizeObserverCallback = throttle((_entries: ResizeObserverEntry[]) => {
  const { canScroll, canScrollSize, containerSize, viewSize } = checkCanScroll(props.direction, containerRef, viewRef, translate);
  if (!canScroll) {
    showBar.value = false;
    scrollBarSize.value = 0;
    return;
  }

  // 已滚动的距离大于可滚动的距离
  if (Math.abs(translate.value) > canScrollSize) {
    translate.value = -canScrollSize;
  }

  showBar.value = true;

  scrollBarSize.value = Math.max((containerSize / viewSize) * containerSize, 20);

  if (typeof props.resizeCallback === 'function') {
    props.resizeCallback();
  }
}, 80);

useResizeObserver(containerRef, resizeObserverCallback);
useResizeObserver(viewRef, resizeObserverCallback);

function scrollTo(x: number) {
  const { canScroll, canScrollSize } = checkCanScroll(props.direction, containerRef, viewRef, translate);

  if (!canScroll) {
    return;
  }

  translate.value = calculateScrollSize(-Math.abs(x), canScrollSize);
}

function scroll(size: number) {
  scrollTo(translate.value + size);
}

defineExpose({
  scrollTo,
  scroll,
  checkCanScroll: () => checkCanScroll(props.direction, containerRef, viewRef, translate),
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
      :style="{ transform }"
    >
      <slot />
    </div>
    <!-- TODO -->
    <Bar
      v-if="false"
      v-show="showBar"
      :direction="direction"
      :size="scrollBarSize"
      class="hidden group-hover:block"
    />
  </div>
</template>
