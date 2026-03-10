import type { AxiosInstance, AxiosResponse } from 'axios';
import type { AbortableAxiosInstance, Methods } from './types';
import { isPromise } from '@/utils/promise';

function isObject(value: any): value is object {
  return Object.prototype.toString.call(value) === '[object Object]';
}

const methods: Methods[] = ['delete', 'get', 'patch', 'patchForm', 'post', 'postForm', 'put', 'putForm', 'request'];

/**
 * 为 Axios 实例添加取消请求功能
 * @example
      const requestWithAbort = withAbort(axiosInstance);
      requestWithAbort.get('/api/foo').then(res => console.log(res));
      requestWithAbort.abort();
 */
export function withAbort(axiosInstance: AxiosInstance): AbortableAxiosInstance {
  return new Proxy(axiosInstance, {
    apply(target, thisArg, argArray) {
      const controller = new AbortController();
      let newArgs = argArray;
      // 没传任何参数
      if (argArray.length === 0) {
        // axiosInstance() ==> axiosInstance({ signal: controller.signal })
        newArgs = [{ signal: controller.signal }];
      }
      // 传了一个参数
      else if (argArray.length === 1) {
        if (typeof argArray[0] === 'string') {
          // axiosInstance('/api/foo') ==> axiosInstance('/api/foo', { signal: controller.signal })
          newArgs = [argArray[0], { signal: controller.signal }];
        }
        else if (typeof argArray[0] === 'object' && isObject(argArray[0])) {
          // axiosInstance({ url: '/api/foo' }) ==> axiosInstance({ url: '/api/foo', signal: controller.signal })
          newArgs = [{ signal: controller.signal, ...argArray[0] }];
        }
      }
      // 传了两个参数
      else if (argArray.length === 2) {
        if (typeof argArray[0] === 'string' && isObject(argArray[1])) {
          newArgs = [argArray[0], { signal: controller.signal, ...argArray[1] }];
        }
        if (isObject(argArray[0])) {
          newArgs = [{ signal: controller.signal, ...argArray[0] }, argArray[1]];
        }
      }

      const res = Reflect.apply(target, thisArg, newArgs);
      if (isPromise(res)) {
        (res as AbortablePromise<any>).abort = controller.abort.bind(controller);
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
          if (isPromise(res)) {
            (res as AbortablePromise<any>).abort = controller.abort.bind(controller);
          }
          return res;
        };
      }
      return value;
    },
  }) as AbortableAxiosInstance;
}

/**
 * 以 Go 风格处理 axios 响应和错误
 * 返回 [error, data] 元组，便于解构处理结果
 * @example
      (async() => {
        const [error, data] = await handleAxiosResult(requestWithAbort.get('/api/foo'));
        if (error) {
          console.error(error);
          return;
        }
        console.log(data);
      })
 * @template T 响应数据的类型
 * @template D 请求数据的类型
 * @param axiosPromise Axios 请求Promise
 * @returns [error, data] 元组，error 为 null 时表示请求成功
 */
export function handleAxiosResult<T = any, D = any>(
  axiosPromise: Promise<AxiosResponse<ApiResponse<T>, D>>,
): Promise<[Error, null] | [null, T]> {
  return axiosPromise
    .then((response) => {
      return [null, response.data.data] as [null, T];
    })
    .catch((error) => {
      return [error, null];
    });
}

/**
 * 传入一个可取消的 axios 请求函数
 * 返回一个新的请求函数
 * 该请求函数会将 axios 包装的的响应解包
 * 同时将 abort 方法绑定到返回的 Promise 上
 * ---
 * useRequest 接受一个函数 service 作为参数
 * 如果 service 函数返回的结果是一个带有 abort 方法的 Promise
 * 那么 useRequest 则会直接使用这个 abort
 * 反之则会创建一个带有 abort 方法的 Promise
 * 区别是：
 *  axios 请求函数的 abort 是真的 abort
 *  而 useRequest 创建的 abort 只是忽略结果，将 Promise 置为 rejected
 *
 * @param api 请求函数
 */
export function createUseRequestService<
  Api extends (...args: any[]) => AbortablePromise<AxiosResponse<any, any>>,
>(api: Api) {
  return function useRequestService(...params: Parameters<Api>) {
    const promiseWithAbort = api(...params);
    if (typeof promiseWithAbort.abort === 'function') {
      const abort = promiseWithAbort.abort.bind(promiseWithAbort);
      const promise = promiseWithAbort.then((res) => res.data.data);
      (promise as AbortablePromise<PaginatedData>).abort = abort;
      return promise;
    }
    return promiseWithAbort.then((res) => res.data.data);
  };
}
