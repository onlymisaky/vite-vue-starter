# Cache Interceptor 技术设计文档

## 1. 概述

### 1.1 设计目标

提供一个轻量、可配置的 HTTP 请求缓存方案，基于 Axios 拦截器实现，支持多种存储后端和灵活的缓存策略。

### 1.2 设计原则

- **最小侵入**：通过 Axios 请求配置的元数据键注入，不影响原有请求结构
- **可组合性**：支持全局默认配置 + 请求级配置覆盖
- **双层判断**：请求级判断（是否读缓存）+ 响应级判断（是否写缓存）
- **零依赖**：除 `geed-storage` 外不引入额外依赖

## 2. 架构设计

### 2.1 组件结构

```
cache/
├── index.ts       # CacheInterceptor 类 & createCacheInterceptor 工厂函数
├── types.ts       # 类型定义（CacheConfig、InternalCacheConfig 等）
├── constants.ts   # 常量定义（KEY_CACHE_CONFIG、DEFAULT_CACHE_CONFIG 等）
├── storage.ts     # 存储层抽象（封装 geed-storage）
├── adapter.ts     # 适配器（从缓存返回响应的适配器函数）
└── utils.ts       # 工具函数（配置归一化、配置获取）
```

### 2.2 类图

```
CacheInterceptor
├── storage: GeedStorage
├── globalCacheConfig: InternalCacheConfig
├── requestFulfilledInterceptor()
└── responseFulfilledInterceptor()
```

### 2.3 数据流

```
请求发起
    │
    ▼
[请求拦截器] ──────────────────┐
    │                         │
    │ 判断 cacheConfig         │
    │                         │
    ├── false ────────────────┼──→ 继续发送请求
    │                         │
    ├── delete/refresh ───────┼──→ 清除缓存 ─→ 继续发送请求
    │                         │
    ├── ttl === 0 ────────────┼──→ 继续发送请求
    │                         │
    ├── shouldCache[0] false ──┼──→ 继续发送请求
    │                         │
    ├── 缓存不存在 ────────────┼──→ 继续发送请求
    │                         │
    ├── shouldCache[1] false ──┼──→ 继续发送请求
    │                         │
    └── 命中缓存 ──────────────┴──→ 使用缓存适配器
                                     │
                                     ▼
                              直接返回缓存数据
                                     │
                                     ▼
                              [响应拦截器] 跳过（不执行）


新响应到达
    │
    ▼
[响应拦截器]
    │
    ├── 非 AxiosResponse ──────┼──→ 直接返回
    │
    ├── status 非 2xx ─────────┼──→ 直接返回
    │
    ├── 无 PROCESSED_CACHE_CONFIG ─┼──→ 直接返回
    │
    ├── shouldCache[1] false ──┼──→ 直接返回
    │
    └── 满足条件 ───────────────┴──→ 写入缓存
```

## 3. 核心实现

### 3.1 类型定义

```ts
// 用户配置类型
interface CacheConfig<R, D, H> {
  shouldCache?: [
    (config: AxiosRequestConfig<D>) => boolean, // 请求级判断
    ((response: AxiosResponse<R, D, H>) => boolean)?, // 响应级判断
  ]
  generateKey?: (config: AxiosRequestConfig<D>) => string
  ttl?: number
  storage?: 'memory' | 'localStorage' | 'sessionStorage'
  cacheAction?: 'delete' | 'refresh'
}

// 处理后的配置（存储到请求配置中）
interface ProcessedCacheConfig<R, D, H> {
  ttl: number
  storage: 'memory' | 'localStorage' | 'sessionStorage'
  cacheKey: string
  shouldCache: (response: AxiosResponse<R, D, H>) => boolean
}
```

### 3.2 请求配置元数据键

使用非 Symbol 字符串键（`__CACHE_CONFIG__`）以便 Axios 内部能正确遍历：

```ts
export const KEY_CACHE_CONFIG = '__CACHE_CONFIG__';
export const KEY_PROCESSED_CACHE_CONFIG = '__PROCESSED_CACHE_CONFIG__';
```

### 3.3 配置归一化

```ts
function normalizeCacheConfig(cacheConfig: CacheConfig): InternalCacheConfig {
  return {
    ttl: normalizeNumber(ttl, { min: 0 }), // 限制最小值
    storage: validateStorage(storage),
    shouldCache: [
      normalizeShouldDo(requestShouldCache, defaultRequestShouldCache),
      normalizeShouldDo(responseShouldCache, defaultResponseShouldCache),
    ],
    generateKey: validateGenerateKey(generateKey),
  };
}
```

### 3.4 缓存键生成

```ts
const DEFAULT_CACHE_CONFIG = {
  generateKey: (config) => {
    let cacheKey = `${config.method?.toUpperCase()}:`;
    if (config.baseURL)
      cacheKey += config.baseURL;
    if (config.url)
      cacheKey += combineUrl(config.baseURL, config.url);
    if (config.params)
      cacheKey += `?${new URLSearchParams(config.params)}`;
    if (config.data)
      cacheKey += `<data>${JSON.stringify(config.data)}</data>`;
    return cacheKey;
  },
};
```

**注意**：headers 不包含在默认缓存键中，因为某些动态 headers（如 Authorization、User-Agent）会导致缓存命中率大幅降低。

### 3.5 缓存命中处理

当命中缓存时，使用自定义 adapter 直接返回缓存数据：

```ts
function createAdapter<T extends AxiosResponse>(cachedValue: T) {
  return function adapter(_config: InternalAxiosRequestConfig): AxiosPromise {
    return Promise.resolve({ ...cachedValue });
  };
}

// 使用
config.adapter = createAdapter(cacheData);
```

这样做的好处是：

- 请求被视为已完成
- 后续的响应拦截器不会执行
- 返回的数据结构与正常响应完全一致

### 3.6 存储层抽象

```ts
const lStorage = new GeedStorage({ mode: 'localStorage' });
const sStorage = new GeedStorage({ mode: 'sessionStorage' });
const mStorage = new GeedStorage({ mode: 'memory' });

export function getStorage(mode?: StorageMode) {
  switch (mode) {
    case 'localStorage': return lStorage;
    case 'sessionStorage': return sStorage;
    default: return mStorage;
  }
}
```

单例模式确保同一存储类型的操作指向同一个实例。

## 4. 设计决策

### 4.1 为什么用拦截器而非高阶函数

代码注释中有这样一段说明：

> 对请求结果进行缓存更适合通过高阶函数实现，因为缓存本质上是对函数执行结果进行缓存。如果用拦截器实现，则需要判断请求之间的"相同性"，所以这里通过 generateKey 生成缓存键。

但当前采用拦截器方案的原因是：

- 与现有 Axios 架构一致
- 配置方式与 retry、refresh-token 统一
- 请求级配置天然支持

### 4.2 为什么用非 Symbol 键

```ts
// Axios 内部通过 Object.keys 遍历配置对象，所以这里不能使用 Symbol 作为 key
export const KEY_CACHE_CONFIG = '__CACHE_CONFIG__';
```

### 4.3 为什么缓存 2xx 响应

```ts
// 确保只缓存成功响应
if (response.status < 200 || response.status >= 300) {
  return response;
}
```

无论 `shouldCache[1]` 如何配置，这个条件始终生效，确保不会缓存错误响应。

### 4.4 为什么 ttl 为 0 时不读缓存

```ts
if (cacheConfig.ttl === 0) {
  return config;
}
```

因为 `storage.set(cacheKey, response, { expires: 0 })` 会立即过期，设置 ttl: 0 的意图应该是"不使用缓存"。

## 5. 扩展性

### 5.1 自定义存储后端

可通过扩展 `storage.ts` 添加新的存储后端：

```ts
export function getStorage(mode?: StorageMode) {
  switch (mode) {
    // 添加新后端
    case 'redis':
      return getRedisStorage();
    default:
      return getMemoryStorage();
  }
}
```

### 5.2 自定义缓存策略

通过 `shouldCache` 数组实现复杂缓存策略：

```ts
// 只缓存用户可见的数据
shouldCache: [
  (config) => config.method === 'GET' && !config.params?.internal,
  (response) => response.status === 200,
];
```

## 6. 已知限制

1. **并发请求去重**：相同缓存键的并发请求不会合并
2. **跨标签页同步**：localStorage 模式下，多标签页间缓存不同步
3. **请求体大小**：localStorage/sessionStorage 有约 5MB 限制
4. **复杂参数比较**：URLSearchParams 顺序敏感，`?a=1&b=2` 和 `?b=2&a=1` 会生成不同的缓存键

## 7. 测试场景

| 场景                             | 预期行为           |
| ------------------------------ | -------------- |
| 首次 GET 请求                      | 发送请求，缓存响应      |
| 相同 GET 请求（缓存有效）                | 直接返回缓存数据       |
| 相同 GET 请求（缓存过期）                | 发送请求，更新缓存      |
| DELETE + cacheAction: 'delete' | 清除缓存，发送请求      |
| PUT + cacheAction: 'refresh'   | 清除缓存，发送请求，更新缓存 |
| POST 请求（默认不缓存）                 | 发送请求，不缓存       |
| 响应 status 500                  | 不缓存，直接返回       |
| ttl: 0                         | 不读缓存，不写缓存      |
| __CACHE\_CONFIG__: false       | 不读缓存，不写缓存      |
