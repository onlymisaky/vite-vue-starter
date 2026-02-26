import type { AxiosError } from 'axios';
import type { RetryConfig } from './types';
import axios from 'axios';
import { RETRY_TAG } from './constants';
import { normalizeRetryConfig, retryRequest } from './utils';

export function createRetryResponseInterceptor<T = unknown, D = any>(config: RetryConfig<T, D>) {
  const globalRetryConfig = normalizeRetryConfig<T, D>(config);
  if (globalRetryConfig.count <= 0) {
    return [null, null];
  }

  function onRejected(error: AxiosError<T, D>) {
    if (!axios.isAxiosError(error) || !error.config || typeof error.config !== 'object') {
      return Promise.reject(error);
    }

    const axiosRequestConfig = error.config;

    // 如果请求已经被取消，不进行重试
    if (axiosRequestConfig.signal?.aborted) {
      return Promise.reject(error);
    }

    if (!Reflect.has(axiosRequestConfig, RETRY_TAG)) {
      axiosRequestConfig[RETRY_TAG] = Object.assign({}, globalRetryConfig) as Required<RetryConfig>;
    }

    const requestRetryConfig = normalizeRetryConfig<T, D>(axiosRequestConfig[RETRY_TAG]);
    const retryConfig: Required<RetryConfig<T, D>> = {
      ...globalRetryConfig,
      ...requestRetryConfig,
      shouldRetry(error) {
        if (!globalRetryConfig.shouldRetry(error)) {
          return false;
        }
        if (!requestRetryConfig.shouldRetry(error)) {
          return false;
        }
        return true;
      },
    };

    axiosRequestConfig[RETRY_TAG] = retryConfig as Required<RetryConfig>;

    // 不重试，直接返回错误
    if (retryConfig.count <= 0) {
      return Promise.reject(error);
    }

    // 检查是否应该重试
    if (!retryConfig.shouldRetry(error)) {
      return Promise.reject(error);
    }

    /**
     * 重试请求
     * ! 之前通过闭包的形式，将 axiosInstance 注入到 retryInterceptor 中，使用 axiosInstance 进行请求重试
     * ! 但是这样会有一个致命的错误: 在重试期间发生的错误，会被其它的错误拦截器拦截，从而导致重复的错误处理
     * ! 解决的的办法也有:
     * !  1. 在这里临时移除其它的拦截，很明显做不到
     * !  2. 在这里添加一个标记，告诉其它拦截器，我正在进行重试，重试期间发生的错误不要处理，这种做法入侵性太强
     * !  3. 修改 adapter ，那不如采用现有的做法，创建一个专门用于重试请求的方法
     * !  4. 拿到当前的 promise ，想办法做一些处理，让 catch 和 then 不要往下传递，但是实在想不出方法
     * ! 所以最终采用下面拿的方案，创建一个专门用于重试请求的方法，省事又省心，
     * ! 唯一需要考虑的是，如果在其他地方手动修改了 adapter ，会不会又什么意料之外的问题，但是不想考虑了
     */
    return retryRequest(error);
  }

  return [null, onRejected] as const;
}
