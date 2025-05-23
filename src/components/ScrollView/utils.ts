export function calculateThumbSize(visibleContainerSize: number, totalContentSize: number) {
  return Math.max((visibleContainerSize / totalContentSize) * visibleContainerSize, 20);
}

/**
 * 根据已经滚动的距离和滑块大小，计算活块应该在的位置
 * @param visibleContainerSize
 * @param totalContentSize
 * @param currentScrollDistance
 * @param thumbSize
 */
export function calculateThumbPositionByScrollDistance(
  visibleContainerSize: number,
  totalContentSize: number,
  currentScrollDistance: number,
  thumbSize: number,
) {
  const maxScrollableDistance = totalContentSize - visibleContainerSize;

  if (maxScrollableDistance <= 0) {
    return 0;
  }

  if (currentScrollDistance <= 0) {
    return 0;
  }

  if (currentScrollDistance >= maxScrollableDistance) {
    return visibleContainerSize - thumbSize;
  }

  const availableThumbSpace = visibleContainerSize - thumbSize;

  // 根据滚动距离与最大可滚动距离的比例，计算滑块在可用空间中的位置
  return (availableThumbSpace / maxScrollableDistance) * currentScrollDistance;

  // return (currentScrollDistance / maxScrollableDistance) * availableThumbSpace;
}

/**
 * 获取可滚动区域的信息
 * @param direction 滚动方向 ('horizontal' 或 'vertical')
 * @param visibleContainerEl 容器元素
 * @param totalContentEl 内容元素
 * @returns 包含容器大小、视图大小、可滚动大小、滚动滑块大小和滚动滑块位置的对象
 */
export function getScrollableAreaInfo(
  direction: 'horizontal' | 'vertical',
  visibleContainerEl: HTMLElement | null,
  totalContentEl: HTMLElement | null,
) {
  let totalContentSize = 0;
  let visibleContainerSize = 0;
  let maxScrollableDistance = 0;

  if (direction === 'horizontal') {
    totalContentSize = totalContentEl?.offsetWidth || totalContentSize;
    visibleContainerSize = visibleContainerEl?.offsetWidth || visibleContainerSize;
  }
  else if (direction === 'vertical') {
    totalContentSize = totalContentEl?.offsetHeight || totalContentSize;
    visibleContainerSize = visibleContainerEl?.offsetHeight || visibleContainerSize;
  }

  maxScrollableDistance = totalContentSize - visibleContainerSize;

  if (maxScrollableDistance <= 0) {
    maxScrollableDistance = 0;
  }

  return {
    totalContentSize,
    visibleContainerSize,
    maxScrollableDistance,
  };
}

/**
 * 计算滚动距离
 * @param currentScrollDistance 当前已滚动距离
 * @param maxScrollableDistance 最大可滚动距离
 * @param deltaScrollDistance 需要滚动的增量距离，负数表示往上/左滚动，正数表示往下/右滚动
 * @returns 最终实际滚动距离
 */
export function calculateNextScrollDistanceByDeltaScrollDistance(
  currentScrollDistance: number,
  maxScrollableDistance: number,
  deltaScrollDistance: number,
) {
  if (maxScrollableDistance <= 0) {
    return 0;
  }

  let distance = currentScrollDistance + deltaScrollDistance;
  distance = Math.max(distance, 0);
  distance = Math.min(distance, maxScrollableDistance);

  return distance;
}
