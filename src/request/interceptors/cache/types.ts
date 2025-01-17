import type { AxiosRequestConfig } from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    cacheConfig?: CacheConfig | boolean
  }
}

// 暴露给外部使用的配置
export interface CacheConfig {
  // 缓存时间（毫秒）
  ttl?: number
  // 缓存键生成函数
  generateKey?: (config: AxiosRequestConfig) => string
  // 自定义缓存条件
  shouldCache?: (config: AxiosRequestConfig) => boolean
  // 强制刷新缓存
  forceRefresh?: boolean
}

// 内部使用的配置
// 根据 generateKey 生成 cacheKey
// 根据 shouldCache 生成 enabled
export interface CacheConfigInternal extends CacheConfig {
  enabled: boolean
  cacheKey: string
}
