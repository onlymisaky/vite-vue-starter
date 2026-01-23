import { computed } from 'vue';

export function usePickModelValue<
  M,
  R = M[keyof M],
  K extends keyof M = keyof M,
  P extends { modelValue: M } = any,
>(
  props: P,
  key: K,
  emits: (e: 'update:modelValue', value: M) => void,
  transform?: (value: M[K]) => M[K],
) {
  return computed({
    get: () => {
      if (typeof transform === 'function') {
        return transform(props.modelValue[key]) as R;
      }
      return props.modelValue[key] as R;
    },
    set: (value: R) => {
      emits('update:modelValue', {
        ...props.modelValue,
        [key]: value,
      } as M);
    },
  });
}
