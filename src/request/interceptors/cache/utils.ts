import type { AxiosRequestConfig } from 'axios';
import type { CacheConfig } from './types';
import { DEFAULT_CACHE_CONFIG } from './constants';

export function normalizeShouldCache(fn: CacheConfig['shouldCache']): Required<CacheConfig>['shouldCache'] {
  if (typeof fn === 'function') {
    return function shouldCache(config: AxiosRequestConfig) {
      return !!(fn!(config));
    };
  }
  return function shouldCache(_config: AxiosRequestConfig) {
    return DEFAULT_CACHE_CONFIG.shouldCache(_config);
  };
}

export function normalizeGenerateKey(fn: CacheConfig['generateKey']): Required<CacheConfig>['generateKey'] {
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

export function normalizeCacheConfig(cacheConfig: CacheConfig | boolean | unknown): Required<CacheConfig> | false {
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
