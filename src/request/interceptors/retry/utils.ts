import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { InternalRetryConfig, RetryConfig } from './types';
import axios from 'axios';
import { isNumberLike, normalizeNumber, normalizeShouldDo } from '../utils';
import { DEFAULT_RETRY_CONFIG } from './constants';

export function normalizeRetryConfig(retryConfig: RetryConfig | number | unknown): false | InternalRetryConfig {
  // 所有不规范的配置值，都不进行重试
  if (!retryConfig) {
    return false;
  }

  // 传入数字时，默认只对 responseRejected 进行重试
  if (isNumberLike(retryConfig)) {
    const count = normalizeNumber(retryConfig, {
      defaultValue: DEFAULT_RETRY_CONFIG.count,
      min: 0,
      max: 10,
    });
    return {
      ...DEFAULT_RETRY_CONFIG,
      count,
    };
  }

  if (typeof retryConfig !== 'object') {
    return false;
  }

  // TS 类型断言
  const config = retryConfig as RetryConfig;

  const count = normalizeNumber(config.count, {
    defaultValue: DEFAULT_RETRY_CONFIG.count,
    min: 0,
    max: 10,
  });

  let interval: InternalRetryConfig['interval'];
  const defaultInterval = DEFAULT_RETRY_CONFIG.interval(0);

  if (typeof config.interval === 'function') {
    interval = (retriesCount) => {
      const delay = (config.interval as (retriesCount: number) => number)(retriesCount);
      return normalizeNumber(delay, {
        defaultValue: defaultInterval,
        min: 300,
        max: 5000,
      });
    };
  }
  else {
    interval = (_) => {
      return normalizeNumber(config.interval, {
        defaultValue: defaultInterval,
        min: 300,
        max: 5000,
      });
    };
  }

  return {
    count,
    interval,
    fulfilled: {
      shouldRetry: normalizeShouldDo(config.fulfilled?.shouldRetry, DEFAULT_RETRY_CONFIG.fulfilled.shouldRetry({} as AxiosResponse)),
    },
    rejected: {
      shouldRetry: normalizeShouldDo(config.rejected?.shouldRetry, DEFAULT_RETRY_CONFIG.rejected.shouldRetry({} as AxiosError)),
    },
  };
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
