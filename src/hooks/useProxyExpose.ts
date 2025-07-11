import type { Ref, TemplateRef } from 'vue';
import { isRef } from 'vue';

export function useProxyExpose<T extends object>(
  comRef: TemplateRef<T> | Ref<T>,
  customExpose: Record<string, any> = {},
) {
  if (Object.prototype.toString.call(customExpose) !== '[object Object]') {
    throw new TypeError('customExpose must be an object');
  }

  if (!isRef(comRef)) {
    throw new TypeError('comRef must be a ref');
  }

  const exposed = { ...customExpose };

  const exposedKeys = Object.keys(exposed);

  return new Proxy(exposed, {
    get(_target, key) {
      if (exposedKeys.includes(key as string)) {
        return exposed[key as keyof typeof exposed];
      }
      return comRef.value?.[key as keyof T];
    },
    has(_target, key) {
      if (exposedKeys.includes(key as string)) {
        return true;
      }
      return key in comRef.value!;
    },
  }) as T & typeof customExpose;
}
