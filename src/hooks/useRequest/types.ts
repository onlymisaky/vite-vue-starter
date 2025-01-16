export interface UseRequestCacheOptions {

}
export interface UseRequestRetryOptions {

}
export interface UseRequestThrottleOptions {

}
export interface UseRequestDebounceOptions {

}

export interface UseRequestOptions<Api extends (...args: any) => Promise<any> = (...args: any) => Promise<any>> {
  immediate: boolean
  method?: string
  initData?: ReturnType<Api>
  initParams?: Parameters<Api>
  cache?: boolean | UseRequestCacheOptions
  retry?: boolean | number | UseRequestRetryOptions
  throttle?: boolean | number | UseRequestThrottleOptions
  debounce?: boolean | number | UseRequestDebounceOptions
  onBefore?: (params: Parameters<Api>) => void
  onProgress?: (progress: number, params: Parameters<Api>) => void
  onSuccess?: (data: ReturnType<Api>, params: Parameters<Api>) => void
  onError?: (error: any, params: Parameters<Api>) => void
  onFinally?: (params: Parameters<Api>, data: ReturnType<Api>, error: any) => void
}

export interface NormalizeUseRequestOptions<Api extends (...args: any) => Promise<any> = (...args: any) => Promise<any>>
  extends Required<UseRequestOptions<Api>> {
  cache: UseRequestCacheOptions | boolean
  retry: UseRequestRetryOptions | boolean
  throttle: UseRequestThrottleOptions | boolean
  debounce: UseRequestDebounceOptions | boolean
}

export type LifecycleName = 'before' | 'progress' | 'success' | 'error' | 'finally';

export type LifecycleCbName = `on${FirstLetterUppercase<LifecycleName>}`;
