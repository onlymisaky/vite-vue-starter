import type { AxiosError, AxiosResponse } from 'axios';
import type { ResponseInterceptor } from '../types';
import type { InternalRetryConfig, RetryConfig } from './types';
import { validateAxiosError, validateAxiosResponse } from '../utils';
import { getRetryConfig, normalizeRetryConfig, retryRequest } from './utils';

class RetryInterceptor {
  private globalRetryConfig!: InternalRetryConfig;

  constructor(config: RetryConfig) {
    this.globalRetryConfig = normalizeRetryConfig(config);
  }

  responseFulfilledInterceptor(response: AxiosResponse) {
    if (!validateAxiosResponse(response)) {
      return response;
    }

    const retryConfig = getRetryConfig(response.config!, this.globalRetryConfig);

    if (!retryConfig) {
      return response;
    }

    if (retryConfig.count <= 0) {
      return response;
    }

    if (!retryConfig.fulfilled.shouldRetry(response)) {
      return response;
    }

    return retryRequest(response, 0, retryConfig);
  };

  responseRejectedInterceptor(error: AxiosError) {
    if (!validateAxiosError(error)) {
      return Promise.reject(error);
    }

    const requestConfig = error.config!;

    // 被取消的请求，不进行重试
    if (requestConfig.signal?.aborted) {
      return Promise.reject(error);
    }

    const retryConfig = getRetryConfig(requestConfig, this.globalRetryConfig);

    if (!retryConfig) {
      return Promise.reject(error);
    }

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
  return [
    interceptor.responseFulfilledInterceptor.bind(interceptor),
    interceptor.responseRejectedInterceptor.bind(interceptor),
  ] as [
    ResponseInterceptor<'fulfilled', R, D, H>,
    ResponseInterceptor<'rejected', R, D, H>,
  ];
}
