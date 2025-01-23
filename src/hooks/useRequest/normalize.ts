import type {
  LifecycleCbName,
  NormalizeUseRequestOptions,
  UseRequestCacheOptions,
  UseRequestDebounceOptions,
  UseRequestOptions,
  UseRequestRetryOptions,
  UseRequestThrottleOptions,
} from './types';
import {
  defaultCacheOptions,
  defaultDebounceOptions,
  defaultLifecycleOptions,
  defaultRetryOptions,
  defaultThrottleOptions,
  defaultUseRequestOptions,
} from './default-options';

function normalizeCacheOptions(
  cache: undefined | boolean | UseRequestCacheOptions,
): Required<UseRequestCacheOptions> | false {
  if (!cache || (typeof cache !== 'boolean' && typeof cache !== 'object')) {
    return false;
  }

  if (typeof cache === 'boolean') {
    return {
      ...defaultCacheOptions,
    };
  }

  return {
    ...defaultCacheOptions,
    ...cache,
  };
}

function normalizeMaybeNumberConfig<T extends Record<string, any>>(
  config: undefined | number | T,
  defaultConfig: T,
  key: keyof T,
  max: number,
  min: number,
) {
  if (!config && typeof config !== 'number') {
    return {
      ...defaultConfig,
      [key]: min,
    };
  }

  let num = Number(config);

  // 配置为数字，将配置合并至默认配置，并限制数字范围
  if (!Number.isNaN(num)) {
    return {
      ...defaultConfig,
      [key]: Math.min(Math.max(num, min), max),
    };
  }

  // 无法转换为数字，也不是对象，则使用默认配置
  if (typeof config !== 'object') {
    return {
      ...defaultConfig,
      [key]: min,
    };
  }

  // 配置为对象，将对象中的配置项转换为数字
  num = Number(config[key]);

  // 可以转换为数字，对数字进行限制
  if (!Number.isNaN(num)) {
    num = Math.min(Math.max(num, min), max);
  }
  else {
    // 无法转换为数字，则使用默认配置
    num = defaultConfig[key];
  }

  (config[key] as number) = Math.min(Math.max(num, min), max);
}

function normalizeRetryOptions(
  retry: undefined | number | UseRequestRetryOptions,
): Required<UseRequestRetryOptions> {
  const res = normalizeMaybeNumberConfig(retry, defaultRetryOptions, 'count', 10, 0);

  if (res) {
    return res as Required<UseRequestRetryOptions>;
  }

  const config = retry as UseRequestRetryOptions;

  return {
    ...defaultRetryOptions,
    ...config,
  };
}

function normalizeThrottleOptions(
  throttle: undefined | number | UseRequestThrottleOptions,
): Required<UseRequestThrottleOptions> {
  const res = normalizeMaybeNumberConfig(throttle, defaultThrottleOptions, 'wait', 10000, 0);

  if (res) {
    return res as Required<UseRequestThrottleOptions>;
  }

  const config = throttle as UseRequestThrottleOptions;

  return {
    ...defaultThrottleOptions,
    ...config,
  };
}

function normalizeDebounceOptions(
  debounce: undefined | number | UseRequestDebounceOptions,
): Required<UseRequestDebounceOptions> {
  const res = normalizeMaybeNumberConfig(debounce, defaultDebounceOptions, 'wait', 3000, 0);

  if (res) {
    return res as Required<UseRequestDebounceOptions>;
  }

  const config = debounce as UseRequestDebounceOptions;

  return {
    ...defaultDebounceOptions,
    ...config,
  };
}

function normalizeFunction<T extends (...args: any) => any>(fn: T | undefined, defaultFn: T): T {
  if (typeof fn === 'function') {
    return fn;
  }
  return defaultFn;
}

function normalizeLifecycle<Service extends (...args: any) => Promise<any>>(
  options: Pick<UseRequestOptions<Service>, LifecycleCbName>,
): Pick<NormalizeUseRequestOptions<Service>, LifecycleCbName> {
  const { onBefore, onProgress, onSuccess, onError, onFinally } = options;
  return {
    onBefore: normalizeFunction(onBefore, defaultLifecycleOptions.onBefore),
    onProgress: normalizeFunction(onProgress, defaultLifecycleOptions.onProgress),
    onSuccess: normalizeFunction(onSuccess, defaultLifecycleOptions.onSuccess),
    onError: normalizeFunction(onError, defaultLifecycleOptions.onError),
    onFinally: normalizeFunction(onFinally, defaultLifecycleOptions.onFinally),
  };
}

export function normalizeRequestOptions<Service extends (...args: any) => Promise<any>>(
  options: Partial<UseRequestOptions<Service>>,
): NormalizeUseRequestOptions<Service> {
  const cache = normalizeCacheOptions(options.cache);
  const retry = normalizeRetryOptions(options.retry);
  const throttle = normalizeThrottleOptions(options.throttle);
  const debounce = normalizeDebounceOptions(options.debounce);
  const lifecycle = normalizeLifecycle(options);

  const normalizedUseRequestOptions: NormalizeUseRequestOptions<Service> = {
    ...defaultUseRequestOptions,
    ...options,
    ...lifecycle,
    method: typeof options.method === 'string' ? options.method : 'GET',
    initParams: (Array.isArray(options.initParams) ? options.initParams : []) as Parameters<Service>,
    cache,
    retry,
    throttle,
    debounce,
  };

  return normalizedUseRequestOptions;
}
