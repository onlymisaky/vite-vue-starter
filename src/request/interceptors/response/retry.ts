import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';

declare module 'axios' {
  export interface AxiosRequestConfig {
    retryConfig?: RetryConfig | boolean | number
  }
}

// 暴露给外部使用的配置
export interface RetryConfig {
  // 最大重试次数，默认 3 次
  count?: number
  // 重试间隔时间，默认 500ms
  interval?: number
  // 是否使用指数退避算法，默认 true
  useExponentialBackoff?: boolean
  // 是否应该重试，默认 true
  shouldRetry?: ((error: any) => boolean)
}

// 内部使用的配置
// 设置 currentCount ，并在每次重试时递增
export interface RetryConfigInternal extends Required<RetryConfig> {
  currentCount: number
}

export const defaultRetryConfig: Required<RetryConfig> = {
  count: 3,
  interval: 500,
  useExponentialBackoff: true,
  shouldRetry: (_error) => true,
};

function normalizeRetryConfig(retryConfig: RetryConfig | boolean | number | undefined): Required<RetryConfig> | false {
  // 默认配置
  if (retryConfig === undefined || retryConfig === true) {
    return defaultRetryConfig;
  }
  if (!retryConfig) {
    return false;
  }
  if (typeof retryConfig === 'number' || (typeof retryConfig === 'string' && !Number.isNaN(Number(retryConfig)))) {
    if (Number(retryConfig) < 0) {
      return false;
    }
    return {
      ...defaultRetryConfig,
      count: Number(retryConfig),
    };
  }
  if (typeof retryConfig !== 'boolean' && typeof retryConfig !== 'object') {
    return false;
  }
  return {
    ...defaultRetryConfig,
    ...retryConfig,
    shouldRetry: typeof retryConfig.shouldRetry === 'function'
      ? (error: any) => !!(retryConfig.shouldRetry!(error))
      : (_error: any) => true,
  };
}

function wait(delay: number, error: AxiosError) {
  return new Promise((resolve, reject) => {
    // 如果在开始等待前已经被取消，直接reject
    if (error.config?.signal?.aborted) {
      reject(new axios.AxiosError(
        'Request aborted',
        axios.AxiosError.ERR_CANCELED,
        error.config,
        error.request,
        error.response,
      ));
      return;
    }

    const timer = setTimeout(resolve, delay);

    // 重试间隔期间，也可以取消请求
    // 监听取消信号
    error.config?.signal?.addEventListener?.('abort', () => {
      clearTimeout(timer);
      reject(new axios.AxiosError(
        'Request aborted',
        axios.AxiosError.ERR_CANCELED,
        error.config,
        error.request,
        error.response,
      ));
    }, { once: true });
  });
}

async function retryRequest(error: AxiosError): Promise<AxiosResponse<any>> {
  const config = error.config as InternalAxiosRequestConfig;
  const retryConfig = config.retryConfig as RetryConfigInternal;
  if (retryConfig.currentCount >= retryConfig.count) {
    return Promise.reject(error);
  }
  // 计算延迟时间
  const delay = retryConfig.useExponentialBackoff
    ? retryConfig.interval * 2 ** (retryConfig.currentCount - 1)
    : retryConfig.interval;
  await wait(delay, error);
  (config.retryConfig as RetryConfigInternal).currentCount += 1;
  return axios(config).catch((_error) => retryRequest(error));
}

export async function retryInterceptor(error: AxiosError) {
  if (!axios.isAxiosError(error)) {
    return Promise.reject(error);
  }

  if (!error.config || typeof error.config !== 'object') {
    return Promise.reject(error);
  }

  const config = error.config;

  // 如果请求已经被取消，不进行重试
  if (config.signal?.aborted) {
    return Promise.reject(error);
  }

  // 获取当前重试次数
  let currentCount = Number((config?.retryConfig as RetryConfigInternal)?.currentCount);
  if (Number.isNaN(currentCount)) {
    currentCount = 0;
  }
  if (currentCount < 0) {
    currentCount = 0;
  }

  config.retryConfig = normalizeRetryConfig(config.retryConfig);

  if (!config.retryConfig) {
    return Promise.reject(error);
  }

  const retryConfig = config.retryConfig as RetryConfigInternal;

  retryConfig.currentCount = currentCount;

  // 检查是否达到最大重试次数
  if (retryConfig.currentCount >= retryConfig.count) {
    return Promise.reject(error);
  }

  // 检查是否应该重试
  if (!retryConfig.shouldRetry(error)) {
    return Promise.reject(error);
  }

  /**
   * 重试请求
   * ! 之前通过闭包的形式，将 axiosInstance 注入到 retryInterceptor 中，使用 axiosInstance 进行请求重试
   * ! 但是这样会有一个致命的错误: 在重试期间发生的错误，会被其它的错误拦截器拦截，从而导致重复的错误处理
   * ! 解决的的办法也有:
   * !  1. 在这里临时移除其它的拦截，很明显做不到
   * !  2. 在这里添加一个标记，告诉其它拦截器，我正在进行重试，重试期间发生的错误不要处理，这种做法入侵性太强
   * !  3. 修改 adapter ，那不如采用现有的做法，创建一个专门用于重试请求的方法
   * !  4. 拿到当前的 promise ，想办法做一些处理，让 catch 和 then 不要往下传递，但是实在想不出方法
   * ! 所以最终采用下面拿的方案，创建一个专门用于重试请求的方法，省事又省心，
   * ! 唯一需要考虑的是，如果在其他地方手动修改改了 adapter ，会不会又什么意料之外的问题，但是不想考虑了
   */
  return retryRequest(error);
}
