import type { AxiosPromise, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export function createAdapter<T extends AxiosResponse>(cachedValue: T) {
  return function adapter(config: InternalAxiosRequestConfig): AxiosPromise {
    return Promise.resolve({
      ...cachedValue,
      config,
    });
  };
}
