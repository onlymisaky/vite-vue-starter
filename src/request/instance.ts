import axios from 'axios';
import {
  axiosErrorInterceptor,
  businessInterceptor,
  createCacheInterceptor,
  createRefreshTokenResponseInterceptor,
  createRetryResponseInterceptor,
} from './interceptors';
import { withAbort } from './utils';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_PREFIX,
  timeout: 5 * 60 * 1000,
  withCredentials: true,
  /**
   * 通常后端接口返回的状态码有两种设计方案:
   *  1. 无论成功与否，都返回 200 或 200-299
   *     这种方式有助于前端统一处理响应，避免因为状态码不同而导致的错误处理逻辑复杂
   *  2. 返回符合 HTTP 规范的状态码，例如 200 表示成功，400 表示客户端错误，500 表示服务器错误
   *     这种方式更符合 HTTP 规范，但是前端需要根据状态码判断是否成功
   *  3. 当然还有第三种方案，就是前面两种方案的结合
   *     业务层面报错也返回 200 或 200-299，但是在 data 中添加 success: false 字段
   *     网关、其它服务报错则返回符合 HTTP 规范的状态码
   *     遇到这种可就遭老罪喽
   * 此处的取值范围也决定了不同状态码的请求，会通过哪些拦截器处理
   */
  validateStatus: (status) => status >= 200 && status < 300,
});

const [refreshTokenResponseFulfilledInterceptor, refreshTokenResponseRejectedInterceptor] = createRefreshTokenResponseInterceptor<ApiResponse>({
  refreshApi: (refreshToken) => {
    // eslint-disable-next-line ts/no-use-before-define
    return requestWithAbort
      .post<ApiResponse<string>>('/auth/refresh-token', { refreshToken })
      .then((res) => res.data.data);
  },
  setAccessToken: (token) => localStorage.setItem('accessToken', token),
  getRefreshToken: () => localStorage.getItem('refreshToken') || '',
  fulfilled: {
    shouldRefresh: (response) => {
      if (response.config?.url === '/auth/refresh-token') {
        return false;
      }
      return response.data.status === 401;
    },
  },
  rejected: {
    shouldRefresh: (error) => {
      if (error.config?.url === '/auth/refresh-token') {
        return false;
      }
      return error.response?.status === 401;
    },
  },
  setRequestConfig(config, { accessToken }) {
    config.headers!.Authorization = `Bearer ${accessToken}`;
  },
});

const [retryResponseFulfilledInterceptor, retryResponseRejectedInterceptor] = createRetryResponseInterceptor<ApiResponse>({
  rejected: {
    shouldRetry: (error) => {
      if (error.config?.url === '/auth/refresh-token') {
        return false;
      }
      if (error.response && error.response.status >= 400 && error.response.status !== 401) {
        return true;
      }
      return false;
    },
  },
});

const [cacheRequestFulfilledInterceptor, cacheResponseFulfilledInterceptor] = createCacheInterceptor<ApiResponse>({});

/**
 * 注意拦截器的返回值
 * 只能返回 Promise.resolve(AxiosResponse) , AxiosResponse , Promise.reject(AxiosError) 或 throw AxiosError
 * 拦截器的当前拦截器的返回值会决定下一个拦截器的调用
 * 当前返回值: Promise.resolve(AxiosResponse) 或 AxiosResponse ，下一个拦截器调用: onFulfilled
 * 当前返回值: Promise.reject(reason) 或 throw error ，下一个拦截器调用: onRejected
 */

/**
 * 注意拦截器顺序
 */

// 判断是否缓存
axiosInstance.interceptors.request.use(cacheRequestFulfilledInterceptor);
// 刷新 access token
axiosInstance.interceptors.response.use(refreshTokenResponseFulfilledInterceptor, refreshTokenResponseRejectedInterceptor);
// 错误重试
axiosInstance.interceptors.response.use(retryResponseFulfilledInterceptor, retryResponseRejectedInterceptor);
// 业务逻辑判断
axiosInstance.interceptors.response.use(businessInterceptor);
// 缓存响应
axiosInstance.interceptors.response.use(cacheResponseFulfilledInterceptor);
// 最终错误处理
axiosInstance.interceptors.response.use((res) => res, axiosErrorInterceptor);

const requestWithAbort = withAbort(axiosInstance);

export {
  axiosInstance,
  requestWithAbort as request,
};
