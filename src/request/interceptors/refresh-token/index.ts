import type { AxiosError, AxiosResponse } from 'axios';
import type { InterceptorType, ResponseInterceptor } from './../types';
import type { InternalRefreshTokenConfig, RefreshTokenConfig } from './types';
import axios from 'axios';
import { promiseWithResolvers } from '@/utils/promise';
import { validateAxiosError, validateAxiosResponse } from '../utils';
import { normalizeRefreshTokenConfig } from './utils';

class RefreshTokenInterceptor {
  onFulfilled: Nullable<ResponseInterceptor<'fulfilled'>> = null;
  onRejected: Nullable<ResponseInterceptor<'rejected'>> = null;

  private refreshTokenConfig: InternalRefreshTokenConfig | false = false;

  private refreshing: boolean = false;

  private queue: Array<{
    res: AxiosError | AxiosResponse
    resolve: (value: AxiosResponse) => void
    reject: (reason?: any) => void
  }> = [];

  constructor(config: RefreshTokenConfig) {
    this.refreshTokenConfig = normalizeRefreshTokenConfig(config);
    if (this.refreshTokenConfig !== false) {
      if (typeof config?.fulfilled?.shouldRefresh === 'function') {
        this.onFulfilled = this.fulfilledInterceptor;
      }
      if (typeof config?.rejected?.shouldRefresh === 'function') {
        this.onRejected = this.rejectedInterceptor;
      }
    }
  }

  private clearToken() {
    if (this.refreshTokenConfig === false) {
      return;
    }
    this.refreshTokenConfig.clearAccessToken();
    this.refreshTokenConfig.clearRefreshToken();
  };

  private handleRefreshFailure(res: AxiosResponse | AxiosError, interceptorType: InterceptorType) {
    this.clearToken();
    this.queue.forEach(({ resolve, reject, res }) => {
      this.isFulfilled(res, interceptorType) ? resolve(res) : reject(res);
    });
    this.queue.length = 0;
    if (this.isFulfilled(res, interceptorType)) {
      return res;
    }
    return Promise.reject(res);
  };

  // 类型守卫，为了能在运行时正确推断 res 类型
  private isFulfilled(res: AxiosResponse | AxiosError, interceptorType: 'fulfilled' | 'rejected'): res is AxiosResponse {
    return interceptorType === 'fulfilled';
  }

  private async process(res: AxiosResponse | AxiosError, interceptorType: InterceptorType) {
    const refreshTokenConfig = this.refreshTokenConfig as InternalRefreshTokenConfig;
    const refreshing = this.refreshing;
    const queue = this.queue;

    if (this.isFulfilled(res, interceptorType)) {
      if (!refreshTokenConfig.fulfilled.shouldRefresh(res)) {
        return res;
      }
    }
    else {
      if (!refreshTokenConfig.rejected.shouldRefresh(res)) {
        return Promise.reject(res);
      }
    }

    if (refreshing) {
      const { promise, resolve, reject } = promiseWithResolvers<AxiosResponse>();
      queue.push({ res, resolve, reject });
      return promise;
    }

    const refreshToken = refreshTokenConfig.getRefreshToken();

    if (!refreshToken) {
      return this.handleRefreshFailure(res, interceptorType);
    }

    this.refreshing = true;
    const accessToken = await refreshTokenConfig.refreshApi(refreshToken);
    this.refreshing = false;

    if (!accessToken) {
      return this.handleRefreshFailure(res, interceptorType);
    }

    refreshTokenConfig.setAccessToken(accessToken);

    refreshTokenConfig.setRequestConfig(res.config!, { accessToken, refreshToken });

    const newRes = axios.create()(res.config!);

    // 释放队列
    // 不需要等待 currentRes 完成
    // token 刷新通常可靠，常规情况下不需要验证新的 access token 是否有效
    queue.forEach(({ res, resolve, reject }) => {
      refreshTokenConfig.setRequestConfig(res.config!, { refreshToken, accessToken });
      axios.create()(res.config!).then(resolve).catch(reject);
    });
    queue.length = 0;

    return newRes;
  };

  private fulfilledInterceptor = async (response: AxiosResponse) => {
    if (!validateAxiosResponse(response)) {
      return response;
    }

    return this.process(response, 'fulfilled');
  };

  private rejectedInterceptor = async (error: AxiosError) => {
    if (!validateAxiosError(error)) {
      return Promise.reject(error);
    }

    return this.process(error, 'rejected');
  };
}

export function createRefreshTokenResponseInterceptor<R = any, D = any, H = Record<string, any>>(
  config: RefreshTokenConfig<R, D, H>,
) {
  const interceptor = new RefreshTokenInterceptor(config as RefreshTokenConfig);
  return [interceptor.onFulfilled, interceptor.onRejected] as [
    Nullable<ResponseInterceptor<'fulfilled', R, D, H>>,
    Nullable<ResponseInterceptor<'rejected', R, D, H>>,
  ];
}

/**
 * Test Cases
 * - 走 fulfilled 拦截器
 * - 走 rejected 拦截器
 * - refreshApi 报错
 * - 新的 access token 依旧没有生效
 * - 拦截器重复，导致死循环
 */
