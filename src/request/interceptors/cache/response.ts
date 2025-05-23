import type { AxiosResponse } from 'axios';
import type { CacheConfigInternal } from './types';
import type { CacheStore } from '@/utils/cache/types';

export function createCacheResponseInterceptor(cacheStore: CacheStore) {
  return async function cacheResponseInterceptor(response: AxiosResponse) {
    const { config } = response;

    if (!config || !config.cacheConfig) {
      return response;
    }

    const cacheConfig = config.cacheConfig as CacheConfigInternal;

    if (!cacheConfig.enabled) {
      return response;
    }

    try {
      const existingCache = await cacheStore.has(cacheConfig.cacheKey);
      if (!existingCache) {
        await cacheStore.set(cacheConfig.cacheKey, response, cacheConfig.ttl);
      }
    }
    catch { }

    return response;
  };
}
