import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import type { CacheConfig, InternalCacheConfig } from './types';
import { isNumberLike, normalizeNumber, normalizeShouldDo } from '../utils';
import { DEFAULT_CACHE_CONFIG, KEY_CACHE_CONFIG } from './constants';

function normalizeShouldCache(fns: CacheConfig['shouldCache'], defaultFns: InternalCacheConfig['shouldCache']): InternalCacheConfig['shouldCache'] {
  // 类型错误时，使用默认值
  if (!Array.isArray(fns)) {
    return DEFAULT_CACHE_CONFIG.shouldCache;
  }

  const [requestShouldCache, responseShouldCache] = fns;

  // TODO: 类型 ShouldDo 需要改进
  return [
    normalizeShouldDo<'fulfilled'>(requestShouldCache, defaultFns[0]) as InternalCacheConfig['shouldCache'][0],
    normalizeShouldDo<'fulfilled'>(responseShouldCache, defaultFns[1]),
  ];
}

function normalizeGenerateKey(fn: CacheConfig['generateKey'], defaultFn: InternalCacheConfig['generateKey']): InternalCacheConfig['generateKey'] {
  if (typeof fn === 'function') {
    return function generateKey(config: AxiosRequestConfig) {
      const key = fn!(config);
      return ((typeof key === 'string' && key.trim().length > 0) || typeof key === 'number')
        ? key
        : defaultFn(config);
    };
  }
  return defaultFn;
}

function normalizeTtl(ttl: CacheConfig['ttl'], defaultTtl: InternalCacheConfig['ttl']): InternalCacheConfig['ttl'] {
  return normalizeNumber(ttl, {
    defaultValue: defaultTtl,
    min: 0,
  });
}

export function normalizeCacheConfig(cacheConfig: CacheConfig, defaultConfig: InternalCacheConfig = DEFAULT_CACHE_CONFIG): InternalCacheConfig {
  // 传入非对象时，视为不开启缓存，其余字段使用默认值
  if (!cacheConfig || typeof cacheConfig !== 'object') {
    return {
      ...defaultConfig,
      shouldCache: [(_config) => false, (_response) => false],
    };
  }

  // TS 类型断言
  const config = cacheConfig as CacheConfig;

  const ttl = normalizeTtl(config.ttl, defaultConfig.ttl);

  let storage = config.storage as InternalCacheConfig['storage'];
  if (!['memory', 'localStorage', 'sessionStorage'].includes(storage)) {
    storage = defaultConfig.storage;
  }

  return {
    ttl,
    storage,
    shouldCache: normalizeShouldCache(config.shouldCache, defaultConfig.shouldCache),
    generateKey: normalizeGenerateKey(config.generateKey, defaultConfig.generateKey),
  };
}

export function getCacheConfig(requestConfig: InternalAxiosRequestConfig, globalCacheConfig: InternalCacheConfig): InternalCacheConfig | false {
  // 如果请求配置中没有缓存，使用全局配置
  if (!Reflect.has(requestConfig, KEY_CACHE_CONFIG)) {
    return {
      ...globalCacheConfig,
    };
  }

  const requestCacheConfig = requestConfig[KEY_CACHE_CONFIG];

  // 如果缓存配置是数字，视为 ttl
  if (isNumberLike(requestCacheConfig)) {
    return {
      ...globalCacheConfig,
      ttl: normalizeTtl(requestCacheConfig as number, globalCacheConfig.ttl),
    };
  }

  if (requestCacheConfig === 'delete' || requestCacheConfig === 'refresh') {
    return {
      ...globalCacheConfig,
      cacheAction: requestCacheConfig,
    };
  }

  if (typeof requestCacheConfig === 'boolean') {
    if (requestCacheConfig) {
      return {
        ...globalCacheConfig,
        shouldCache: [(_config) => true, (_response) => true],
      };
    }
    return false;
  }

  // 不是对象或null
  if (!requestCacheConfig || typeof requestCacheConfig !== 'object') {
    return false;
  }

  const cacheConfig = {
    ...globalCacheConfig,
  };

  if (Reflect.has(requestCacheConfig, 'ttl')) {
    cacheConfig.ttl = normalizeTtl(
      requestCacheConfig.ttl,
      globalCacheConfig.ttl,
    );
  }

  if (Reflect.has(requestCacheConfig, 'shouldCache')) {
    cacheConfig.shouldCache = normalizeShouldCache(
      requestCacheConfig.shouldCache,
      globalCacheConfig.shouldCache,
    );
  }

  if (Reflect.has(requestCacheConfig, 'generateKey')) {
    cacheConfig.generateKey = normalizeGenerateKey(
      requestCacheConfig.generateKey,
      globalCacheConfig.generateKey,
    );
  }

  return cacheConfig;
}
