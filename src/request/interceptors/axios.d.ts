import type { CACHE_TAG } from './cache/constants';
import type { CacheConfig } from './cache/types';
import type { RETRY_TAG } from './retry/constants';
import type { RetryConfig } from './retry/types';

declare module 'axios' {
  export interface AxiosRequestConfig {
    [RETRY_TAG]?: RetryConfig | number | `${number}` | boolean
    [CACHE_TAG]?: CacheConfig | boolean
  }
}

export {};
