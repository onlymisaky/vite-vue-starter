import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

// 为 Promise 添加 abort 方法
export interface AbortablePromise<T> extends Promise<T> {
  abort: () => void
}

// 工具类型：转换方法的返回类型为可中断的 Promise
export type ConvertToAbortable<T> = T extends (...args: any[]) => Promise<infer R>
  ? (...args: Parameters<T>) => AbortablePromise<R>
  : T;

export type Methods = 'request' | 'get' | 'delete' | 'head' | 'options' | 'post' | 'put' | 'patch' | 'postForm' | 'putForm' | 'patchForm';

// 增强 AxiosInstance 的类型
export interface AbortableAxiosInstance extends Omit<AxiosInstance, Methods> {
  <T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>): AbortablePromise<R>
  <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>): AbortablePromise<R>

  request: <T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>) => AbortablePromise<R>
  get: <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  delete: <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  head: <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  options: <T = any, R = AxiosResponse<T>, D = any>(url: string, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  post: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  put: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  patch: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  postForm: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  putForm: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
  patchForm: <T = any, R = AxiosResponse<T>, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>) => AbortablePromise<R>
}
