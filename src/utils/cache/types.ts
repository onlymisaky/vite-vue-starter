export interface CacheOptions {
  expires?: number // 全局默认过期时间，单位毫秒
}

export interface DefaultCacheOptions extends Required<CacheOptions> {}

// 将所有方法都设计为异步，支持未来扩展（比如：IndexedDB）
export interface CacheStore {
  get: <T = any>(key: string) => Promise<T | undefined>
  set: <T = any>(key: string, value: T, expires?: number) => Promise<boolean>
  delete: (key: string) => Promise<boolean>
  clear: () => Promise<boolean>
  has: (key: string) => Promise<boolean>
}
