import type { CacheConfig } from './types';

// Axios 内部通过 Object.keys 遍历配置对象，所以这里不能使用 Symbol 作为 key
export const CACHE_TAG = 'CACHE_TAG';

export const DEFAULT_CACHE_CONFIG: Required<CacheConfig> = {
  ttl: 5 * 60 * 1000, // 5分钟
  forceRefresh: false,
  shouldCache: (_config) => {
    return true;
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
