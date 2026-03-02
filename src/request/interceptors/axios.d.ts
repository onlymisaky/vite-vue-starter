import type { CACHE_TAG } from './cache/constants';
import type { CacheConfig } from './cache/types';
import type { RETRY_TAG } from './retry/constants';
import type { RetryConfig } from './retry/types';

declare module 'axios' {
  export interface AxiosRequestConfig {
    /**
     * 重试配置
     * NumberLike 表示重试次数，其它配置以全局配置为准
     * false 表示是当前请求不需要重试
     */
    [RETRY_TAG]?: RetryConfig | number | `${number}` | false
    /**
     * 缓存配置
     * false 表示是当前请求不使用缓存数据，也不对请求结果缓存
     */
    [CACHE_TAG]?: CacheConfig | number | `${number}` | false
  }
}

export {};
