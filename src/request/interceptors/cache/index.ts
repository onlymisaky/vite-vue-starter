import { createCacheStore } from '../../../utils/cache';
import { createCacheRequestInterceptor, defaultCacheConfig } from './request';
import { createCacheResponseInterceptor } from './response';

export const requestCacheStore = createCacheStore({ type: 'memory', expires: defaultCacheConfig.ttl });

export const cacheRequestInterceptor = createCacheRequestInterceptor(requestCacheStore);
export const cacheResponseInterceptor = createCacheResponseInterceptor(requestCacheStore);
