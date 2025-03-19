import type { Ref } from 'vue';

/**
 * 检查是否可以滚动
 */
export function checkCanScroll(
  direction: 'horizontal' | 'vertical',
  containerRef: Ref<HTMLElement | null>,
  viewRef: Ref<HTMLElement | null>,
  translate: Ref<number>,
) {
  let viewSize = 0;
  let containerSize = 0;
  let canScrollSize = 0;

  if (direction === 'horizontal') {
    viewSize = viewRef.value?.offsetWidth || viewSize;
    containerSize = containerRef.value?.offsetWidth || containerSize;
  }

  else if (direction === 'vertical') {
    viewSize = viewRef.value?.offsetHeight || viewSize;
    containerSize = containerRef.value?.offsetHeight || containerSize;
  }

  canScrollSize = viewSize - containerSize;

  let canScroll = true;
  if (canScrollSize <= 0) {
    canScroll = false;
    translate.value = 0;
    canScrollSize = 0;
  }

  return {
    canScroll,
    viewSize,
    containerSize,
    canScrollSize,
    scrollSize: translate.value,
  };
}

/**
 * 计算滚动大小
 * @param scrollSize 已滚动大小
 * @param canScrollSize 可滚动大小
 * @returns 滚动大小
 */
export function calculateScrollSize(scrollSize: number, canScrollSize: number) {
  let size = scrollSize;
  if (size > 0) {
    size = 0;
  }

  size = Math.abs(size);

  size = Math.min(size, canScrollSize);
  size = Math.max(size, 0);

  return -size;
}
