import type { InternalCacheConfig } from './types';

// Axios 内部通过 Object.keys 遍历配置对象，所以这里不能使用 Symbol 作为 key
export const KEY_CACHE_CONFIG = '__CACHE_CONFIG__';
export const KEY_PROCESSED_CACHE_CONFIG = '__PROCESSED_CACHE_CONFIG__';

export const DEFAULT_CACHE_CONFIG: InternalCacheConfig = {
  shouldCache: [
    (config) => {
      return `${config.method}`.toUpperCase() === 'GET';
    },
    (response) => {
      return response.status >= 200 && response.status < 300;
    },
  ],
  generateKey: (config) => {
    const { method, baseURL, url, params } = config;
    let cacheKey = method ? `${method.toUpperCase()}:` : '';
    if (baseURL) {
      cacheKey += `${baseURL}`;
    }
    if (url) {
      const cacheKeyLastChar = cacheKey.slice(-1);
      const urlFirstChar = url.slice(0, 1);
      if (cacheKeyLastChar !== '/' && urlFirstChar !== '/') {
        cacheKey += '/';
      }
      cacheKey += url;
    }
    if (params && typeof params === 'object') {
      cacheKey += `?${new URLSearchParams(params).toString()}`;
    }
    // 将所有 headers 都包含在缓存键中会导致缓存命中率大幅降低。
    // 某些 headers（如 Authorization 、 User-Agent 、 Date 等）可能会动态变化，但不会影响响应内容。
    // if (headers && typeof headers === 'object') {
    //   let headersStr = '';
    //   for (const key in headers) {
    //     headersStr += `${key}:${headers[key]};`;
    //   }
    //   if (headersStr) {
    //     cacheKey += `<headers>${headersStr}</headers>`;
    //   }
    // }
    if (Reflect.has(config, 'data') && config.data !== undefined && config.data !== null) {
      cacheKey += `<data>${JSON.stringify(config.data)}</data>`;
    }
    return cacheKey;
  },
  storage: 'memory',
  ttl: 5 * 60 * 1000, // 5分钟
};
