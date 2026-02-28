import type { CACHE_TAG } from './cache/constants';
import type { RETRY_TAG } from './retry/constants';

declare module 'axios' {
  export interface AxiosRequestConfig {
    [RETRY_TAG]?: RetryConfig | number | boolean
    [CACHE_TAG]?: CacheConfig | boolean
  }
}

export {};
