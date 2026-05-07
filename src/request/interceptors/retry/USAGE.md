# Retry Interceptor 使用文档

Axios 响应拦截器，在请求失败时自动重试，支持 fulfilled/rejected 双通道、自定义重试条件和动态延迟策略。

## 快速开始

```ts
import { createRetryResponseInterceptor } from './interceptors';

const [onFulfilled, onRejected] = createRetryResponseInterceptor({
  count: 3, // 最大重试次数
  interval: 500, // 重试间隔（毫秒）
  rejected: {
    shouldRetry: (error) => {
      // 排除 401（由 refresh-token 拦截器处理）
      if (error.response?.status === 401)
        return false;
      return error.response != null && error.response.status >= 400;
    },
  },
});

axiosInstance.interceptors.response.use(onFulfilled, onRejected);
```

## 配置项

### `RetryConfig<R, D, H>`

| 字段 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `count` | `number` | `3` | 最大重试次数，范围 0–10 |
| `interval` | `number \| ((retriesCount: number) => number)` | `500` | 重试间隔（毫秒），范围 300–5000；也可传入函数按重试次数动态计算 |
| `fulfilled` | `{ shouldRetry?: ShouldDo<'fulfilled'> }` | `() => false` | 对进入 fulfilled 拦截器的响应判断是否重试 |
| `rejected` | `{ shouldRetry?: ShouldDo<'rejected'> }` | `() => true` | 对进入 rejected 拦截器的错误判断是否重试 |

### 泛型参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `R` | 响应数据类型 (`AxiosResponse<R>`) | `any` |
| `D` | 请求数据类型 | `any` |
| `H` | 请求头类型 | `Record<string, any>` |

传入泛型后，`shouldRetry` 的参数类型会自动收窄：

```ts
createRetryResponseInterceptor<ApiResponse>({
  fulfilled: {
    // response 类型为 AxiosResponse<ApiResponse>
    shouldRetry: (response) => response.data.success === false,
  },
});
```

## 请求级配置

在每个请求中通过 `__RETRY_CONFIG__` 覆盖全局配置：

### 基础用法

```ts
// 仅设置重试次数（其他配置继承全局）
request.get('/api/users', {
  __RETRY_CONFIG__: 5,
});

// 字符串数字也支持
request.get('/api/users', {
  __RETRY_CONFIG__: '5',
});

// 禁用重试
request.get('/api/users', {
  __RETRY_CONFIG__: false,
});
```

### 详细配置

```ts
request.get('/api/users', {
  __RETRY_CONFIG__: {
    count: 5,
    interval: (retriesCount) => Math.min(1000 * 2 ** retriesCount, 5000),
    rejected: {
      shouldRetry: (error) => error.response?.status === 503,
    },
  },
});
```

## 全局配置 vs 请求配置

| 配置项 | 全局配置 | 请求配置 | 说明 |
|--------|----------|----------|------|
| `count` | 默认 3 | 可覆盖 | 最大重试次数 |
| `interval` | 默认 500ms | 可覆盖 | 重试间隔 |
| `fulfilled.shouldRetry` | 默认 `false` | 可覆盖 | fulfilled 重试条件 |
| `rejected.shouldRetry` | 默认 `true` | 可覆盖 | rejected 重试条件 |
| `__RETRY_CONFIG__: number` | — | 仅覆盖 count | 其余继承全局 |
| `__RETRY_CONFIG__: false` | — | 禁用重试 | 当前请求不重试 |

## fulfilled vs rejected：该配哪个？

这取决于 Axios 实例的 `validateStatus` 配置，它决定了哪些 HTTP 状态码进入 fulfilled、哪些进入 rejected：

| 后端行为 | 该配置 | `shouldRetry` 判断依据 |
|----------|--------|------------------------|
| 所有状态码都返回 200（`validateStatus: () => true`），在响应体中标记失败 | `fulfilled` | `response.data.success === false` |
| 仅 2xx 为成功（默认 `validateStatus`），错误返回 4xx/5xx | `rejected` | `error.response?.status >= 500` |
| 混合模式 | 同时配置 `fulfilled` 和 `rejected` | 各自判断 |

> **注意**：`fulfilled.shouldRetry` 默认为 `false`（不重试），`rejected.shouldRetry` 默认为 `true`（重试所有错误）。如果只需要重试 rejected 错误，不需要配置 `fulfilled`。

## 延迟策略

### 固定间隔

```ts
createRetryResponseInterceptor({
  interval: 1000, // 每次重试间隔 1 秒
});
```

### 指数退避

```ts
createRetryResponseInterceptor({
  interval: (retriesCount) => Math.min(1000 * 2 ** retriesCount, 5000),
  // 第 1 次: 1000ms, 第 2 次: 2000ms, 第 3 次: 4000ms（上限 5000ms）
});
```

### 线性递增

```ts
createRetryResponseInterceptor({
  interval: (retriesCount) => 500 + retriesCount * 300,
  // 第 1 次: 500ms, 第 2 次: 800ms, 第 3 次: 1100ms
});
```

> 无论传入何值，`interval` 的返回值始终被限制在 300ms–5000ms 范围内。

## 完整示例

以下是项目中的实际用法（摘自 `src/request/instance.ts`）：

```ts
const [retryFulfilled, retryRejected] = createRetryResponseInterceptor<ApiResponse>({
  rejected: {
    shouldRetry: (error) => {
      // 排除刷新 token 接口
      if (error.config?.url === '/auth/refresh-token') {
        return false;
      }
      // 排除 401（由 refresh-token 拦截器处理）
      if (error.response && error.response.status >= 400 && error.response.status !== 401) {
        return true;
      }
      return false;
    },
  },
});

// 注册到 Axios 实例（注意顺序）
axiosInstance.interceptors.response.use(retryFulfilled, retryRejected);
```

## 注意事项

### 被取消的请求不会重试

通过 `AbortController` 取消的请求（`signal.aborted === true`）会直接跳过重试：

```ts
const controller = new AbortController();

request.get('/api/data', {
  signal: controller.signal,
  __RETRY_CONFIG__: { count: 3 },
});

// 取消后不会重试
controller.abort();
```

### 重试等待期间也可取消

在重试间隔的等待时间内，如果 `AbortSignal` 触发了 `abort` 事件，会立即中断等待并返回 `ERR_CANCELED` 错误：

```ts
const controller = new AbortController();
const promise = request.get('/api/data', { signal: controller.signal });

// 即使正在等待重试间隔，也会立即取消
setTimeout(() => controller.abort(), 200);
```

### 重试使用临时 Axios 实例

重试请求通过 `axios.create()` 创建的临时实例发送，不会经过原始 Axios 实例上的拦截器链。这避免了拦截器循环调用，但也意味着重试请求不受 cache、refresh-token 等拦截器影响。

### 拦截器注册顺序

Retry 拦截器应注册在 **refresh-token 之后**、**business 之前**，确保：
- 401 错误优先由 refresh-token 拦截器处理，不会被重试
- 重试成功后的响应继续经过 business 拦截器处理

```
请求 → [cache] → 服务端
响应 → [refresh-token] → [retry] → [business] → [cache] → [error]
```

### 边界值

- `count`：最小 0（不重试），最大 10
- `interval`：最小 300ms，最大 5000ms
- 超出范围的值会被自动截断到边界
