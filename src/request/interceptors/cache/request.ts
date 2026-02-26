import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type GeedStorage from 'geed-storage';
import type { CacheConfigInternal } from './types';
import { createAdapter } from './adapter';
import { CACHE_TAG } from './constants';
import { normalizeCacheConfig } from './utils';

export function createCacheRequestInterceptor(storage: GeedStorage) {
  async function onFulfilled(config: InternalAxiosRequestConfig) {
    // 如果配置中没有 CACHE_TAG 属性，则不进行缓存
    if (!Reflect.has(config, CACHE_TAG)) {
      return config;
    }

    const cacheConfig = normalizeCacheConfig(config[CACHE_TAG]) as Required<CacheConfigInternal>;

    if (!cacheConfig) {
      return config;
    }

    // 检查是否应该缓存
    if (!cacheConfig.shouldCache(config)) {
      return config;
    }

    // 如果强制刷新，不走缓存
    if (cacheConfig.forceRefresh) {
      const key = cacheConfig.generateKey(config);
      try {
        await storage.remove(key);
      }
      catch {}
      return config;
    }

    const key = cacheConfig.generateKey(config);

    cacheConfig.enabled = true;
    cacheConfig.cacheKey = key;
    config[CACHE_TAG] = cacheConfig;

    try {
      const cacheValue = await storage.get<AxiosResponse>(key);
      if (cacheValue) {
        config.adapter = createAdapter(cacheValue);
      }
    }
    catch { }

    return config;
  };

  return onFulfilled;
}
