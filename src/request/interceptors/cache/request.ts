import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { CacheConfig, CacheConfigInternal } from './types';
import type { CacheStore } from '@/utils/cache/types';
import { createAdapter } from './adapter';
import { CACHE_TAG, DEFAULT_CACHE_CONFIG } from './constants';

function normalizeShouldCache(fn: CacheConfig['shouldCache']): Required<CacheConfig>['shouldCache'] {
  if (typeof fn === 'function') {
    return function shouldCache(config: AxiosRequestConfig) {
      return !!(fn!(config));
    };
  }
  return function shouldCache(_config: AxiosRequestConfig) {
    return DEFAULT_CACHE_CONFIG.shouldCache(_config);
  };
}

function normalizeGenerateKey(fn: CacheConfig['generateKey']): Required<CacheConfig>['generateKey'] {
  if (typeof fn === 'function') {
    return function generateKey(config: AxiosRequestConfig) {
      const key = fn!(config);
      return (typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol')
        ? key
        : DEFAULT_CACHE_CONFIG.generateKey(config);
    };
  }
  return function generateKey(config: AxiosRequestConfig) {
    return DEFAULT_CACHE_CONFIG.generateKey(config);
  };
}

function normalizeCacheConfig(cacheConfig: CacheConfig | boolean | unknown): Required<CacheConfig> | false {
  // 所有不规范的配置，都不进行缓存
  if (!cacheConfig || (typeof cacheConfig !== 'boolean' && typeof cacheConfig !== 'object')) {
    return false;
  }

  if (typeof cacheConfig === 'boolean') {
    return DEFAULT_CACHE_CONFIG;
  }

  const config = cacheConfig as CacheConfig;

  let ttl = Number(config.ttl);
  ttl = Number.isNaN(ttl) ? DEFAULT_CACHE_CONFIG.ttl : Math.min(Math.max(ttl, 300), 5000);

  return {
    ttl,
    forceRefresh: !!config.forceRefresh,
    shouldCache: normalizeShouldCache(config.shouldCache),
    generateKey: normalizeGenerateKey(config.generateKey),
  };
}

export function createCacheRequestInterceptor(cacheStore: CacheStore) {
  return async function cacheRequestInterceptor(config: InternalAxiosRequestConfig) {
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
        await cacheStore.delete(key);
      }
      catch {}
      return config;
    }

    const key = cacheConfig.generateKey(config);

    cacheConfig.enabled = true;
    cacheConfig.cacheKey = key;
    config[CACHE_TAG] = cacheConfig;

    try {
      const cacheValue = await cacheStore.get<AxiosResponse>(key);
      if (cacheValue) {
        config.adapter = createAdapter(cacheValue);
      }
    }
    catch { }

    return config;
  };
}
