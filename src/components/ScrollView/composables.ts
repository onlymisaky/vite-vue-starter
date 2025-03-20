import type { MaybeRef, Ref } from 'vue';
import { computed, onUnmounted, ref, unref, watch } from 'vue';

export function useResizeObserver(elRef: Ref<HTMLElement | null>, callback: ResizeObserverCallback) {
  let observer: ResizeObserver | null = null;

  watch(elRef, (el, oldEl) => {
    // 节点生成时
    if (el instanceof HTMLElement && !(oldEl instanceof HTMLElement)) {
      observer = new ResizeObserver(callback);
      observer.observe(el);
    }
    // 节点销毁时
    else if (!(el instanceof HTMLElement) && oldEl instanceof HTMLElement) {
      observer?.disconnect();
    }
  });

  onUnmounted(() => {
    observer?.disconnect();
  });

  return observer;
}

export function useDragScrollBar(
  currentThumbPosition: Ref<number>,
  options: MaybeRef<{
    availableThumbSpace: number
    direction: 'vertical' | 'horizontal'
    onScroll?: (deltaMouseMovement: number) => void
  }>,
) {
  const isDragging = ref(false);
  const mousePosition = ref({ x: 0, y: 0 });
  const bodyClassList: string[] = [];

  const optionsComputedRef = computed(() => unref(options));

  function handleMousedown(event: MouseEvent) {
    isDragging.value = true;

    mousePosition.value = { x: event.clientX, y: event.clientY };
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

    const {
      direction,
      availableThumbSpace,
      onScroll,
    } = unref(optionsComputedRef);

    let mouseMovementDistance = 0;

    if (direction === 'vertical') {
      mouseMovementDistance = event.clientY - mousePosition.value.y;
      mousePosition.value.y = event.clientY;
    }

    if (direction === 'horizontal') {
      mouseMovementDistance = event.clientX - mousePosition.value.x;
      mousePosition.value.x = event.clientX;
    }

    // 限制滑块移动范围
    if (currentThumbPosition.value <= 0 && mouseMovementDistance < 0) {
      currentThumbPosition.value = 0;
      return;
    }
    if (currentThumbPosition.value >= availableThumbSpace && mouseMovementDistance > 0) {
      currentThumbPosition.value = availableThumbSpace;
      return;
    }

    currentThumbPosition.value += mouseMovementDistance;

    if (typeof onScroll === 'function' && mouseMovementDistance !== 0) {
      onScroll(mouseMovementDistance);
    }
  }

  function handleMouseup() {
    isDragging.value = false;
    mousePosition.value = { x: 0, y: 0 };
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
    if (!bodyClassList.includes('select-none')) {
      document.body.classList.remove('select-none');
    }
    if (!bodyClassList.includes('cursor-grabbing')) {
      document.body.classList.remove('cursor-grabbing');
    }
  }

  onUnmounted(() => {
    document.removeEventListener('mousemove', handleMousemove);
    document.removeEventListener('mouseup', handleMouseup);
  });

  return {
    isDragging,
    startDrag: handleMousedown,
  };
}
