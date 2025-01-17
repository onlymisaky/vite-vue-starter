import type { AxiosError } from 'axios';
import axios from 'axios';
import { defaultRetryConfig, normalizeRetryConfig, retryRequest } from './utils';

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

  // 因为是附加的功能，所以当没有配置时，默认不进行重试
  // 另一种做法：因为是主动添加的功能，所以当没有配置时，默认进行重试
  // 这里采用第一种做法
  // 理由：虽然是主动添加的，但后续接手项目接手的人可能不会仔细看每一处代码，常识里会认为没有重试功能
  //      如果默认开启重试，当他在开发调试时，会因为重试功能而感到困惑，甚至不知道重试功能是哪里开启的
  if (!Reflect.has(config, 'retryConfig')) {
    config.retryConfig = {
      ...defaultRetryConfig,
      count: 0,
    };
  }

  const retryConfig = normalizeRetryConfig(config.retryConfig);

  config.retryConfig = retryConfig;

  // 不重试，直接返回错误
  if (retryConfig.count <= 0) {
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
