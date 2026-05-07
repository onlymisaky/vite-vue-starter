# Retry Interceptor — 技术设计文档

## 设计目标

1. **自动重试** — 请求失败时按配置自动重试，业务层无需手动处理
2. **双通道支持** — 同时支持 fulfilled 和 rejected 两种拦截入口，适配不同的 `validateStatus` 配置
3. **可取消** — 重试期间（包括等待间隔期间）支持通过 AbortSignal 取消
4. **无痛插拔** — 不改变拦截器链的 promise 状态流转，可随时移除而不影响其他拦截器

## 模块结构

```
retry/
├── index.ts       # RetryInterceptor 类 + createRetryResponseInterceptor 工厂函数
├── types.ts       # RetryConfig / InternalRetryConfig 类型定义
├── constants.ts   # KEY_RETRY_CONFIG / DEFAULT_RETRY_CONFIG 常量
└── utils.ts       # 配置归一化、配置获取、wait、retryRequest
```

**依赖关系：**

```
index.ts
├── types.ts                    (本模块类型)
├── constants.ts                (本模块常量)
├── utils.ts                    (本模块工具函数)
├── ../types.ts                 (InterceptorType, ResponseInterceptor, ShouldDo)
└── ../utils.ts                 (isAxiosResponse, isWithConfigAxiosError, isNumberLike,
                                 normalizeNumber, normalizeShouldDo)
```

## 核心流程

### 整体流程图

```
响应到达拦截器
       │
       ├── fulfilled 路径 ──────────────────── rejected 路径
       │                                        │
       ▼                                        ▼
┌───────────────┐                        ┌────────────────────┐
│ isAxiosResponse│                        │isWithConfigAxiosError│
│   前置校验     │                        │    前置校验          │
└──────┬────────┘                        └───────┬────────────┘
       │ 否 → 直接返回 response                    │ 否 → Promise.reject(error)
       │                                        │
       ▼                                        ▼
┌───────────────┐                        ┌──────────────────┐
│ signal.aborted │                        │  signal.aborted   │
│  请求已取消？   │                        │   请求已取消？     │
└──────┬────────┘                        └───────┬──────────┘
       │ (fulfilled 不检查)                       │ 是 → Promise.reject(error)
       │                                        │
       ▼                                        ▼
┌──────────────┐                         ┌──────────────┐
│ getRetryConfig│                         │ getRetryConfig│
│  获取重试配置  │                         │  获取重试配置  │
└──────┬───────┘                         └──────┬───────┘
       │ false → 直接返回                         │ false → Promise.reject
       │                                        │
       ▼                                        ▼
┌──────────────┐                         ┌──────────────┐
│ count <= 0   │                         │ count <= 0   │
│ 不重试       │                          │ 不重试       │
└──────┬───────┘                         └──────┬───────┘
       │ 是 → 直接返回                            │ 是 → Promise.reject
       │                                        │
       ▼                                        ▼
┌──────────────┐                         ┌──────────────┐
│ shouldRetry  │                         │ shouldRetry  │
│ 判断是否重试  │                          │ 判断是否重试  │
└──────┬───────┘                         └──────┬───────┘
       │ false → 直接返回                         │ false → Promise.reject
       │                                        │
       └────────────────┬───────────────────────┘
                        │ shouldRetry = true
                        ▼
                  retryRequest(res, 0, retryConfig)
```

### retryRequest 递归流程

```
retryRequest(res, retriesCount, retryConfig)
       │
       ▼
┌──────────────────┐
│retriesCount >=   │    是
│ retryConfig.count├──────► fulfilled: 返回原始 response
│  达到上限？      │         rejected: Promise.reject(error)
└──────┬───────────┘
       │ 否
       ▼
  计算 delay = retryConfig.interval(retriesCount)
       │
       ▼
┌──────────────┐
│   wait(delay) │
│   等待延迟    │
└──────┬───────┘
       │          ┌─────────────────┐
       │ abort ──►│ Promise.reject  │
       │          │ (ERR_CANCELED)  │
       │          └─────────────────┘
       │ resolve
       ▼
  axios.create()(requestConfig)
  使用临时实例发送请求
       │
       ├── then (response) ──────────────────┐
       │                                     ▼
       │                          ┌───────────────────┐
       │                          │shouldRetry(response)│
       │                          └──────┬────────────┘
       │                                 │ true → retryRequest(response, retriesCount + 1, ...)
       │                                 │ false → 返回 response（重试成功）
       │
       └── catch (error) ───────────────────┐
                                            ▼
                                 ┌───────────────────┐
                                 │ shouldRetry(error)  │
                                 └──────┬────────────┘
                                        │ true → retryRequest(error, retriesCount + 1, ...)
                                        │ false → Promise.reject(error)（重试失败）
```

## 关键设计决策

### 1. 使用 `axios.create()` 避免拦截器循环

```ts
return axios.create()(requestConfig);
```

**为什么不用原始的 axiosInstance？** 因为原始实例上注册了包含当前拦截器在内的整条拦截器链。如果用原始实例重试，成功的重试响应会再次经过 retry 拦截器，如果 `shouldRetry` 条件仍满足（如检查业务层 `success` 字段），会形成双重重试。使用 `axios.create()` 创建无拦截器的临时实例，切断了循环链路。

**代价：** 重试请求不经过其他拦截器（cache、refresh-token、business、error）。但这是合理的——重试的目的仅是获取一个成功的原始响应，后续拦截器的逻辑由返回的 promise 在原始拦截器链中继续流转。

### 2. 递归而非循环实现重试

```ts
async function retryRequest(res, retriesCount, retryConfig) {
  // ...
  return axios.create()(requestConfig)
    .then((response) => {
      if (retryConfig.fulfilled.shouldRetry(response)) {
        return retryRequest(response, retriesCount + 1, retryConfig); // 递归
      }
      return response;
    })
    .catch((error) => {
      if (retryConfig.rejected.shouldRetry(error)) {
        return retryRequest(error, retriesCount + 1, retryConfig); // 递归
      }
      return Promise.reject(error);
    });
}
```

**设计意图：** 每次重试后需要重新评估 `shouldRetry`，因为不同次的重试可能产生不同类型的错误。递归天然支持这种"每次重试前都重新决策"的模式。同时 `count` 上限（最大 10）保证递归深度有界。

### 3. `wait()` 支持 AbortSignal 中断

```ts
function wait(delay, res) {
  return new Promise((resolve, reject) => {
    if (res.config?.signal?.aborted || axios.isCancel(res)) {
      reject(createAbortedError(res));
      return;
    }

    const timer = setTimeout(() => {
      res.config?.signal?.removeEventListener?.('abort', onAbort);
      resolve();
    }, delay);

    function onAbort() {
      clearTimeout(timer);
      reject(createAbortedError(res));
    }

    res.config?.signal?.addEventListener?.('abort', onAbort, { once: true });
  });
}
```

三层防护确保取消信号不被遗漏：

1. **进入** **`wait`** **前检查**：`signal.aborted` 已为 `true`，立即 reject
2. **等待期间监听**：`addEventListener('abort', onAbort)` 监听取消事件
3. **正常完成后清理**：`removeEventListener` 防止内存泄漏

### 4. 配置归一化的防御性设计

#### `normalizeRetryCount`

通过 `normalizeNumber` 将 count 限制在 `[0, 10]`：

```ts
function normalizeRetryCount(retryCount, defaultValue) {
  return normalizeNumber(retryCount, { defaultValue, min: 0, max: 10 });
}
```

#### `normalizeRetryInterval`

三种处理路径：

| 输入类型     | 处理方式                          |
| -------- | ----------------------------- |
| 函数       | 包装：调用函数后将返回值截断到 `[300, 5000]` |
| 数字或数字字符串 | 截断到 `[300, 5000]`，包装为常量函数     |
| 其他       | 使用默认函数                        |

### 5. fulfilled 默认不重试、rejected 默认重试

```ts
export const DEFAULT_RETRY_CONFIG: InternalRetryConfig = {
  fulfilled: { shouldRetry: (_response) => false },
  rejected: { shouldRetry: (_error) => true },
};
```

**理由：**

- **fulfilled 默认不重试**：进入 fulfilled 通常意味着 HTTP 层面请求成功（2xx），大多数场景不需要重试
- **rejected 默认重试**：进入 rejected 意味着请求失败（网络错误、超时、非 2xx），重试是合理的默认行为

### 6. interval 函数化设计

内部将 `interval` 统一归一化为 `(retriesCount: number) => number` 函数形式：

```ts
export interface InternalRetryConfig {
  interval: (retriesCount: number) => number // 始终是函数
}
```

**设计意图：** 统一调用方式，`retryRequest` 内部只需 `retryConfig.interval(retriesCount)` 一种写法，无需区分用户传入的是固定值还是函数。

## 类型系统

### 类型映射

```
RetryConfig (用户配置)
       │
       │ normalizeRetryConfig()
       ▼
InternalRetryConfig (内部配置)
  = DeepRequired<RetryConfig>
  + interval 统一为函数类型
```

- `RetryConfig`：用户面向的配置，所有字段可选
- `InternalRetryConfig`：内部使用，所有字段必填（通过 `DeepRequired` 强制），且 `interval` 固定为函数类型
- 归一化过程填充默认值并验证边界

### 请求配置类型扩展

```ts
// axios.d.ts
declare module 'axios' {
  export interface AxiosRequestConfig {
    [KEY_RETRY_CONFIG]?: RetryConfig | number | `${number}` | false
  }
}
```

支持多种快捷写法，由 `getRetryConfig` 在运行时解析。

### 工厂函数泛型

```ts
function createRetryResponseInterceptor<R, D, H>(config: RetryConfig<R, D, H>): [ResponseInterceptor<'fulfilled', R, D, H>, ResponseInterceptor<'rejected', R, D, H>];
```

泛型 `R` 传递到 `shouldRetry` 的参数类型，使其能正确推断 `response.data` / `error.response.data` 的结构。

## 请求级配置解析（`getRetryConfig`）

`getRetryConfig` 负责将请求级配置与全局配置合并，解析策略如下：

| `__RETRY_CONFIG__` 值        | 处理方式                                                                    |
| --------------------------- | ----------------------------------------------------------------------- |
| 未设置（key 不存在）                | 使用全局配置的副本                                                               |
| `number` 或 `\`${number}\`\` | 仅覆盖 `count`，其余继承全局                                                      |
| `false`                     | 返回 `false`，不重试                                                          |
| 非对象（string、null 等）          | 返回 `false`，不重试                                                          |
| 对象                          | 逐字段合并：`count`、`interval`、`fulfilled.shouldRetry`、`rejected.shouldRetry` |

合并时只覆盖显式声明的字段（通过 `Reflect.has` 检测），未声明的字段保留全局配置值。

## 错误处理策略

| 场景                               | 处理方式                                               | 结果                                                     |
| -------------------------------- | -------------------------------------------------- | ------------------------------------------------------ |
| 请求已被 AbortSignal 取消              | responseRejected 入口直接跳过                            | `Promise.reject(error)`                                |
| 等待间隔期间被取消                        | `wait()` 监听 abort 事件，清除定时器                         | `Promise.reject(ERR_CANCELED)`                         |
| 进入 `wait` 前已取消                   | `wait()` 前置检查 `signal.aborted`                     | `Promise.reject(ERR_CANCELED)`                         |
| 达到最大重试次数                         | `retriesCount >= count` 检查                         | fulfilled: 返回最后一次 response；rejected: reject 最后一次 error |
| `shouldRetry` 返回 `false`         | 拦截器入口或重试回调中判断                                      | fulfilled: 返回 response；rejected: reject error          |
| 重试请求成功                           | `axios.create()` 返回成功响应                            | 返回新的 response                                          |
| 重试请求失败                           | `axios.create()` 抛出错误                              | 继续递归重试或 reject                                         |
| 响应不是有效的 AxiosResponse/AxiosError | `isAxiosResponse` / `isWithConfigAxiosError` 校验失败  | 直接透传，不进入重试逻辑                                           |
| `retryConfig` 传入非对象              | `normalizeRetryConfig` 将 fulfilled/rejected 都设为不重试 | 不重试                                                    |

## 在拦截器链中的位置

```
请求拦截器:
  [1] cacheRequestFulfilled — 检查缓存

响应拦截器 (按注册顺序执行):
  [1] refreshToken    — 最先处理 401，自动刷新 token
  [2] retry           ← 本模块。重试非 401 的失败请求
  [3] business        — 处理业务层成功/失败 (ApiResponse.success)
  [4] cache           — 缓存成功的响应
  [5] axiosError      — 最终的 Axios 错误处理
```

**位置选择的理由：**

- 在 refresh-token **之后**：401 不应该被重试（重试也会 401），应由 refresh-token 拦截器处理
- 在 business **之前**：重试成功后返回的新响应需要经过 business 拦截器处理业务逻辑
- 在 error **之前**：重试失败后的最终错误由 axiosError 拦截器统一处理

## 已知限制

1. **重试请求不经过拦截器链**：`axios.create()` 创建的临时实例没有注册拦截器，重试请求不受 cache、business 等拦截器影响
2. **无重试状态暴露**：业务层无法感知当前是第几次重试，也无法在运行时动态调整重试策略
3. **无指数退避内置**：需要通过 `interval` 函数手动实现指数退避、抖动等策略
4. **无请求级重试回调**：不支持在重试前/后执行钩子函数（如日志记录）

