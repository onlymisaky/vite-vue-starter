export * from './cache';
export * from './refresh-token';
export * from './response';
export * from './retry';

/**
 * 尽量不改变拦截器状态
 * refresh-token
 *  - 如果 token 失效进入 responseFulfilled 拦截器，无论是否刷新 token 成功，都返回 response
 *    - 刷新 token 成功，返回新的 Promise<AxiosResponse>
 *    - 刷新 token 失败，返回原始 response
 *  - 如果 token 失效进入 responseRejected 拦截器
 *    - 刷新 token 成功，返回新的 Promise<AxiosResponse>
 *    - 刷新 token 失败，返回原始 Promise.reject(error)
 * retry
 *  - 如果请求失败进入 responseFulfilled 拦截器，无论是否重试成功，都返回 response
 *    - 重试成功，返回新的 Promise<AxiosResponse>
 *    - 重试失败，返回原始 response
 *  - 如果请求失败进入 responseRejected 拦截器
 *    - 重试成功，返回新的 Promise<AxiosResponse>
 *    - 重试失败，返回原始 Promise.reject(error)
 */
