import type { CacheOptions, DefaultCacheOptions } from './types';
import { MemoryStore } from './memory';

export * from './memory';
export * from './types';

export interface CreateCacheStoreOptions extends CacheOptions {
  type: 'memory'
}

// 默认配置
export const DEFAULT_CACHE_OPTIONS: DefaultCacheOptions = {
  expires: 1000 * 60 * 60 * 24, // 默认24小时
};

// 合并配置
function mergeOptions(options: CreateCacheStoreOptions): CreateCacheStoreOptions {
  return {
    ...DEFAULT_CACHE_OPTIONS,
    ...options,
  };
}

interface CacheTypeMap {
  memory: MemoryStore
}

export function createCacheStore(options: CreateCacheStoreOptions = { type: 'memory' }): CacheTypeMap[keyof CacheTypeMap] {
  const mergedOptions = mergeOptions(options);

  if (mergedOptions.type === 'memory') {
    return new MemoryStore(mergedOptions);
  }
  throw new Error('Invalid cache store type');
}
