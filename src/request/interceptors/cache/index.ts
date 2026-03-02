import type { AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import type GeedStorage from 'geed-storage';
import type { RequestInterceptor, ResponseInterceptor } from '../types';
import type { CacheConfig, InternalCacheConfig, ProcessedCacheConfig } from './types';
import { validateAxiosResponse } from '../utils';
import { createAdapter } from './adapter';
import { KEY_FROM_CACHE, KEY_PROCESSED_CACHE_CONFIG } from './constants';
import { getStorage } from './storage';
import { getCacheConfig, normalizeCacheConfig } from './utils';

class CacheInterceptor {
  private storage!: GeedStorage;

  private globalCacheConfig!: InternalCacheConfig;

  constructor(config: CacheConfig) {
    this.globalCacheConfig = normalizeCacheConfig(config);
    this.storage = getStorage(this.globalCacheConfig.storage);
  }

  requestFulfilledInterceptor(config: InternalAxiosRequestConfig) {
    if (!config || typeof config !== 'object' || (!config.baseURL && !config.url) || !config.method) {
      return config;
    }

    const cacheConfig = getCacheConfig(config, this.globalCacheConfig);

    // 缓存配置为 false 时，不读缓存，不写缓存
    if (cacheConfig === false) {
      return config;
    }

    // delete 和 refresh 操作时，不使用缓存数据
    if (cacheConfig.cacheAction === 'delete' || cacheConfig.cacheAction === 'refresh') {
      const cacheKey = cacheConfig.generateKey(config);
      if (this.storage.has(cacheKey)) {
        this.storage.remove(cacheKey);
      }
      // refresh 操作时，需要写缓存，所以需要设置 CACHE_KEY
      if (cacheConfig.cacheAction === 'refresh') {
        config[KEY_PROCESSED_CACHE_CONFIG] = {
          ttl: cacheConfig.ttl,
          cacheKey,
          shouldCache: cacheConfig.shouldCache[1],
          storage: cacheConfig.storage,
        };
      }
      return config;
    }

    // ttl 为 0 时，不读缓存，不写缓存
    if (cacheConfig.ttl === 0) {
      return config;
    }

    const requestShouldCache = cacheConfig.shouldCache[0];
    // requestShouldCache 为 false 时，不读缓存，不写缓存
    if (!requestShouldCache(config)) {
      return config;
    }

    const cacheKey = cacheConfig.generateKey(config);

    if (!this.storage.has(cacheKey)) {
      config[KEY_PROCESSED_CACHE_CONFIG] = {
        ttl: cacheConfig.ttl,
        cacheKey,
        shouldCache: cacheConfig.shouldCache[1],
        storage: cacheConfig.storage,
      };
      return config;
    }

    const cacheData = this.storage.get<AxiosResponse>(cacheKey);

    const responseShouldCache = cacheConfig.shouldCache[1];
    // responseShouldCache 为 false 时，不使用缓存，不写缓存
    if (!responseShouldCache(cacheData!)) {
      return config;
    }

    config[KEY_PROCESSED_CACHE_CONFIG] = {
      ttl: cacheConfig.ttl,
      cacheKey,
      shouldCache: cacheConfig.shouldCache[1],
      storage: cacheConfig.storage,
    };
    config.adapter = createAdapter(cacheData!);

    return config;
  };

  responseFulfilledInterceptor(response: AxiosResponse) {
    if (!validateAxiosResponse(response)) {
      return response;
    }

    // 确保只缓存成功响应
    if (response.status < 200 || response.status >= 300) {
      return response;
    }

    const requestConfig = response.config as InternalAxiosRequestConfig;

    // 如果请求配置中没有 PROCESSED_CACHE_CONFIG，说明不需要缓存，直接返回
    if (!Reflect.has(requestConfig, KEY_PROCESSED_CACHE_CONFIG)) {
      return response;
    }

    const processedCacheConfig = requestConfig[KEY_PROCESSED_CACHE_CONFIG] as ProcessedCacheConfig;

    const responseShouldCache = processedCacheConfig.shouldCache;
    if (!responseShouldCache(response)) {
      return response;
    }

    // 如果响应中已经有 FROM_CACHE 标志，说明是从缓存中读取的，直接返回·
    if (response[KEY_FROM_CACHE]) {
      return response;
    }

    const cacheKey = processedCacheConfig.cacheKey;

    const storage = getStorage(processedCacheConfig.storage);
    // 缓存响应数据
    storage.set(cacheKey, response, { expires: processedCacheConfig.ttl });

    return response;
  };
}

export function createCacheInterceptor<R = any, D = any, H = Record<string, any>>(config: CacheConfig<R, D, H>) {
  const interceptor = new CacheInterceptor(config as CacheConfig);

  return [
    interceptor.requestFulfilledInterceptor.bind(interceptor),
    interceptor.responseFulfilledInterceptor.bind(interceptor),
  ] as [
    RequestInterceptor<'fulfilled'>,
    ResponseInterceptor<'fulfilled'>,
  ];
}

/**
 * 对请求结果进行缓存更适合通过高阶函数实现，
 * 因为缓存本质上是对函数执行结果进行缓存，
 * 如果用拦截器实现，则需要判断请求之间的"相同性"，
 * 所以这里通过 generateKey 生成缓存键，
 * 而如果通过高阶函数实现，直接对函数执行结果进行缓存，
 * 当然前提是函数没有参数的，
 * 如果函数有参数，将参数作为缓存的 key， (如何判断两次参数是否相同，这又是另一个问题了)
 * 同样还有其它很多和请求相关的高级功能要考虑到"相同性"问题，例如
 * - 缓存
 * - 防抖
 * - 节流
 * - 请求合并
 * - 请求去重
 * - 并发控制
 * - 请求队列
 * 等等
 * 这些功能都不建议在拦截器中实现
 */
