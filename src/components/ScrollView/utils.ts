export function calculateThumbSize(containerSize: number, contentSize: number) {
  return Math.max((containerSize / contentSize) * containerSize, 20);
}

// TODO
export function calculateThumbPosition(_containerSize: number, _contentSize: number, _scrolledSize: number) {
  return 0;
  // return (scrolledSize / (contentSize - containerSize)) * containerSize;
}

/**
 * 获取可滚动区域的信息
 * @param direction 滚动方向 ('horizontal' 或 'vertical')
 * @param containerEl 容器元素
 * @param contentEl 内容元素
 * @returns 包含容器大小、视图大小、可滚动大小、滚动滑块大小和滚动滑块位置的对象
 */
export function getScrollableAreaInfo(
  direction: 'horizontal' | 'vertical',
  containerEl: HTMLElement | null,
  contentEl: HTMLElement | null,
) {
  let contentSize = 0;
  let containerSize = 0;
  let scrollableSize = 0;
  let thumbSize = 0;
  let thumbPosition = 0;

  if (direction === 'horizontal') {
    contentSize = contentEl?.offsetWidth || contentSize;
    containerSize = containerEl?.offsetWidth || containerSize;
  }
  else if (direction === 'vertical') {
    contentSize = contentEl?.offsetHeight || contentSize;
    containerSize = containerEl?.offsetHeight || containerSize;
  }

  scrollableSize = contentSize - containerSize;
  thumbSize = calculateThumbSize(containerSize, contentSize);
  thumbPosition = calculateThumbPosition(containerSize, contentSize, scrollableSize);

  if (scrollableSize <= 0) {
    scrollableSize = 0;
    thumbSize = 0;
  }

  return {
    contentSize,
    containerSize,
    scrollableSize,
    thumbSize,
    thumbPosition,
  };
}

/**
 * 计算滚动大小
 * @param scrolledSize 已滚动大小
 * @param scrollableSize 可滚动大小
 * @param wantScrollSize 想要滚动的大小，负数表示往上/左滚动，正数表示往下/右滚动
 * @returns 最终实际滚动大小
 */
export function calculateScrollSize(
  scrolledSize: number,
  scrollableSize: number,
  wantScrollSize: number,
) {
  if (scrollableSize <= 0) {
    return 0;
  }

  let size = scrolledSize + wantScrollSize;
  size = Math.max(size, 0);
  size = Math.min(size, scrollableSize);

  return size;
}
