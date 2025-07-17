import { isRef } from 'vue';

// export declare function useProxyExpose<T extends object>(
//   comRef: TemplateRef<T> | Ref<T>,
//   customExpose?: Record<string, any> = {},
// ): T & typeof customExpose;

/**
 * 如果构建编译报错，请使用 js 版本，只能提示 customExpose 类型信息
 * 错误原因 vue-tsc -> defineExpose
 * @template {object} T
 * @template {object} U
 * @param { import('vue').Ref<T> | import('vue').TemplateRef<T> } comRef
 * @param { U } customExpose
 * @returns { U }
 * returns { T & U }
 */
export function useProxyExpose(
  comRef,
  customExpose = {},
) {
  if (Object.prototype.toString.call(customExpose) !== '[object Object]') {
    throw new TypeError('customExpose must be an object');
  }

  if (!isRef(comRef)) {
    throw new TypeError('comRef must be a ref');
  }

  const exposed = { ...customExpose };

  const exposedKeys = Object.keys(exposed);

  const proxyExpose = new Proxy(exposed, {
    get(_target, key) {
      if (exposedKeys.includes(key)) {
        return exposed[key];
      }
      return comRef.value?.[key];
    },
    has(_target, key) {
      if (exposedKeys.includes(key)) {
        return true;
      }
      return key in comRef.value;
    },
  });

  return proxyExpose;
}
