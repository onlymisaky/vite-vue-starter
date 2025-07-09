import type { ComponentInternalInstance } from 'vue';
import { computed, getCurrentInstance } from 'vue';

export function useVModel<
  P extends object,
  K extends keyof P,
  EventName extends string = `update:${K & string}`,
>(
  props: Readonly<P>,
  key: K,
  emit?: (event: EventName, ...args: any[]) => void,
) {
  const instance = getCurrentInstance() as ComponentInternalInstance;

  const $emit = emit || instance?.emit;
  const event = `update:${key as string}` as EventName;

  return computed<P[K]>({
    get() {
      return props[key];
    },
    set(v: P[K]) {
      $emit(event, v);
    },
  });
}
