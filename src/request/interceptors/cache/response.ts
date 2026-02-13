import type { AxiosResponse } from 'axios';
import type { CacheConfigInternal } from './types';
import type { CacheStore } from '@/utils/cache/types';
import { CACHE_TAG } from '@/request/interceptors/cache/constants';

export function createCacheResponseInterceptor(cacheStore: CacheStore) {
  return async function cacheResponseInterceptor(response: AxiosResponse) {
    // 失败的响应不缓存
    if (response.status < 200 || response.status >= 300) {
      return response;
    }

    const { config } = response;

    if (!config || !config[CACHE_TAG]) {
      return response;
    }

    const cacheConfig = config[CACHE_TAG] as CacheConfigInternal;

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
