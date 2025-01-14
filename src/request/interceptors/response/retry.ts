import type { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    retryConfig?: RetryConfig | boolean | number
  }
}

// 暴露给外部使用的配置
export interface RetryConfig {
  // 最大重试次数，默认 3 次
  count?: number
  // 重试间隔时间，默认 500ms
  interval?: number
  // 是否使用指数退避算法，默认 true
  useExponentialBackoff?: boolean
  // 是否应该重试，默认 true
  shouldRetry?: ((error: any) => boolean)
}

// 内部使用的配置
// 设置 currentCount ，并在每次重试时递增
export interface RetryConfigInternal extends Required<RetryConfig> {
  currentCount: number
}

export const defaultRetryConfig: Required<RetryConfig> = {
  count: 3,
  interval: 500,
  useExponentialBackoff: true,
  shouldRetry: (_error) => true,
};

function normalizeRetryConfig(retryConfig: RetryConfig | boolean | number | undefined): Required<RetryConfig> | false {
  // 默认配置
  if (retryConfig === undefined || retryConfig === true) {
    return defaultRetryConfig;
  }
  if (!retryConfig) {
    return false;
  }
  if (typeof retryConfig === 'number' || (typeof retryConfig === 'string' && !Number.isNaN(Number(retryConfig)))) {
    if (Number(retryConfig) < 0) {
      return false;
    }
    return {
      ...defaultRetryConfig,
      count: Number(retryConfig),
    };
  }
  if (typeof retryConfig !== 'boolean' && typeof retryConfig !== 'object') {
    return false;
  }
  return {
    ...defaultRetryConfig,
    ...retryConfig,
    shouldRetry: typeof retryConfig.shouldRetry === 'function'
      ? (error: any) => !!(retryConfig.shouldRetry!(error))
      : (_error: any) => true,
  };
}

function wait(delay: number, signal?: AbortSignal) {
  return new Promise((resolve, reject) => {
    // 如果在开始等待前已经被取消，直接reject
    if (signal?.aborted) {
      reject(new Error('Request aborted'));
      return;
    }

    const timer = setTimeout(resolve, delay);

    // 重试间隔期间，也可以取消请求
    // 监听取消信号
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new Error('Request aborted'));
    }, { once: true });
  });
}

// 通过闭包，将 axiosInstance 注入到 retryInterceptor 中，避免循环引用
export function createRetryInterceptor(axiosInstance: AxiosInstance) {
  return async function retryInterceptor(error: AxiosError) {
    if (!axios.isAxiosError(error)) {
      return error;
    }

    if (!error.config || typeof error.config !== 'object') {
      return error;
    }

    const config = error.config;

    // 如果请求已经被取消，不进行重试
    if (config.signal?.aborted) {
      return Promise.reject(error);
    }

    // 获取当前重试次数
    let currentCount = Number((config?.retryConfig as RetryConfigInternal)?.currentCount);
    if (Number.isNaN(currentCount)) {
      currentCount = 0;
    }
    if (currentCount < 0) {
      currentCount = 0;
    }

    config.retryConfig = normalizeRetryConfig(config.retryConfig);

    if (!config.retryConfig) {
      return Promise.reject(error);
    }

    const retryConfig = config.retryConfig as RetryConfigInternal;

    retryConfig.currentCount = currentCount;

    // 检查是否达到最大重试次数
    if (retryConfig.currentCount >= retryConfig.count) {
      return Promise.reject(error);
    }

    // 检查是否应该重试
    if (!retryConfig.shouldRetry(error)) {
      return Promise.reject(error);
    }

    // 计算延迟时间
    const delay = retryConfig.useExponentialBackoff
      ? retryConfig.interval * 2 ** (retryConfig.currentCount - 1)
      : retryConfig.interval;

    return wait(delay, config.signal as AbortSignal).then(() => {
      // 增加重试计数
      retryConfig.currentCount += 1;
      // 重试请求
      return axiosInstance(config);
    }).catch(() => {
      return Promise.reject(error);
    });
  };
}
