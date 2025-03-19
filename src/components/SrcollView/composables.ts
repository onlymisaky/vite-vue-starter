import type { MaybeRef, Ref } from 'vue';
import { computed, nextTick, onMounted, onUnmounted, ref, unref } from 'vue';

export function useResizeObserver(elRef: Ref<HTMLElement | null>, callback: ResizeObserverCallback) {
  const observer = new ResizeObserver(callback);

  onMounted(() => {
    nextTick(() => {
      if (elRef.value && elRef.value instanceof HTMLElement) {
        observer.observe(elRef.value);
      }
    });
  });

  onUnmounted(() => {
    observer.disconnect();
  });
}

export function useDragScrollBar(
  barRef: Ref<HTMLElement | null>,
  thumbRef: Ref<HTMLElement | null>,
  options: MaybeRef<{
    thumbSize: number
    direction: 'vertical' | 'horizontal'
    onScroll?: (delta: number) => void
  }>,
) {
  const isDragging = ref(false);
  const pos = ref({ x: 0, y: 0 });
  const bodyClassList: string[] = [];

  const optionsComputedRef = computed(() => unref(options));

  function handleMousedown(event: MouseEvent) {
    isDragging.value = true;
    pos.value = { x: event.clientX, y: event.clientY };
    document.addEventListener('mousemove', handleMousemove);
    document.addEventListener('mouseup', handleMouseup);
    if (document.body.classList.contains('select-none')) {
      bodyClassList.push('select-none');
    }
    if (document.body.classList.contains('cursor-grabbing')) {
      bodyClassList.push('cursor-grabbing');
    }
    document.body.classList.add('select-none', 'cursor-grabbing');
  }

  function handleMousemove(event: MouseEvent) {
    if (!isDragging.value) {
      return;
    }

    const { direction, thumbSize, onScroll } = unref(optionsComputedRef);

    let delta = 0;

    if (direction === 'vertical') {
      const deltaY = event.clientY - pos.value.y;
      pos.value.y = event.clientY;
      const top = Number(getComputedStyle(thumbRef.value!).top.replace('px', ''));
      const barHeight = barRef.value!.offsetHeight;
      if ((top <= 0 && deltaY < 0) || (top >= barHeight - thumbSize && deltaY > 0)) {
        return;
      }
      thumbRef.value!.style.top = `${Math.min(Math.max(top + deltaY, 0), barHeight - thumbSize)}px`;
      delta = deltaY;
    }

    if (direction === 'horizontal') {
      const deltaX = event.clientX - pos.value.x;
      pos.value.x = event.clientX;
      const left = Number(getComputedStyle(thumbRef.value!).left.replace('px', ''));
      const barWidth = barRef.value!.offsetWidth;
      if ((left <= 0 && deltaX < 0) || (left >= barWidth - thumbSize && deltaX > 0)) {
        return;
      }
      thumbRef.value!.style.left = `${Math.min(Math.max(left + deltaX, 0), barWidth - thumbSize)}px`;
      delta = deltaX;
    }

    if (typeof onScroll === 'function' && delta !== 0) {
      onScroll(delta);
    }
  }

  function handleMouseup() {
    isDragging.value = false;
    pos.value = { x: 0, y: 0 };
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
    if (!bodyClassList.includes('select-none')) {
      document.body.classList.remove('select-none');
    }
    if (!bodyClassList.includes('cursor-grabbing')) {
      document.body.classList.remove('cursor-grabbing');
    }
  }

  function locateToClickPosition(event: MouseEvent) {
    if (event.target === thumbRef.value) {
      return;
    }
    const { direction, thumbSize } = unref(optionsComputedRef);
    if (direction === 'vertical') {
      thumbRef.value!.style.top = `${event.offsetY - thumbSize / 2}px`;
    }
    if (direction === 'horizontal') {
      thumbRef.value!.style.left = `${event.offsetX - thumbSize / 2}px`;
    }
  }

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
  });

  return {
    isDragging,
    startDrag: handleMousedown,
    locateToClickPosition,
  };
}

/**
 * TODO: 鼠标滚动时，更新滚动条位置
 */
export function updateScrollBarPosition() {

}

/**
 * TODO: 拖动滚动条时，更新滚动视图位置
 */
export function updateScrollViewPosition() {

}
