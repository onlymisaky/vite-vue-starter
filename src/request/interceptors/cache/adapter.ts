import type { AxiosPromise, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { KEY_FROM_CACHE } from './constants';

export function createAdapter<T extends AxiosResponse>(cachedValue: T) {
  return function adapter(_config: InternalAxiosRequestConfig): AxiosPromise {
    return Promise.resolve({
      ...cachedValue,
      [KEY_FROM_CACHE]: true,
    });
  };
}
