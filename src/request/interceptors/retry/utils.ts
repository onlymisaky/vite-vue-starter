import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { InternalRetryConfig, RetryConfig } from './types';
import axios from 'axios';
import { isNumberLike, normalizeNumber, normalizeShouldDo } from '../utils';
import { DEFAULT_RETRY_CONFIG, KEY_RETRY_CONFIG } from './constants';

function normalizeRetryCount(retryCount: any, defaultValue: number) {
  const count = normalizeNumber(retryCount, {
    defaultValue,
    min: 0,
    max: 10,
  });
  return count;
}

function normalizeRetryInterval(retryInterval: any, defaultFn: (_: number) => number): InternalRetryConfig['interval'] {
  if (typeof retryInterval === 'function') {
    return function interval(retriesCount: number) {
      const delay = retryInterval(retriesCount);
      if (isNumberLike(delay)) {
        const num = Number(delay);
        return Math.min(Math.max(num, 300), 5000);
      }
      return defaultFn(retriesCount);
    };
  }

  if (isNumberLike(retryInterval)) {
    const num = Number(retryInterval);
    return function interval(_retriesCount: number) {
      return Math.min(Math.max(num, 300), 5000);
    };
  }

  return defaultFn;
}

export function normalizeRetryConfig(
  retryConfig: RetryConfig,
  defaultConfig: InternalRetryConfig = DEFAULT_RETRY_CONFIG,
): InternalRetryConfig {
  // 传入非对象时，fulfilled 和 rejected 都不重试，其余字段使用默认值
  if (!retryConfig || typeof retryConfig !== 'object') {
    return {
      ...defaultConfig,
      fulfilled: {
        shouldRetry: (_) => false,
      },
      rejected: {
        shouldRetry: (_) => false,
      },
    };
  }

  // TS 类型断言
  const config = retryConfig as RetryConfig;

  const count = normalizeRetryCount(config.count, defaultConfig.count);

  const interval = normalizeRetryInterval(config.interval, defaultConfig.interval);

  return {
    count,
    interval,
    fulfilled: {
      shouldRetry: normalizeShouldDo(
        config.fulfilled?.shouldRetry,
        defaultConfig.fulfilled.shouldRetry,
      ),
    },
    rejected: {
      shouldRetry: normalizeShouldDo(
        config.rejected?.shouldRetry,
        defaultConfig.rejected.shouldRetry,
      ),
    },
  };
}

export function getRetryConfig(requestConfig: InternalAxiosRequestConfig, globalRetryConfig: InternalRetryConfig): InternalRetryConfig | false {
  // 请求中没有配置重试，使用全局配置
  if (!Reflect.has(requestConfig, KEY_RETRY_CONFIG)) {
    return {
      ...globalRetryConfig,
    };
  }

  const requestRetryConfig = requestConfig[KEY_RETRY_CONFIG];

  // 请求中重试配置的值为数字时，视为对重试次数配置，其余字段使用全局配置
  if (isNumberLike(requestRetryConfig)) {
    return {
      ...globalRetryConfig,
      count: normalizeRetryCount(requestRetryConfig, globalRetryConfig.count),
    };
  }

  // 请求中重试配置的值为 false 时，视为当前请求出错不重试
  if (typeof requestRetryConfig === 'boolean' && !requestRetryConfig) {
    return false;
  }

  // 请求中重试配置的值为非对象时，视为当前请求出错不重试
  if (!requestRetryConfig || typeof requestRetryConfig !== 'object') {
    return false;
  }

  const retryConfig = {
    ...globalRetryConfig,
  };

  if (Reflect.has(requestRetryConfig, 'count')) {
    retryConfig.count = normalizeRetryCount(
      requestRetryConfig.count,
      globalRetryConfig.count,
    );
  }

  if (Reflect.has(requestRetryConfig, 'interval')) {
    retryConfig.interval = normalizeRetryInterval(
      requestRetryConfig.interval,
      globalRetryConfig.interval,
    );
  }

  if (
    requestRetryConfig.fulfilled
    && typeof requestRetryConfig.fulfilled === 'object'
    && Reflect.has(requestRetryConfig.fulfilled, 'shouldRetry')
  ) {
    retryConfig.fulfilled = {
      shouldRetry: normalizeShouldDo(
        requestRetryConfig.fulfilled?.shouldRetry,
        globalRetryConfig.fulfilled.shouldRetry,
      ),
    };
  }

  if (
    requestRetryConfig.rejected
    && typeof requestRetryConfig.rejected === 'object'
    && Reflect.has(requestRetryConfig.rejected, 'shouldRetry')
  ) {
    retryConfig.rejected = {
      shouldRetry: normalizeShouldDo(
        requestRetryConfig.rejected?.shouldRetry,
        globalRetryConfig.rejected.shouldRetry,
      ),
    };
  }

  return retryConfig;
}

function createAbortedError(res: AxiosError | AxiosResponse) {
  return new axios.AxiosError(
    'Request aborted',
    axios.AxiosError.ERR_CANCELED,
    res.config,
    res.request,
    axios.isAxiosError(res) ? res.response : res,
  );
}

function wait(delay: number, res: AxiosError | AxiosResponse) {
  return new Promise<void>((resolve, reject) => {
    // 如果在开始等待前已经被取消，直接reject
    if (res.config?.signal?.aborted) {
      reject(createAbortedError(res));
      return;
    }

    const timer = setTimeout(() => {
      res.config?.signal?.removeEventListener?.('abort', onAbort);
      resolve();
    }, delay);

    function onAbort() {
      clearTimeout(timer);
      reject(createAbortedError(res));
    }

    // 重试间隔期间，也可以取消请求
    // 监听取消信号
    res.config?.signal?.addEventListener?.('abort', onAbort, { once: true });
  });
}

export async function retryRequest(
  res: AxiosError | AxiosResponse,
  retriesCount: number = 0,
  retryConfig: InternalRetryConfig,
) {
  const requestConfig = res.config as InternalAxiosRequestConfig;
  // 计算延迟时间
  const delay = retryConfig.interval(retriesCount);

  if (retriesCount >= retryConfig.count) {
    if (axios.isAxiosError(res)) {
      return Promise.reject(res);
    }
    return res;
  }

  // TODO
  await wait(delay, res);
  // 直接使用未配置的 axios 发送重试请求，避免无限循环
  return axios(requestConfig)
    .then((response: AxiosResponse): MaybePromise<AxiosResponse> => {
      if (retryConfig.fulfilled.shouldRetry(response)) {
        return retryRequest(response, retriesCount + 1, retryConfig);
      }
      return response;
    })
    .catch((error: AxiosError): Promise<AxiosResponse> => {
      if (retryConfig.rejected.shouldRetry(error)) {
        return retryRequest(error, retriesCount + 1, retryConfig);
      }
      return Promise.reject(error);
    });
}
