export * from './response';

/**
 * Test Cases
 * - 走 fulfilled 拦截器
 * - 走 rejected 拦截器
 * - refreshApi 报错
 * - 新的 access token 依旧没有生效
 * - 拦截器重复，导致死循环
 */
