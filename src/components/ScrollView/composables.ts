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
    let position = 0;
    let barSize = 0;
    let newPosition = 0;

    if (direction === 'vertical') {
      delta = event.clientY - pos.value.y;
      pos.value.y = event.clientY;
      position = Number(getComputedStyle(thumbRef.value!).top.replace('px', ''));
      barSize = barRef.value!.offsetHeight;
      if ((position <= 0 && delta < 0) || (position >= barSize - thumbSize && delta > 0)) {
        return;
      }
    }

    if (direction === 'horizontal') {
      delta = event.clientX - pos.value.x;
      pos.value.x = event.clientX;
      position = Number(getComputedStyle(thumbRef.value!).left.replace('px', ''));
      barSize = barRef.value!.offsetWidth;
    }

    // 限制滑块移动范围
    if ((position <= 0 && delta < 0) || (position >= barSize - thumbSize && delta > 0)) {
      return;
    }

    newPosition = Math.min(Math.max(position + delta, 0), barSize - thumbSize);

    if (direction === 'vertical') {
      thumbRef.value!.style.top = `${newPosition}px`;
    }
    else if (direction === 'horizontal') {
      thumbRef.value!.style.left = `${newPosition}px`;
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
