import type { CacheStore } from '@/utils/cache/types';
import type { AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type { CacheConfig, CacheConfigInternal } from './types';
import { createAdapter } from './adapter';

export const defaultCacheConfig: Required<CacheConfig> = {
  ttl: 5 * 60 * 1000, // 5分钟
  forceRefresh: false,
  shouldCache: (config) => {
    return config.method?.toLowerCase() === 'get';
  },
  generateKey: (config) => {
    const { baseURL, url, params, data, method } = config;
    return JSON.stringify({
      baseURL,
      url,
      params,
      data,
      method,
    });
  },
};

function normalizeShouldCache(fn: CacheConfig['shouldCache']): Required<CacheConfig>['shouldCache'] {
  if (typeof fn === 'function') {
    return function shouldCache(config: AxiosRequestConfig) {
      return !!(fn!(config));
    };
  }
  return function shouldCache(_config: AxiosRequestConfig) {
    return defaultCacheConfig.shouldCache(_config);
  };
}

function normalizeGenerateKey(fn: CacheConfig['generateKey']): Required<CacheConfig>['generateKey'] {
  if (typeof fn === 'function') {
    return function generateKey(config: AxiosRequestConfig) {
      const key = fn!(config);
      return (typeof key === 'string' || typeof key === 'number' || typeof key === 'symbol')
        ? key
        : defaultCacheConfig.generateKey(config);
    };
  }
  return function generateKey(config: AxiosRequestConfig) {
    return defaultCacheConfig.generateKey(config);
  };
}

function normalizeCacheConfig(cacheConfig: CacheConfig | boolean | unknown): Required<CacheConfig> | false {
  // 所有不规范的配置，都不进行缓存
  if (!cacheConfig || (typeof cacheConfig !== 'boolean' && typeof cacheConfig !== 'object')) {
    return false;
  }

  if (typeof cacheConfig === 'boolean') {
    return defaultCacheConfig;
  }

  const config = cacheConfig as CacheConfig;

  let ttl = Number(config.ttl);
  ttl = Number.isNaN(ttl) ? defaultCacheConfig.ttl : Math.min(Math.max(ttl, 300), 5000);

  return {
    ttl,
    forceRefresh: !!config.forceRefresh,
    shouldCache: normalizeShouldCache(config.shouldCache),
    generateKey: normalizeGenerateKey(config.generateKey),
  };
}

export function createCacheRequestInterceptor(cacheStore: CacheStore) {
  return async function cacheRequestInterceptor(config: InternalAxiosRequestConfig) {
    // 如果配置中没有 cacheConfig，则不进行缓存
    if (!Reflect.has(config, 'cacheConfig')) {
      return config;
    }

    const cacheConfig = normalizeCacheConfig(config.cacheConfig) as Required<CacheConfigInternal>;

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
    config.cacheConfig = cacheConfig;

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
