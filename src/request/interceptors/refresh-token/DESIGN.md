# Refresh Token 拦截器 — 技术设计文档

## 设计目标

1. **无感刷新** — access token 过期时自动刷新并重试，业务层不感知中间过程
2. **并发安全** — 多个请求同时触发 401 时，只发起一次刷新，其余排队等待
3. **无痛插拔** — 不改变拦截器链的 promise 状态流转，可随时移除而不影响其他拦截器
4. **兼容双模式** — 同时支持 fulfilled 和 rejected 两种拦截入口，适配不同后端设计

## 模块结构

```
refresh-token/
├── index.ts    # RefreshTokenInterceptor 类 + createRefreshTokenResponseInterceptor 工厂函数
├── types.ts    # RefreshTokenConfig / InternalRefreshTokenConfig 类型定义
└── utils.ts    # normalizeRefreshTokenConfig 配置归一化
```

**依赖关系：**

```
index.ts
├── types.ts                    (本模块类型)
├── utils.ts                    (本模块归一化)
├── ../types.ts                 (InterceptorType, ResponseInterceptor, ShouldDo)
├── ../utils.ts                 (isAxiosResponse, isWithConfigAxiosError, normalizeShouldDo)
└── @/utils/promise.ts          (promiseWithResolvers)
```

## 核心流程

### 整体流程图

```
响应到达拦截器
       │
       ▼
┌──────────────┐    否
│ shouldRefresh ├────────► 原样返回（fulfilled → resolve，rejected → reject）
│   判断是否    │
│   需要刷新    │
└──────┬───────┘
       │ 是
       ▼
┌──────────────┐    是    ┌─────────────┐
│  正在刷新中？  ├────────►│ 加入等待队列  │──► 返回挂起的 Promise
└──────┬───────┘         └─────────────┘
       │ 否
       ▼
┌──────────────┐  空字符串  ┌─────────────────┐
│getRefreshToken├──────────►│ handleRefreshFail│
└──────┬───────┘           │ 清除 token       │
       │ 有值              │ 释放队列          │
       ▼                   └─────────────────┘
   refreshing = true
       │
       ▼
┌──────────────┐  空字符串  ┌─────────────────┐
│  refreshApi   ├──────────►│ handleRefreshFail│
│  获取新 token │           └─────────────────┘
└──────┬───────┘
       │ 有新 access token
       ▼
   setAccessToken(newToken)
       │
       ▼
   setRequestConfig(原始请求config, { accessToken, refreshToken })
       │
       ├──► axios.create()(原始请求config)  →  返回新的请求 Promise
       │
       └──► 遍历队列中的每个请求：
              setRequestConfig + axios.create()(config)
              .then(resolve).catch(reject)
            清空队列
```

### 详细流程分析

#### 1. 入口分流：fulfilled vs rejected

拦截器提供两个入口方法，在构造时根据配置决定是否启用：

```ts
// 仅当配置了 fulfilled.shouldRefresh 时启用
if (typeof config?.fulfilled?.shouldRefresh === 'function') {
  this.onFulfilled = this.fulfilledInterceptor;
}
// 仅当配置了 rejected.shouldRefresh 时启用
if (typeof config?.rejected?.shouldRefresh === 'function') {
  this.onRejected = this.rejectedInterceptor;
}
```

两个入口方法都会先做前置校验（`isAxiosResponse` / `isWithConfigAxiosError`），确保传入的是有效的 Axios 响应/错误对象（必须包含 `config` 和有效的 `url`），然后统一委托给 `process()` 方法。

#### 2. shouldRefresh 判断

`process()` 方法首先调用对应类型的 `shouldRefresh`：

- fulfilled 路径：`refreshTokenConfig.fulfilled.shouldRefresh(response)` 返回 `false` → 直接 `return response`
- rejected 路径：`refreshTokenConfig.rejected.shouldRefresh(error)` 返回 `false` → 直接 `return Promise.reject(error)`

**关键：不需要刷新时，保持原始 promise 状态不变。** 这是"无痛插拔"的核心——拦截器移除后，下游行为完全不受影响。

#### 3. 并发排队机制

```ts
class RefreshTokenInterceptor {
  private refreshing: boolean = false;
  private queue: Array<{
    interceptorType: InterceptorType
    res: AxiosError | AxiosResponse
    resolve: (value: AxiosResponse) => void
    reject: (reason?: any) => void
  }> = [];
}
```

当 `refreshing === true` 时，新到达的请求通过 `promiseWithResolvers()` 创建一个挂起的 Promise，将 resolve/reject 控制权存入队列：

```ts
if (refreshing) {
  const { promise, resolve, reject } = promiseWithResolvers<AxiosResponse>();
  queue.push({ res, resolve, reject, interceptorType });
  return promise; // 调用方获得一个挂起的 promise，等待队列释放
}
```

#### 4. 刷新流程

```ts
this.refreshing = true;
const accessToken = await refreshTokenConfig.refreshApi(refreshToken);
this.refreshing = false;
```

`refreshApi` 经过 `normalizeRefreshTokenConfig` 包装，**永远不会抛出异常**——内部 try-catch 会将异常转为空字符串。

#### 5. 队列释放

刷新成功后：

```ts
// 更新原始请求的配置
refreshTokenConfig.setRequestConfig(res.config!, { accessToken, refreshToken });
// 用全新的 axios 实例重发原始请求
const newRequestPromise = axios.create()(res.config!);

// 释放队列中的每个请求
queue.forEach(({ res, resolve, reject }) => {
  refreshTokenConfig.setRequestConfig(res.config!, { refreshToken, accessToken });
  axios.create()(res.config!).then(resolve).catch(reject);
});
queue.length = 0;

return newRequestPromise;
```

#### 6. 刷新失败处理

```ts
class RefreshTokenInterceptor {
  private handleRefreshFailure(res, interceptorType) {
    this.clearToken();
    // 按各自原始的 interceptorType 释放队列
    this.queue.forEach(({ resolve, reject, res, interceptorType }) => {
      this.isFulfilled(res, interceptorType) ? resolve(res) : reject(res);
    });
    this.queue.length = 0;
    // 当前请求同样按原始类型返回
    if (this.isFulfilled(res, interceptorType))
      return res;

    return Promise.reject(res);
  }
}
```

## 关键设计决策

### 1. 使用 `axios.create()` 发起重试请求

```ts
const newRequestPromise = axios.create()(res.config!);
```

**为什么不用原始的 axiosInstance？** 因为原始实例上注册了当前拦截器。如果新 token 仍然无效（或接口仍返回 401），会再次触发刷新逻辑，形成死循环。使用 `axios.create()` 创建一个无拦截器的临时实例，切断了循环链路。

**代价：** 重试请求不经过其他拦截器（cache、retry、business、error），只返回原始的 Axios 响应。但这是可接受的——重试的目的仅是用新 token 重新获取数据，后续拦截器的逻辑由返回的 promise 在链中继续流转。

### 2. 队列释放不等待重试结果

```ts
queue.forEach(({ res, resolve, reject }) => {
  axios.create()(res.config!).then(resolve).catch(reject);
});
queue.length = 0; // 立即清空，不等待
```

**为什么？** token 刷新通常是可靠的——新 token 有效，重试几乎总会成功。等待每个队列请求的结果没有实际价值，反而会阻塞流程。每个请求的 `.then(resolve).catch(reject)` 会在各自完成时自动更新对应 promise 的状态。

### 3. 刷新失败时保持原始 promise 状态

队列中的请求在刷新失败时，按照各自进入拦截器时的类型（fulfilled / rejected）来 resolve 或 reject：

```ts
this.isFulfilled(itemRes, itemInterceptorType) ? resolve(itemRes) : reject(itemRes);
```

**设计意图：** 拦截器的职责是"尝试刷新"，而不是"改变响应状态"。即使刷新失败，原本是 fulfilled 的响应仍然是 fulfilled（只是数据可能表示业务错误），原本是 rejected 的仍然 reject。下游拦截器和业务代码看到的状态与"没有 refresh-token 拦截器"时一致。

### 4. 配置归一化的防御性设计

`normalizeRefreshTokenConfig` 对所有用户提供的函数做了安全包装：

```ts
// getRefreshToken: try-catch 包装，异常时返回空字符串
const normalizedConfig = {
  getRefreshToken() {
    try {
      const refreshToken = config.getRefreshToken();
      if (!refreshToken || typeof refreshToken !== 'string')
        return '';

      return refreshToken;
    }
    catch (error) {
      console.error('获取刷新 token 失败', error);
      return '';
    }
  },
};

const optionalHandlers = {
  // refreshApi: 同理，异常时返回空字符串
  // 可选函数: 未提供时替换为 noop
  setAccessToken: typeof config.setAccessToken === 'function' ? config.setAccessToken : noop,
  clearAccessToken: typeof config.clearAccessToken === 'function' ? config.clearAccessToken : noop,
};
```

**目的：** `process()` 方法中不需要任何 try-catch，代码更清晰。所有用户函数的异常都被归一化层吸收，统一通过返回值（空字符串 = 失败）来表达。

### 5. 配置校验与提前退出

归一化函数在以下情况返回 `false`，表示拦截器不应生效：

- 配置对象为空或非对象
- `fulfilled.shouldRefresh` 和 `rejected.shouldRefresh` 都不是函数（没有判断条件）
- `getRefreshToken` 不是函数
- `refreshApi` 不是函数

构造函数收到 `false` 后，`onFulfilled` 和 `onRejected` 保持 `null`，传入 `response.use()` 时被 Axios 忽略。

### 6. `isFulfilled` 类型守卫

```ts
function isFulfilled(
  res: AxiosResponse | AxiosError,
  interceptorType: InterceptorType,
): res is AxiosResponse {
  return interceptorType === 'fulfilled';
}
```

运行时通过 `interceptorType` 字符串判断类型，而非检查 `res` 的结构。这比 `axios.isAxiosError()` 更可靠，因为拦截器的入口类型是确定的——从 fulfilled 入口进来的一定是 `AxiosResponse`。

## 类型系统

### 类型映射

```
RefreshTokenConfig (用户配置)
       │
       │ normalizeRefreshTokenConfig()
       ▼
InternalRefreshTokenConfig (内部配置)
  = DeepRequired<RefreshTokenConfig>
```

- `RefreshTokenConfig`：用户面向的配置，大部分字段可选
- `InternalRefreshTokenConfig`：内部使用，所有字段必填（通过 `DeepRequired` 强制）
- 归一化过程填充默认值（noop 函数）并包装安全层

### 工厂函数泛型

```ts
function createRefreshTokenResponseInterceptor<R, D, H>(config: RefreshTokenConfig<R, D, H>): [Nullable<ResponseInterceptor<'fulfilled', R, D, H>>, Nullable<ResponseInterceptor<'rejected', R, D, H>>];
```

泛型 `R` 传递到 `shouldRefresh` 的参数类型，使其能正确推断 `response.data` 的结构。

## 错误处理策略

| 场景 | 处理方式 | 结果 |
|------|----------|------|
| `getRefreshToken()` 抛异常 | try-catch 捕获，返回 `''` | 进入 `handleRefreshFailure`，清除 token，按原始状态返回 |
| `getRefreshToken()` 返回非字符串 | 检测到非 string，返回 `''` | 同上 |
| `refreshApi()` 抛异常 | try-catch 捕获，返回 `''` | 同上 |
| `refreshApi()` 返回非字符串 | 检测到非 string，返回 `''` | 同上 |
| 无 refresh token（已清除或过期） | `getRefreshToken` 返回 `''` | 同上 |
| 响应不是有效的 AxiosResponse/AxiosError | `isAxiosResponse` / `isWithConfigAxiosError` 前置校验失败 | 直接透传，不进入刷新逻辑 |
| 新 token 仍然无效 | 重试请求由 `axios.create()` 发出，不会重新进入本拦截器 | 重试请求的结果（成功或失败）直接返回给调用方 |

## 在拦截器链中的位置

```
请求拦截器:
  [1] cacheRequestFulfilled — 检查缓存

响应拦截器 (按注册顺序执行):
  [1] refreshToken    ← 本模块。最先处理，确保 401 在其他逻辑之前被拦截
  [2] retry           — 重试非 401 的失败请求
  [3] business        — 处理业务层成功/失败 (ApiResponse.success)
  [4] cache           — 缓存成功的响应
  [5] axiosError      — 最终的 Axios 错误处理
```

**位置选择的理由：**
- 在 retry **之前**：401 不应该被重试（重试也会 401），应该先刷新 token
- 在 business **之前**：刷新成功后返回新的响应，business 拦截器处理的是最终有效的响应
- 在 cache **之前**：401 响应不应该被缓存
