import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { RetryConfig } from './types';
import axios from 'axios';

export const defaultRetryConfig: Required<RetryConfig> = {
  count: 3,
  interval: 500,
  useExponentialBackoff: false,
  shouldRetry: (_error) => true,
};

export function normalizeRetryConfig(retryConfig: RetryConfig | number | unknown): Required<RetryConfig> {
  // 所有不规范的配置值，都不进行重试
  if (!retryConfig) {
    return { ...defaultRetryConfig, count: 0 };
  }
  let count = Number(retryConfig);
  if (Number.isNaN(count) && typeof retryConfig !== 'object') {
    return { ...defaultRetryConfig, count: 0 };
  }

  // 配置为数字，使用数字配置
  if (!Number.isNaN(count)) {
    return {
      ...defaultRetryConfig,
      // 限制重试次数在 0 到 10 之间
      count: Math.min(Math.max(count, 0), 10),
    };
  }

  const config = retryConfig as RetryConfig;

  count = Number(config.count);
  count = Number.isNaN(count) ? defaultRetryConfig.count : Math.min(Math.max(count, 0), 10);

  let interval = Number(config.interval);

  interval = Number.isNaN(interval) ? defaultRetryConfig.interval : Math.min(Math.max(interval, 300), 5000);

  return {
    count,
    interval,
    useExponentialBackoff: !!config.useExponentialBackoff,
    shouldRetry: typeof config.shouldRetry === 'function'
      ? (error: any) => !!(config.shouldRetry!(error))
      : (_error: any) => true,
  };
}

function wait(delay: number, error: AxiosError) {
  return new Promise((resolve, reject) => {
    // 如果在开始等待前已经被取消，直接reject
    if (error.config?.signal?.aborted) {
      reject(new axios.AxiosError(
        'Request aborted',
        axios.AxiosError.ERR_CANCELED,
        error.config,
        error.request,
        error.response,
      ));
      return;
    }

    const timer = setTimeout(resolve, delay);

    // 重试间隔期间，也可以取消请求
    // 监听取消信号
    error.config?.signal?.addEventListener?.('abort', () => {
      clearTimeout(timer);
      reject(new axios.AxiosError(
        'Request aborted',
        axios.AxiosError.ERR_CANCELED,
        error.config,
        error.request,
        error.response,
      ));
    }, { once: true });
  });
}

export async function retryRequest(error: AxiosError, hasRetryCount: number = 0): Promise<AxiosResponse<any>> {
  const config = error.config as InternalAxiosRequestConfig;
  const retryConfig = config.retryConfig as Required<RetryConfig>;
  if (hasRetryCount >= retryConfig.count) {
    return Promise.reject(error);
  }
  // 计算延迟时间
  const delay = retryConfig.useExponentialBackoff
    ? retryConfig.interval * 2 ** (retryConfig.count - 1)
    : retryConfig.interval;
  await wait(delay, error);
  return axios(config).catch((_error) => retryRequest(error, hasRetryCount + 1));
}
