import axios from 'axios';
import {
  axiosErrorInterceptor,
  businessInterceptor,
  cacheRequestInterceptor,
  cacheResponseInterceptor,
  retryInterceptor,
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
   */
  validateStatus: (status) => status >= 200 && status < 300,
});

// 注意拦截器顺序
// 判断是否缓存
axiosInstance.interceptors.request.use(cacheRequestInterceptor);
// 错误重试
axiosInstance.interceptors.response.use((res) => res, retryInterceptor);
// 缓存响应
axiosInstance.interceptors.response.use(cacheResponseInterceptor);
// 业务逻辑判断
axiosInstance.interceptors.response.use(businessInterceptor);
// 最终错误处理
axiosInstance.interceptors.response.use((res) => res, axiosErrorInterceptor);

const requestWithAbort = withAbort(axiosInstance);

export {
  axiosInstance,
  requestWithAbort as request,
};
