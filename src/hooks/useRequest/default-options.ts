import type {
  LifecycleCbName,
  NormalizeUseRequestOptions,
  UseRequestCacheOptions,
  UseRequestDebounceOptions,
  UseRequestRetryOptions,
  UseRequestThrottleOptions,
} from './types';

export const defaultCacheOptions: UseRequestCacheOptions = {

};

export const defaultRetryOptions: UseRequestRetryOptions = {

};

export const defaultThrottleOptions: UseRequestThrottleOptions = {

};

export const defaultDebounceOptions: UseRequestDebounceOptions = {

};

export const defaultLifecycleOptions: Pick<NormalizeUseRequestOptions, LifecycleCbName> = {
  onBefore: (_params: any[]) => { },
  onProgress: (_progress: number, _params: any[]) => { },
  onSuccess: (_data: any, _params: any[]) => { },
  onError: (_error: any, _params: any[]) => { },
  onFinally: (_params: any[], _data: any, _error: any) => { },
};

export const defaultUseRequestOptions: NormalizeUseRequestOptions<any> = {
  initData: undefined,
  initParams: [],
  method: 'GET',
  immediate: false,
  cache: defaultCacheOptions,
  retry: defaultRetryOptions,
  throttle: defaultThrottleOptions,
  debounce: defaultDebounceOptions,
  ...defaultLifecycleOptions,
};
