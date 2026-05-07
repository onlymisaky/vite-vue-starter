# Cache Interceptor 使用文档

## 概述

`CacheInterceptor` 是一个基于 Axios 拦截器实现的请求缓存方案，支持内存、localStorage、sessionStorage 三种存储方式。

## 初始化

在创建 Axios 实例时，通过 `createCacheInterceptor` 创建拦截器：

```ts
import { createCacheInterceptor } from './interceptors';

const interceptor = createCacheInterceptor({
  ttl: 5 * 60 * 1000, // 缓存时间，默认 5 分钟
  storage: 'memory', // 存储方式，默认 memory
  shouldCache: [
    (config) => config.method === 'GET', // 请求拦截器中判断
    (response) => response.status >= 200 && response.status < 300, // 响应拦截器中判断
  ],
  generateKey: (config) => `custom:${config.url}`, // 自定义缓存键生成
});
```

## 请求配置

在每个请求中通过 `__CACHE_CONFIG__` 配置该请求的缓存行为：

### 基础用法

```ts
// 使用全局默认配置
request.get('/api/users', {
  __CACHE_CONFIG__: true,
});

// 禁用缓存
request.get('/api/users', {
  __CACHE_CONFIG__: false,
});

// 设置缓存时间（毫秒）
request.get('/api/users', {
  __CACHE_CONFIG__: 10 * 60 * 1000, // 10 分钟
});

// 字符串数字也支持
request.get('/api/users', {
  __CACHE_CONFIG__: '600000',
});
```

### 缓存动作

```ts
// delete: 清除缓存，请求成功后也不会缓存响应数据
request.delete('/api/users/1', {
  __CACHE_CONFIG__: 'delete',
});

// refresh: 清除缓存，请求成功后会缓存响应数据
request.put('/api/users/1', { name: 'new name' }, {
  __CACHE_CONFIG__: 'refresh',
});
```

### 详细配置

```ts
request.get('/api/users', {
  __CACHE_CONFIG__: {
    ttl: 10 * 60 * 1000, // 缓存时间（毫秒）
    storage: 'localStorage', // 存储方式
    shouldCache: [
      (config) => true, // 请求是否应该缓存
      (response) => true, // 响应是否应该缓存
    ],
    generateKey: (config) => {
      return `${config.method}:${config.url}`;
    },
  },
});
```

## 全局配置 vs 请求配置

| 配置项 | 全局配置 | 请求配置 | 说明 |
|--------|----------|----------|------|
| `ttl` | 默认 5 分钟 | 可覆盖 | 缓存有效期 |
| `storage` | 默认 memory | 可覆盖 | 存储方式 |
| `shouldCache[0]` | 默认 GET 请求 | 可覆盖 | 请求级缓存条件 |
| `shouldCache[1]` | 默认 2xx 响应 | 可覆盖 | 响应级缓存条件 |
| `generateKey` | 默认格式 | 可覆盖 | 缓存键生成函数 |
| `cacheAction` | 不支持 | 支持 | delete / refresh |

## 缓存键生成

### 默认格式

```
GET:/baseURL/url?params<data>JSON.stringify(data)</data>
```

示例：
```
GET:https://api.example.com/users?id=1&id=2<data>{}</data>
```

### 自定义缓存键

```ts
request.get('/api/users', {
  __CACHE_CONFIG__: {
    generateKey: (config) => {
      // 包含所有影响响应的参数
      return `users:${config.url}:${JSON.stringify(config.params)}`;
    },
  },
});
```

## 存储方式

| 方式 | 说明 | 适用场景 |
|------|------|----------|
| `memory` | 内存存储，页面刷新后失效 | 临时数据、频繁变化的数据 |
| `localStorage` | 持久化存储 | 长期缓存、跨会话数据 |
| `sessionStorage` | 会话级存储 | 单会话内的临时数据 |

## 注意事项

1. **缓存条件**
   - `shouldCache[0]` 返回 `false` 时：不读缓存，不写缓存
   - `shouldCache[1]` 返回 `false` 时：不写缓存，但仍会读取现有缓存
   - 无论 `shouldCache` 如何配置，只有 `status >= 200 && < 300` 的响应才会被缓存

2. **缓存键冲突**
   - 确保 `generateKey` 生成唯一键
   - 包含所有影响响应的参数（URL、params、data）

3. **TTL 为 0**
   - 设置 `ttl: 0` 时：不读缓存，不写缓存

4. **存储容量**
   - localStorage/sessionStorage 有容量限制（约 5MB）
   - 大数据量建议使用 memory 模式

5. **数据序列化**
   - localStorage/sessionStorage 只能存储字符串
   - `geed-storage` 会自动处理序列化

## 完整示例

```ts
import { createCacheInterceptor } from '@/request/interceptors';

// 初始化全局缓存配置
const [requestInterceptor, responseInterceptor] = createCacheInterceptor({
  ttl: 5 * 60 * 1000,
  storage: 'memory',
  shouldCache: [
    (config) => config.method === 'GET',
    (response) => response.status >= 200 && response.status < 300,
  ],
});

// 获取用户列表（使用缓存）
const users = await request.get('/api/users');

// 获取单个用户（强制刷新）
const user = await request.get('/api/users/1', {
  __CACHE_CONFIG__: 'refresh',
});

// 创建用户后清除列表缓存
await request.post('/api/users', { name: 'new' }, {
  __CACHE_CONFIG__: 'delete',
});

// 列表页使用本地存储缓存
const list = await request.get('/api/users', {
  __CACHE_CONFIG__: {
    ttl: 30 * 60 * 1000,
    storage: 'localStorage',
  },
});
```
