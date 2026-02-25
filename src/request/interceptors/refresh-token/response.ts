import type { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import type { InterceptorType, RefreshTokenConfigBase } from './types';
import axios from 'axios';
import { promiseWithResolvers } from '@/utils/promise';

/**
 * 根据拦截器类型，维持 Promise 状态
 * @param interceptType
 * @param res
 */
function settle<R = any, D = any, H = Record<string, any>>(interceptType: InterceptorType, res: AxiosResponse<R, D, H> | AxiosError<R, D>) {
  if (interceptType === 'fulfilled') {
    return res;
  }
  if (interceptType === 'rejected') {
    return Promise.reject(res);
  }
  return res;
}

export function createRefreshTokenResponseInterceptor<R = any, D = any, H = Record<string, any>>(
  config: RefreshTokenConfigBase<R, D, H>,
  axiosInstance?: AxiosInstance,
) {
  if (typeof config !== 'object' || config === null) {
    return [null, null] as const;
  }

  let onFulfilled = null;
  let onRejected = null;

  // 使用 axiosInstance 重新发送请求可能会遇到以下问题
  // 1. 如果新的 access token 不可用，会导致无限循环
  // 2. 其他拦截器（如重试、缓存等）可能会重复处理
  // 如果非要使用 axiosInstance 重新发送请求
  // 可以在 config 中加一个标记，避免重复处理
  // 但是其它拦截器也要对这个标记进行判断，避免重复处理
  // 或者临时清除所有的拦截器
  const httpClient = typeof axiosInstance === 'function' ? axiosInstance : axios;

  const clearAccessToken = typeof config.clearAccessToken === 'function' ? config.clearAccessToken : () => {};
  const clearRefreshToken = typeof config.clearRefreshToken === 'function' ? config.clearRefreshToken : () => {};

  // 存储因为 access token 过期而失败的请求队列
  const queue: Array<{
    res: AxiosError<R, D> | AxiosResponse<R, D, H>
    resolve: (value: AxiosResponse<R, D, H>) => void
    reject: (reason?: any) => void
  }> = [];

  let refreshing: boolean = false;

  function handleRefreshFailure(res: AxiosError<R, D> | AxiosResponse<R, D, H>, interceptType: InterceptorType) {
    clearAccessToken();
    clearRefreshToken();
    queue.forEach(({ resolve, reject, res }) => {
      interceptType === 'fulfilled' ? resolve(res as AxiosResponse<R, D, H>) : reject(res);
    });
    queue.length = 0;
    return settle(interceptType, res);
  }

  async function process(res: AxiosError<R, D> | AxiosResponse<R, D, H>, interceptType: InterceptorType) {
    // 判断是否需要刷新 access token
    if (interceptType === 'fulfilled') {
      if (!config.fulfilled || typeof config.fulfilled.shouldRefresh !== 'function') {
        return res;
      }
      if (!config.fulfilled.shouldRefresh(res as AxiosResponse<R, D, H>)) {
        return res;
      }
    }

    if (interceptType === 'rejected') {
      if (!config.rejected || typeof config.rejected.shouldRefresh !== 'function') {
        return Promise.reject(res);
      }
      if (!config.rejected.shouldRefresh(res as AxiosError<R, D> & AxiosResponse<R, D, H>)) {
        return Promise.reject(res);
      }
    }

    // 如果正在刷新 access token，则将当前请求加入队列
    if (refreshing) {
      const { promise, resolve, reject } = promiseWithResolvers<AxiosResponse<R, D, H>>();
      queue.push({ res, resolve, reject });
      return promise;
    }

    const refreshToken = config.getRefreshToken();

    // 如果没有 refresh token，则直接返回错误
    if (!refreshToken) {
      return handleRefreshFailure(res, interceptType);
    }

    refreshing = true;
    const accessToken = await config.refreshApi(refreshToken).catch(() => null); ;
    refreshing = false;

    // 如果获取 access token 失败，直接返回错误
    if (typeof accessToken !== 'string' || !accessToken) {
      return handleRefreshFailure(res, interceptType);
    }

    // 将新的 access token 存储起来
    config.setAccessToken(accessToken);

    // 处理本次请求
    config.setRequestConfig(res.config!, { refreshToken, accessToken });
    const currentRes = httpClient(res.config!);

    // 释放队列
    // 不需要等待 currentRes 完成
    // token 刷新通常可靠，常规情况下不需要验证新的 access token 是否有效
    queue.forEach(({ res, resolve, reject }) => {
      config.setRequestConfig(res.config!, { refreshToken, accessToken });
      // eslint-disable-next-line ts/ban-ts-comment
      // @ts-ignore
      httpClient(res.config!).then(resolve).catch(reject);
    });
    queue.length = 0;

    return currentRes;
  }

  function fulfilledInterceptor(response: AxiosResponse<R, D, H>): MaybePromise<AxiosResponse<R, D, H>> {
    // 对 response 做基础校验
    if (!response || !response.config || typeof response.config !== 'object') {
      return response;
    }

    return process(response, 'fulfilled') as Promise<AxiosResponse<R, D, H>>;
  }

  function rejectedInterceptor(error: AxiosError<R, D>): MaybePromise<AxiosError<R, D>> {
    // 对 error 做基础校验
    if (!axios.isAxiosError(error) || !error.config || typeof error.config !== 'object') {
      return Promise.reject(error);
    }

    return process(error, 'rejected') as Promise<AxiosError<R, D>>;
  }

  if (config.fulfilled && typeof config.fulfilled.shouldRefresh === 'function') {
    onFulfilled = fulfilledInterceptor;
  }

  if (config.rejected && typeof config.rejected.shouldRefresh === 'function') {
    onRejected = rejectedInterceptor;
  }

  return [onFulfilled, onRejected] as const;
}
