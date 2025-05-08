import type { MaybeRef } from 'vue';
import { ref, unref } from 'vue';

const defaultBefore = (..._args: any[]) => true;
function defaultAfter(..._args: any[]) { }

export function useDragSort<T>(items: MaybeRef<T[]>, options: {
  beforeDragStart?: (event: DragEvent, dragIndex: number) => boolean
  afterDragStart?: (event: DragEvent, dragIndex: number) => void
  beforeDragEnter?: (event: DragEvent, targetIndex: number) => boolean
  afterDragEnter?: (event: DragEvent, targetIndex: number) => void
  beforeDragOver?: (event: DragEvent, targetIndex: number) => boolean
  afterDragOver?: (event: DragEvent, targetIndex: number) => void
  beforeDragEnd?: (event: DragEvent, dragIndex: number) => boolean
  afterDragEnd?: (event: DragEvent, dragIndex: number) => void
} = {}) {
  const {
    beforeDragStart = defaultBefore,
    afterDragStart = defaultAfter,
    beforeDragEnter = defaultBefore,
    afterDragEnter = defaultAfter,
    beforeDragOver = defaultBefore,
    afterDragOver = defaultAfter,
    beforeDragEnd = defaultBefore,
    afterDragEnd = defaultAfter,
  } = options;

  const dragIndex = ref<number>(-1);
  const isDragging = ref(false);

  function handleDragStart(event: DragEvent, index: number) {
    event.stopPropagation();
    if (typeof beforeDragStart === 'function' && !beforeDragStart(event, index)) {
      return;
    }

    dragIndex.value = index;
    isDragging.value = true;

    typeof afterDragStart === 'function' && afterDragStart(event, index);
  }

  function handleDragEnter(event: DragEvent, targetIndex: number) {
    event.stopPropagation();
    event.preventDefault();

    if (targetIndex === dragIndex.value) {
      return;
    }

    if (typeof beforeDragEnter === 'function' && !beforeDragEnter(event, targetIndex)) {
      return;
    }

    if (!isDragging.value) {
      return;
    }

    const itemsArray = unref(items);
    if (targetIndex < 0 || targetIndex >= itemsArray.length) {
      return;
    }

    // 交换
    // const temp = itemsArray[targetIndex];
    // itemsArray[targetIndex] = itemsArray[dragIndex.value];
    // itemsArray[dragIndex.value] = temp;

    const draggedItem = itemsArray.splice(dragIndex.value, 1)[0];
    itemsArray.splice(targetIndex, 0, draggedItem);
    dragIndex.value = targetIndex;

    typeof afterDragEnter === 'function' && afterDragEnter(event, targetIndex);
  }

  function handleDragOver(event: DragEvent, targetIndex: number) {
    event.stopPropagation();
    event.preventDefault();
    if (targetIndex === dragIndex.value) {
      return;
    }

    if (typeof beforeDragOver === 'function' && !beforeDragOver(event, targetIndex)) {
      return;
    }

    typeof afterDragOver === 'function' && afterDragOver(event, targetIndex);
  }

  function handleDragEnd(event: DragEvent, index: number) {
    event.stopPropagation();
    event.preventDefault();

    if (typeof beforeDragEnd === 'function' && !beforeDragEnd(event, index)) {
      return;
    }

    isDragging.value = false;

    typeof afterDragEnd === 'function' && afterDragEnd(event, index);
  }

  return {
    dragIndex,
    isDragging,
    handleDragStart,
    handleDragEnter,
    handleDragOver,
    handleDragEnd,
  };
}
