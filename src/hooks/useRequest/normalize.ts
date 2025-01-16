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

export function normalizeApi<Api extends (...args: any) => Promise<any>>(
  api: string | Api,
  method: string,
): Api {
  if (typeof api === 'string') {
    return async function fetcher(..._args: any) {
      const res = await fetch(api, { method });
      const data = await res.json();
      return data;
    } as Api;
  }
  return api;
}

function normalizeCacheOptions(
  cache: undefined | boolean | UseRequestCacheOptions,
): Required<UseRequestCacheOptions> | boolean {
  if (!cache && (typeof cache !== 'boolean' || typeof cache !== 'object')) {
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

function normalizeRetryOptions(
  retry: undefined | boolean | number | UseRequestRetryOptions,
): Required<UseRequestRetryOptions> | boolean {
  if (!retry && (typeof retry !== 'boolean' || typeof retry !== 'number' || typeof retry !== 'object')) {
    return false;
  }
  if (typeof retry === 'boolean') {
    return {
      ...defaultRetryOptions,
    };
  }
  if (typeof retry === 'number') {
    return {
      ...defaultRetryOptions,
    };
  }
  return {
    ...defaultRetryOptions,
    ...retry,
  };
}

function normalizeThrottleOptions(
  throttle: undefined | boolean | number | UseRequestThrottleOptions,
): Required<UseRequestThrottleOptions> | boolean {
  if (!throttle && (typeof throttle !== 'boolean' || typeof throttle !== 'number' || typeof throttle !== 'object')) {
    return false;
  }
  if (typeof throttle === 'boolean') {
    return {
      ...defaultThrottleOptions,
    };
  }
  if (typeof throttle === 'number') {
    return {
      ...defaultThrottleOptions,
    };
  }
  return {
    ...defaultThrottleOptions,
    ...throttle,
  };
}

function normalizeDebounceOptions(
  debounce: undefined | boolean | number | UseRequestDebounceOptions,
): Required<UseRequestDebounceOptions> | boolean {
  if (!debounce && (typeof debounce !== 'boolean' || typeof debounce !== 'number' || typeof debounce !== 'object')) {
    return false;
  }
  if (typeof debounce === 'boolean') {
    return {
      ...defaultDebounceOptions,
    };
  }
  if (typeof debounce === 'number') {
    return {
      ...defaultDebounceOptions,
    };
  }
  return {
    ...defaultDebounceOptions,
    ...debounce,
  };
}

function normalizeFunction<T extends (...args: any) => any>(fn: T | undefined, defaultFn: T): T {
  if (typeof fn === 'function') {
    return fn;
  }
  return defaultFn;
}

function normalizeLifecycle<Api extends (...args: any) => Promise<any>>(
  options: Pick<UseRequestOptions<Api>, LifecycleCbName>,
): Pick<NormalizeUseRequestOptions<Api>, LifecycleCbName> {
  const { onBefore, onProgress, onSuccess, onError, onFinally } = options;
  return {
    onBefore: normalizeFunction(onBefore, defaultLifecycleOptions.onBefore),
    onProgress: normalizeFunction(onProgress, defaultLifecycleOptions.onProgress),
    onSuccess: normalizeFunction(onSuccess, defaultLifecycleOptions.onSuccess),
    onError: normalizeFunction(onError, defaultLifecycleOptions.onError),
    onFinally: normalizeFunction(onFinally, defaultLifecycleOptions.onFinally),
  };
}

export function normalizeRequestOptions<Api extends (...args: any) => Promise<any>>(
  options: UseRequestOptions<Api>,
): NormalizeUseRequestOptions<Api> {
  const cache = normalizeCacheOptions(options.cache);
  const retry = normalizeRetryOptions(options.retry);
  const throttle = normalizeThrottleOptions(options.throttle);
  const debounce = normalizeDebounceOptions(options.debounce);
  const lifecycle = normalizeLifecycle(options);

  const normalizedUseRequestOptions: NormalizeUseRequestOptions<Api> = {
    ...defaultUseRequestOptions,
    ...options,
    ...lifecycle,
    method: typeof options.method === 'string' ? options.method : 'GET',
    initParams: (Array.isArray(options.initParams) ? options.initParams : []) as Parameters<Api>,
    cache,
    retry,
    throttle,
    debounce,
  };

  return normalizedUseRequestOptions;
}
