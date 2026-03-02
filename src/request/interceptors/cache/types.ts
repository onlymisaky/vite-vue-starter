import type { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 用户传入的缓存配置
 */
export interface CacheConfig<R = any, D = any, H = Record<string, any>> {
  /**
   * 自定义缓存条件
   * 第一个函数表示在 requestFulfilledInterceptor 中执行
   * 第二个函数表示在 responseFulfilledInterceptor 中执行
   * 两个函数都返回 true 时，才会缓存响应数据
   * 第一个函数默认值为 (config) => config.method === 'GET'
   * 第二个函数可为空，默认值为 (response) => response.status >= 200 && response.status < 300
   * 无论如何配置第二个函数，都必须满足 response.status >= 200 && response.status < 300 这个条件才会缓存响应数据
   */
  shouldCache?: [
    (config: AxiosRequestConfig<D>) => boolean,
    ((response: AxiosResponse<R, D, H>) => boolean)?,
  ]
  /**
   * 缓存键生成函数
   * 默认值形如：GET: /baseURL/url?params<headers>k=v;</headers><data>JSON.stringify(data)</data
   * @param config
   */
  generateKey?: (config: AxiosRequestConfig<D>) => string
  /**
   * 缓存时间（毫秒），默认值为 5 分钟
   */
  ttl?: number
  // 缓存存储方式，默认值为 'memory'
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  /**
   * 可选值: 'delete' | 'refresh'
   * 'delete' 表示在请求前清除缓存，请求成功后也不会缓存响应数据
   * 'refresh' 表示在请求前清除缓存，请求成功后会缓存响应数据
   */
  cacheAction?: 'delete' | 'refresh'
}

/**
 * 经过 requestFulfilledInterceptor 处理后的缓存配置，将结果存储到 config[KEY_PROCESSED_CACHE_CONFIG] 中
 * cacheKey: generateKey(config) 的返回值
 * shouldCache: shouldCache[1]
 */
export interface ProcessedCacheConfig<R = any, D = any, H = Record<string, any>> {
  ttl: number
  storage: 'memory' | 'localStorage' | 'sessionStorage'
  cacheKey: string
  shouldCache: ((response: AxiosResponse<R, D, H>) => boolean)
}

export interface InternalCacheConfig<R = any, D = any, H = Record<string, any>>
  extends DeepRequired<Omit<CacheConfig<R, D, H>, 'cacheAction'>> {
  cacheAction?: 'delete' | 'refresh'
}
