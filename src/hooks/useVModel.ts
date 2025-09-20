import type { ComponentInternalInstance } from 'vue';
import { computed, getCurrentInstance } from 'vue';

function getProxyVal<P extends object, K extends keyof P>(
  props: Readonly<P>,
  key: K,
  setter: (v: P[K]) => void,
): P[K] {
  const val = props[key];
  const valType = Object.prototype.toString.call(val).slice(8, -1);
  if (val && typeof val === 'object') {
    if (['Object', 'Array'].includes(valType)) {
      return new Proxy(val, {
        get(target, k, receiver) {
          return Reflect.get(target, k, receiver);
        },
        set(target, k, v) {
          setter({ ...target, [k]: v } as P[K]);
          return true;
        },
      });
    }
  }
  return val;
}

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

  const setter = (v: P[K]) => {
    $emit(event, v);
  };

  return computed<P[K]>({
    get() {
      return getProxyVal(props, key, setter);
    },
    set(v: P[K]) {
      setter(v);
    },
  });
}
