import type { AxiosError, AxiosInstance } from 'axios';
import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    retry?: RetryConfigInner | boolean
  }
}

export interface RetryConfig {
  // 最大重试次数
  count?: number
  // 重试间隔时间
  interval?: number
  // 是否使用指数退避算法
  useExponentialBackoff?: boolean
  // 是否应该重试
  shouldRetry?: ((error: any) => boolean)
}

export interface RetryConfigInner extends RetryConfig {
  currentCount: number
}

export const defaultRetryConfig: RetryConfigInner = {
  currentCount: 0,
  count: 9,
  interval: 500,
  useExponentialBackoff: true,
  shouldRetry: (_error) => true,
  // shouldRetry: (error) => {
  //   return axios.isAxiosError(error) && (
  //     !error.response // 网络错误
  //     || error.code === 'ECONNABORTED' // 超时
  //     || (error.response?.status >= 500 && error.response?.status <= 599) // 服务器错误
  //   );
  // },
};

function normalizeRetryConfig(retry: RetryConfigInner | boolean | undefined): RetryConfigInner | false {
  // 默认配置
  if (retry === undefined) {
    return {
      ...defaultRetryConfig,
      currentCount: 0,
    };
  }
  if (!retry) {
    return false;
  }
  if (typeof retry !== 'boolean' && typeof retry !== 'object') {
    return false;
  }
  if (typeof retry === 'boolean') {
    return { ...defaultRetryConfig, currentCount: 0 };
  }
  return {
    ...defaultRetryConfig,
    ...retry,
    currentCount: retry.currentCount || 0,
    shouldRetry: typeof retry.shouldRetry === 'function'
      ? (error: any) => !!(retry.shouldRetry!(error))
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

    config.retry = normalizeRetryConfig(config.retry);

    if (!config.retry) {
      return Promise.reject(error);
    }

    const retryConfig = config.retry as Required<RetryConfigInner>;

    // 检查是否应该重试
    if (!retryConfig.shouldRetry(error)) {
      return Promise.reject(error);
    }

    // 检查是否达到最大重试次数
    if (retryConfig.currentCount > retryConfig.count) {
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
