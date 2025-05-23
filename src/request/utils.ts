import type { AxiosResponse } from 'axios';

/**
 * 以 Go 风格处理 axios 响应和错误
 * 返回 [error, data] 元组，便于解构处理结果
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
 *
 * ---
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
    const abort = promiseWithAbort.abort.bind(promiseWithAbort);
    const promise = promiseWithAbort.then((res) => res.data.data);
    (promise as AbortablePromise<PaginatedData>).abort = abort;
    return promise;
  };
}
