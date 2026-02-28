import type { ShouldDo } from './../types';

// 暴露给外部使用的配置
export interface RetryConfig<R = any, D = any, H = Record<string, any>> {
  // 重试次数，默认3次，最大10次
  count?: number
  // 重试间隔时间，默认 500ms，最小 300ms，最大 5000ms
  /**
   * 重试间隔时间，默认 500ms，最小 300ms，最大 5000ms
   * 也可以根据当前重试次数动态计算间隔时间
   */
  interval?: number | ((retriesCount: number) => number)
  /**
   * 对进入 responseFulfilled 拦截器的响应进行判断是否应该重试，默认 false
   * Q: 为什么 fulfilled 也要重试
   * A: 因为 fulfilled 不代表请求一定是成功的，可以在 validateStatus 中设置，让所有状态码都进入 responseFulfilled 拦截器
   */
  fulfilled?: {
    shouldRetry?: ShouldDo<'fulfilled', R, D, H>
  }
  /**
   * 对进入 responseRejected 拦截器的错误进行判断是否应该重试，默认 true
   */
  rejected?: {
    shouldRetry?: ShouldDo<'rejected', R, D, H>
  }
}

export interface InternalRetryConfig<R = any, D = any, H = Record<string, any>> extends DeepRequired<RetryConfig<R, D, H>> {
  interval: (retriesCount: number) => number
}
