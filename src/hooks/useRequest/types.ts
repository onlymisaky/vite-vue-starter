export interface UseRequestCacheOptions {
  // enable?: boolean
  // ttl?: number
  // generateKey?: (config: AxiosRequestConfig) => string
  // shouldCache?: (config: AxiosRequestConfig) => boolean
  // forceRefresh?: boolean
}
export interface UseRequestRetryOptions {
  count?: number
  // interval?: number
  // useExponentialBackoff?: boolean
  // shouldRetry?: (error: any) => boolean
}
export interface UseRequestThrottleOptions {
  wait?: number
  // leading?: boolean
  // trailing?: boolean
  // maxWait?: number
}
export interface UseRequestDebounceOptions {
  wait?: number
  // leading?: boolean
  // trailing?: boolean
  // maxWait?: number
}

export interface UseRequestOptions<Service extends (...args: any) => Promise<any> = (...args: any) => Promise<any>> {
  immediate: boolean
  method?: string
  initData?: ReturnType<Service>
  initParams?: Parameters<Service>
  cache?: boolean | UseRequestCacheOptions
  retry?: number | UseRequestRetryOptions
  throttle?: number | UseRequestThrottleOptions
  debounce?: number | UseRequestDebounceOptions
  onBefore?: (params: Parameters<Service>) => void
  onProgress?: (progress: number, params: Parameters<Service>) => void
  onSuccess?: (data: ReturnType<Service>, params: Parameters<Service>) => void
  onError?: (error: any, params: Parameters<Service>) => void
  onFinally?: (params: Parameters<Service>, data: ReturnType<Service>, error: any) => void
}

export interface NormalizeUseRequestOptions<Service extends (...args: any) => Promise<any> = (...args: any) => Promise<any>>
  extends Required<UseRequestOptions<Service>> {
  cache: UseRequestCacheOptions | boolean
  retry: UseRequestRetryOptions
  throttle: UseRequestThrottleOptions
  debounce: UseRequestDebounceOptions
}

export type LifecycleName = 'before' | 'progress' | 'success' | 'error' | 'finally';

export type LifecycleCbName = `on${FirstLetterUppercase<LifecycleName>}`;
