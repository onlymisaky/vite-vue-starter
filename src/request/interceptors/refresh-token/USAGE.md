# Refresh Token 拦截器 — 使用文档

Axios 响应拦截器，在 access token 过期时自动刷新 token 并透明重试请求，业务层无感知。

## 快速开始

```ts
import { createRefreshTokenResponseInterceptor } from './interceptors';

const [onFulfilled, onRejected] = createRefreshTokenResponseInterceptor({
  // 调用刷新接口，返回新的 access token
  refreshApi: (refreshToken) =>
    axios.post('/auth/refresh-token', { refreshToken }).then((res) => res.data.data),
  // 存储新的 access token
  setAccessToken: (token) => localStorage.setItem('accessToken', token),
  // 获取当前 refresh token
  getRefreshToken: () => localStorage.getItem('refreshToken') || '',
  // 将新 token 写入请求头，用于重试
  setRequestConfig: (config, { accessToken }) => {
    config.headers!.Authorization = `Bearer ${accessToken}`;
  },
  // 至少配置 fulfilled 或 rejected 中的一个
  rejected: {
    shouldRefresh: (error) => error.response?.status === 401,
  },
});

axiosInstance.interceptors.response.use(onFulfilled, onRejected);
```

## 配置项

### `RefreshTokenConfig<R, D, H>`

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `refreshApi` | `(refreshToken: string) => Promise<string>` | 是 | 调用刷新接口，接收 refresh token，返回新的 access token |
| `getRefreshToken` | `() => string` | 是 | 获取当前 refresh token |
| `setAccessToken` | `(token: string) => void` | 否 | 存储新获取的 access token |
| `clearAccessToken` | `() => void` | 否 | 刷新失败时清除 access token |
| `clearRefreshToken` | `() => void` | 否 | 刷新失败时清除 refresh token |
| `setRequestConfig` | `(config, { refreshToken, accessToken }) => void` | 否 | 将新 token 设置到请求配置中（通常是 headers），用于重试原始请求 |
| `fulfilled` | `InterceptorConfig<'fulfilled'>` | 否* | fulfilled 拦截器配置 |
| `rejected` | `InterceptorConfig<'rejected'>` | 否* | rejected 拦截器配置 |

> \* `fulfilled` 和 `rejected` 至少需要配置一个（内部包含 `shouldRefresh`），否则拦截器不会生效。

### `InterceptorConfig<T>`

| 字段 | 类型 | 说明 |
|------|------|------|
| `shouldRefresh` | fulfilled 时: `(response: AxiosResponse) => boolean`<br/>rejected 时: `(error: AxiosError) => boolean` | 判断当前响应/错误是否需要刷新 token |

### 泛型参数

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `R` | 响应数据类型 (`AxiosResponse<R>`) | `any` |
| `D` | 请求数据类型 | `any` |
| `H` | 请求头类型 | `Record<string, any>` |

传入泛型后，`shouldRefresh` 的参数类型会自动收窄：

```ts
createRefreshTokenResponseInterceptor<ApiResponse>({
  fulfilled: {
    // response 类型为 AxiosResponse<ApiResponse>
    shouldRefresh: (response) => response.data.status === 401,
  },
  // ...
});
```

## fulfilled vs rejected：该配哪个？

这取决于后端对 token 过期的 HTTP 状态码设计：

| 后端行为 | 该配置 | `shouldRefresh` 判断依据 |
|----------|--------|--------------------------|
| token 过期返回 HTTP 200，在响应体中标记错误（如 `data.status === 401`） | `fulfilled` | `response.data.status === 401` |
| token 过期返回 HTTP 401 | `rejected` | `error.response?.status === 401` |
| 两种都可能出现（混合模式） | 同时配置 `fulfilled` 和 `rejected` | 各自判断 |
| 都不配置 | — | 拦截器不会生效 |

> 这与 Axios 实例的 `validateStatus` 配置密切相关。当 `validateStatus` 对 401 返回 `true` 时走 fulfilled，返回 `false` 时走 rejected。

## 完整配置示例

以下是项目中的实际用法（摘自 `src/request/instance.ts`）：

```ts
const [refreshFulfilled, refreshRejected] = createRefreshTokenResponseInterceptor<ApiResponse>({
  refreshApi: (refreshToken) => {
    return requestWithAbort
      .post<ApiResponse<string>>('/auth/refresh-token', { refreshToken })
      .then((res) => res.data.data);
  },
  setAccessToken: (token) => localStorage.setItem('accessToken', token),
  getRefreshToken: () => localStorage.getItem('refreshToken') || '',
  fulfilled: {
    shouldRefresh: (response) => {
      // 排除刷新接口本身，避免循环
      if (response.config?.url === '/auth/refresh-token') {
        return false;
      }
      return response.data.status === 401;
    },
  },
  rejected: {
    shouldRefresh: (error) => {
      if (error.config?.url === '/auth/refresh-token') {
        return false;
      }
      return error.response?.status === 401;
    },
  },
  setRequestConfig(config, { accessToken }) {
    config.headers!.Authorization = `Bearer ${accessToken}`;
  },
});

// 注册到 Axios 实例（注意顺序）
axiosInstance.interceptors.response.use(refreshFulfilled, refreshRejected);
```

## 注意事项

### 必须排除刷新接口本身

在 `shouldRefresh` 中**必须**排除刷新 token 的接口 URL，否则刷新失败时会无限递归：

```ts
const rejectedConfig = {
  shouldRefresh: (response) => {
    if (response.config?.url === '/auth/refresh-token') {
      return false; // 关键：排除自身
    }
    return response.data.status === 401;
  },
};
```

### 拦截器注册顺序

Refresh token 拦截器应注册在 **retry（重试）拦截器之前**、**cache（缓存）拦截器之后**，确保：
- 401 错误不会被 retry 拦截器重试
- 缓存命中的请求不需要经过 token 刷新

```
请求 → [cache] → 服务端
响应 → [refresh-token] → [retry] → [business] → [cache] → [error]
```

### 返回值

`createRefreshTokenResponseInterceptor` 返回一个元组 `[onFulfilled, onRejected]`：
- 如果只配置了 `fulfilled`，`onRejected` 为 `null`
- 如果只配置了 `rejected`，`onFulfilled` 为 `null`
- 传入 `response.use()` 时 `null` 会被 Axios 忽略，不影响使用

### 并发请求

多个请求同时触发 token 刷新时，只会发起一次刷新调用。其余请求会进入队列等待，刷新完成后自动用新 token 重试所有排队请求。

### 防御性设计

- `refreshApi` 抛出异常不会导致请求链中断，会被内部 try-catch 捕获并按"刷新失败"处理
- `getRefreshToken` 返回非字符串或抛出异常时同理
- 未配置的可选函数（如 `clearAccessToken`）会被替换为空函数，不会报错
