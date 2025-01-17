import { createCacheStore } from '../../../utils/cache';
import { createCacheRequestInterceptor, defaultCacheConfig } from './request';
import { createCacheResponseInterceptor } from './response';

export const requestCacheStore = createCacheStore({ type: 'memory', expires: defaultCacheConfig.ttl });

export const cacheRequestInterceptor = createCacheRequestInterceptor(requestCacheStore);
export const cacheResponseInterceptor = createCacheResponseInterceptor(requestCacheStore);

/**
 * 对请求结果进行缓存更适合通过高阶函数实现，
 * 因为缓存本质上是对函数执行结果进行缓存，
 * 如果用拦截器实现，则需要判断请求之间的"相同性"，
 * 所以这里通过 generateKey 生成缓存键，
 * 而如果通过高阶函数实现，直接对函数执行结果进行缓存，
 * 当然前提是函数没有参数的，
 * 如果函数有参数，将参数作为缓存的 key， (如何判断两次参数是否相同，这又是另一个问题了)
 * 同样还有其它很多和请求相关的高级功能要考虑到"相同性"问题，例如
 * - 缓存
 * - 防抖
 * - 节流
 * - 请求合并
 * - 请求去重
 * - 并发控制
 * - 请求队列
 * 等等
 * 这些功能都不建议在拦截器中实现
 */
