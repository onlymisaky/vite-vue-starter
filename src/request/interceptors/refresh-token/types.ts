import type { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// 拦截器类型，不同的项目，token 过期时可能会走不用的拦截器
// 详情参照 src/request/instance.ts 中 validateStatus 注释和实现
export type InterceptorType = 'fulfilled' | 'rejected';

export interface InterceptorConfig<T extends InterceptorType, R = any, D = any, H = Record<string, any>> {
  /**
   * 判断是否需要刷新 token
   */
  shouldRefresh: (res: T extends 'fulfilled' ? AxiosResponse<R, D, H> : AxiosError<R, D>) => boolean
  /**
   * 再三思量
   * 在发起重试之前，当遇到错误(无论是获取新的 access token 失败，还是取值、运算等代码层面错误)时，应该根据拦截器类型返回相应的 promise 状态
   * 使用新的 access token 重新发起请求失败，则直接返回重试请求的 promise
   * 这样才是真正意义上的无感、无影响，也能做到无痛插拔
   */
  /**
   * 刷新 token 失败时，是否变更 promise 状态为 rejected
   * 默认值为 true
   */
  // refreshErrorReject?: boolean
  /**
   * 继续发送刚才失败的请求失败时，是否变更 promise 状态为 rejected
   * 默认值为 true
   */
  // retryErrorReject?: boolean
}

export interface RefreshTokenConfigBase<R = any, D = any, H = Record<string, any>> {
  refreshApi: (refreshToken: string) => Promise<string>
  setAccessToken: (token: string) => void
  clearAccessToken?: () => void
  getRefreshToken: () => string
  clearRefreshToken?: () => void
  // 设置请求配置，获取新的 access token 后，设置到请求头中，用于继续发送刚才失败的请求
  setRequestConfig: (config: AxiosRequestConfig, { refreshToken, accessToken }: { refreshToken: string, accessToken: string }) => void
  /**
   * token 过期时可能会走不用的拦截器，详情参照 src/request/instance.ts 中 validateStatus 注释和实现
   * 如果走 fulfilled 拦截器，配置 fulfilled
   * 如果走 rejected 拦截器，配置 rejected
   * 如果两个都有可能或不确定，则都配置
   * 如果都不配置，则永远不会自动刷新
   */
  /**
   * 当 token 过期时，进入的是 fulfilled 拦截器
   */
  fulfilled?: InterceptorConfig<'fulfilled', R, D, H>
  /**
   * 当 token 过期时，进入的是 rejected 拦截器
   */
  rejected?: InterceptorConfig<'rejected', R, D>
}

// 早期设计，通过 type 判断生成 fulfilled 或 rejected 拦截器
// 后考虑到不同项目中，token过期时，可能会走不同的拦截器，所以将 type 改为 fulfilled 和 rejected
// 使用 discriminated union，让 config.type === 'rejected' 能正确收窄类型
export interface RefreshTokenConfigRejected<R = any, D = any, _H = Record<string, any>>
  extends RefreshTokenConfigBase {
  type: 'rejected'
  shouldRefresh: (err: AxiosError<R, D>) => boolean
}

export interface RefreshTokenConfigFulfilled<R = any, D = any, H = Record<string, any>>
  extends RefreshTokenConfigBase {
  type: 'fulfilled'
  shouldRefresh: (res: AxiosResponse<R, D, H>) => boolean
}

export type RefreshTokenConfigUnion<R = any, D = any, H = Record<string, any>>
  = | RefreshTokenConfigRejected<R, D, H>
    | RefreshTokenConfigFulfilled<R, D, H>;

export type RefreshTokenResponseInterceptor<
  T extends InterceptorType,
  R = any,
  D = any,
  H = Record<string, any>,
> = T extends 'rejected'
  ? (error: AxiosError<R, D>) => any
  : (response: AxiosResponse<R, D, H>) => MaybePromise<AxiosResponse<R, D, H>>;
