import type { MaybeRefOrGetter } from 'vue';
import { readonly, shallowRef, toRef, watch } from 'vue';

export function usePrevious<T>(value: MaybeRefOrGetter<T>, initialValue?: T) {
  const previous = shallowRef<T | undefined>(initialValue);

  watch(toRef(value), (_, oldValue) => {
    previous.value = oldValue;
  }, { immediate: true, flush: 'sync' });

  return readonly(previous);
}
