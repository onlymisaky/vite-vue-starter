import type { KEY_CACHE_CONFIG, KEY_FROM_CACHE, KEY_PROCESSED_CACHE_CONFIG } from './cache/constants';
import type { CacheConfig, ProcessedCacheConfig } from './cache/types';
import type { KEY_RETRY_CONFIG } from './retry/constants';
import type { RetryConfig } from './retry/types';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * 重试配置
     * number | `${number}` 表示重试次数，其它配置以全局配置为准
     * false 表示是当前请求不需要重试
     */
    [KEY_RETRY_CONFIG]?: RetryConfig | number | `${number}` | false
    /**
     * 缓存配置
     * number | `${number}` 表示缓存时间（毫秒），其它配置以全局配置为准
     * true 表示是当前请求使用缓存数据，也会缓存请求结果，但是只有当  response.status >= 200 && response.status < 300 时才会缓存
     * false 表示是当前请求不使用缓存数据，也不对请求结果缓存
     * 'delete' 表示在请求前清除缓存，请求成功后也不会缓存响应数据
     * 'refresh' 表示在请求前清除缓存，请求成功后会缓存响应数据
     */
    [KEY_CACHE_CONFIG]?: CacheConfig | number | `${number}` | boolean | 'delete' | 'refresh'
    [KEY_PROCESSED_CACHE_CONFIG]?: ProcessedCacheConfig
  }

  export interface AxiosResponse {
    [KEY_FROM_CACHE]?: boolean
  }
}

export {};
