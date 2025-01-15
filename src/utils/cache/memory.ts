import type { CacheOptions, CacheStore } from './types';
import { DEFAULT_CACHE_OPTIONS } from './index';

interface CacheItem<T = any> {
  data: T
  expires: number
}

// 内存缓存实现
export class MemoryStore implements CacheStore {
  private cache = new Map<string, CacheItem>();
  private expires: number;

  constructor(options: CacheOptions = DEFAULT_CACHE_OPTIONS) {
    this.expires = options.expires ?? DEFAULT_CACHE_OPTIONS.expires;
  }

  private isExpired(expires: number): boolean {
    return Date.now() > expires;
  }

  removeExpired(): void {
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item.expires)) {
        this.cache.delete(key);
      }
    }
  }

  async get<T = any>(key: string): Promise<T | undefined> {
    const item = this.cache.get(key);
    if (!item)
      return undefined;

    if (this.isExpired(item.expires)) {
      this.cache.delete(key);
      return undefined;
    }

    return item.data as T;
  }

  async set<T = any>(key: string, value: T, expires?: number): Promise<boolean> {
    try {
      const expiresTime = Date.now() + (expires ?? this.expires);
      this.cache.set(key, {
        data: value,
        expires: expiresTime,
      });
      return true;
    }
    catch {
      return false;
    }
  }

  async delete(key: string): Promise<boolean> {
    try {
      this.cache.delete(key);
      return true;
    }
    catch {
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      this.cache.clear();
      return true;
    }
    catch {
      return false;
    }
  }

  async has(key: string): Promise<boolean> {
    const item = await this.get(key);
    return !!item;
  }
}
