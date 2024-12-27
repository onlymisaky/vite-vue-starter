import { reactive, ref } from 'vue';

function deepClone<T>(value: T) {
  if (typeof value !== 'object' || value === null) {
    return value;
  }
  return JSON.parse(JSON.stringify(value));
}

export function useResetableRef<T>(value: T, cloneFn: (value: T) => T = deepClone) {
  const state = ref<T>(cloneFn(value));

  const reset = () => {
    state.value = cloneFn(value);
  };

  return [state, reset] as const;
}

export function useResetableReactive<T extends Record<string, any>>(value: T, cloneFn: (value: T) => T = deepClone) {
  const defaultValue = cloneFn(value);
  const keys = Object.keys(defaultValue);
  const state = reactive(defaultValue);

  const reset = () => {
    const restValue = cloneFn(defaultValue);
    Object.keys(state).forEach((key) => {
      if (keys.includes(key)) {
        state[key] = restValue[key];
      }
      else {
        delete state[key];
      }
    });
  };

  return [state, reset] as const;
}

export function useResetableState<T>(value: T, type: 'ref' | 'reactive' = 'ref', cloneFn: (value: T) => T = deepClone) {
  if (type === 'ref') {
    return useResetableRef(value, cloneFn);
  }
  return useResetableReactive(value as Record<string, any>, cloneFn as (value: Record<string, any>) => Record<string, any>);
}
