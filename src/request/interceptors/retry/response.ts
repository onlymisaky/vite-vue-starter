import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { ResponseInterceptor } from '../types';
import type { InternalRetryConfig, RetryConfig } from './types';
import { validateAxiosError, validateAxiosResponse } from '../utils';
import { RETRY_TAG } from './constants';
import { normalizeRetryConfig, retryRequest } from './utils';

class RetryInterceptor {
  onFulfilled: Nullable<ResponseInterceptor<'fulfilled'>> = null;
  onRejected: Nullable<ResponseInterceptor<'rejected'>> = null;
  private globalRetryConfig: false | InternalRetryConfig = false;

  constructor(config: RetryConfig) {
    this.globalRetryConfig = normalizeRetryConfig(config);
    if (this.globalRetryConfig !== false && this.globalRetryConfig.count > 0) {
      if (config.fulfilled?.shouldRetry && typeof config.fulfilled?.shouldRetry === 'function') {
        this.onFulfilled = this.fulfilledInterceptor;
      }

      if (config.rejected?.shouldRetry && typeof config.rejected?.shouldRetry === 'function') {
        this.onRejected = this.rejectedInterceptor;
      }
    }
  }

  private getRequestRetryConfig(requestConfig: InternalAxiosRequestConfig) {
    const requestRetryConfig = normalizeRetryConfig(requestConfig[RETRY_TAG]);
    return requestRetryConfig;
  }

  private getRetryConfig(requestConfig: InternalAxiosRequestConfig) {
    const globalRetryConfig = this.globalRetryConfig as InternalRetryConfig;
    const requestRetryConfig = this.getRequestRetryConfig(requestConfig);

    if (requestRetryConfig === false) {
      return globalRetryConfig;
    }

    // 取当前请求的原始 shouldRetry 配置，用于判断是否需要覆盖全局配置
    const originalFulfilledShouldRetry = (requestConfig[RETRY_TAG] as RetryConfig)?.fulfilled?.shouldRetry;
    const originalRejectedShouldRetry = (requestConfig[RETRY_TAG] as RetryConfig)?.rejected?.shouldRetry;

    const retryConfig: InternalRetryConfig = {
      ...globalRetryConfig,
      ...requestRetryConfig,
      fulfilled: {
        shouldRetry: (response: AxiosResponse) => {
          if (typeof originalFulfilledShouldRetry === 'function') {
            const shouldRetry = requestRetryConfig.fulfilled.shouldRetry(response);
            return shouldRetry;
          }
          const shouldRetry = globalRetryConfig.fulfilled.shouldRetry(response);
          return shouldRetry;
        },
      },
      rejected: {
        shouldRetry: (error: AxiosError) => {
          if (typeof originalRejectedShouldRetry === 'function') {
            const shouldRetry = requestRetryConfig.rejected.shouldRetry(error);
            return shouldRetry;
          }
          const shouldRetry = globalRetryConfig.rejected.shouldRetry(error);
          return shouldRetry;
        },
      },
    };
    return retryConfig;
  }

  private fulfilledInterceptor = (response: AxiosResponse) => {
    if (!validateAxiosResponse(response)) {
      return response;
    }

    const requestConfig = response.config!;

    const retryConfig = this.getRetryConfig(requestConfig);

    if (retryConfig.count <= 0) {
      return response;
    }

    if (!retryConfig.fulfilled.shouldRetry(response)) {
      return response;
    }

    return retryRequest(response, 0, retryConfig);
  };

  private rejectedInterceptor = (error: AxiosError) => {
    if (!validateAxiosError(error)) {
      return Promise.reject(error);
    }

    const requestConfig = error.config!;

    // 被取消的请求，不进行重试
    if (requestConfig.signal?.aborted) {
      return Promise.reject(error);
    }

    const retryConfig = this.getRetryConfig(requestConfig);

    if (retryConfig.count <= 0) {
      return Promise.reject(error);
    }

    if (!retryConfig.rejected.shouldRetry(error)) {
      return Promise.reject(error);
    }

    return retryRequest(error, 0, retryConfig);
  };
}

export function createRetryResponseInterceptor<R = any, D = any, H = Record<string, any>>(config: RetryConfig<R, D, H>) {
  const interceptor = new RetryInterceptor(config as RetryConfig);
  return [interceptor.onFulfilled, interceptor.onRejected] as [
    Nullable<ResponseInterceptor<'fulfilled', R, D, H>>,
    Nullable<ResponseInterceptor<'rejected', R, D, H>>,
  ];
}
