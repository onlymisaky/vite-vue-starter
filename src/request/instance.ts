import type { AxiosInstance } from 'axios';
import type { AbortableAxiosInstance, Methods } from './types';
import axios from 'axios';
import {
  axiosErrorInterceptor,
  businessInterceptor,
} from './interceptors';
import { createRetryInterceptor } from './interceptors/response/retry';

/**
 * 1. 先贴合业务做最简单的封装
 * 2. 乐观请求，不对错误做展示
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_PREFIX,
  timeout: 5 * 60 * 1000,
  withCredentials: true,
  /**
   * 本项目对接的后端接口，所有请求无论(业务层面)失败与否，都会返回200
   */
  validateStatus: (status) => status >= 200 && status < 300,
});

const retryInterceptor = createRetryInterceptor(axiosInstance);

// 添加响应拦截器，顺序很重要：
// 1. 先处理业务逻辑
axiosInstance.interceptors.response.use(businessInterceptor);
// 2. 处理 HTTP 错误，并在需要时进行重试
axiosInstance.interceptors.response.use((res) => res, retryInterceptor);
// 3. 最后处理剩余的错误
axiosInstance.interceptors.response.use((res) => res, axiosErrorInterceptor);

const methods: Methods[] = [
  'request',
  'get',
  'delete',
  'head',
  'options',
  'post',
  'put',
  'patch',
  'postForm',
  'putForm',
  'patchForm',
];

function withAbort(axiosInstance: AxiosInstance): AbortableAxiosInstance {
  return new Proxy(axiosInstance, {
    apply(target, thisArg, argArray) {
      const controller = new AbortController();
      let newArgs = argArray;
      if (argArray.length === 0) {
        newArgs = [{ signal: controller.signal }];
      }
      else if (argArray.length === 1) {
        if (typeof argArray[0] === 'string') {
          newArgs = [argArray[0], { signal: controller.signal }];
        }
        else {
          newArgs = [{ signal: controller.signal, ...argArray[0] }];
        }
      }
      const [url, config, ...rest] = argArray;
      newArgs = [url, { signal: controller.signal, ...config }, ...rest];
      const res = Reflect.apply(target, thisArg, newArgs);
      if (res && typeof res.then === 'function' && typeof res.catch === 'function') {
        res.abort = controller.abort.bind(controller);
      }
      return res;
    },

    get(target, prop, receiver) {
      const value = Reflect.get(target, prop, receiver);
      if (methods.includes(prop as Methods)) {
        const controller = new AbortController();
        return (...args: any[]) => {
          let newArgs = args;
          // 处理不同方法的参数
          // get, delete, head, options: (url[, config])
          if (['get', 'delete', 'head', 'options'].includes(prop as Methods)) {
            const [url, config, ...rest] = args;
            newArgs = [url, { signal: controller.signal, ...config }, ...rest];
          }
          // post, put, patch: (url[, data[, config]])
          else if (['post', 'put', 'patch'].includes(prop as Methods)) {
            const [url, data, config, ...rest] = args;
            newArgs = [url, data, { signal: controller.signal, ...config }, ...rest];
          }
          // postForm, putForm, patchForm: (url, data[, config])
          else if (['postForm', 'putForm', 'patchForm'].includes(prop as Methods)) {
            const [url, data, config, ...rest] = args;
            newArgs = [url, data, { signal: controller.signal, ...config }, ...rest];
          }
          // request: (config)
          else if (['request'].includes(prop as Methods)) {
            const [config, ...rest] = args;
            newArgs = [{ signal: controller.signal, ...config }, ...rest];
          }

          const res = value.apply(receiver, newArgs);
          if (res && typeof res.then === 'function' && typeof res.catch === 'function') {
            res.abort = controller.abort.bind(controller);
          }
          return res;
        };
      }
      return value;
    },
  }) as AbortableAxiosInstance;
}

const requestWithAbort = withAbort(axiosInstance);

export {
  axiosInstance,
  requestWithAbort as request,
};
