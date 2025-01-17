declare module 'axios' {
  export interface AxiosRequestConfig {
    retryConfig?: RetryConfig | number
  }
}

// 暴露给外部使用的配置
export interface RetryConfig {
  // 最大重试次数，默认 3 次
  count?: number
  // 重试间隔时间，默认 500ms
  interval?: number
  // 是否使用指数退避算法，默认 true
  useExponentialBackoff?: boolean
  // 是否应该重试，默认 true
  shouldRetry?: ((error: any) => boolean)
}
