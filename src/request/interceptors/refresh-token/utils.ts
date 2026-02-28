import type { InternalRefreshTokenConfig, RefreshTokenConfig } from './types';
import { normalizeShouldDo } from '../utils';

function noop() {}

export function normalizeRefreshTokenConfig(refreshTokenConfig: RefreshTokenConfig | unknown): false | InternalRefreshTokenConfig {
  if (!refreshTokenConfig || typeof refreshTokenConfig !== 'object') {
    return false;
  }

  // TS 类型断言
  const config = refreshTokenConfig as RefreshTokenConfig;

  if (
    typeof config.fulfilled?.shouldRefresh !== 'function'
    && typeof config.rejected?.shouldRefresh !== 'function'
  ) {
    return false;
  }

  if (typeof config.getRefreshToken !== 'function') {
    return false;
  }

  if (typeof config.refreshApi !== 'function') {
    return false;
  }

  return {
    ...config,
    getRefreshToken() {
      try {
        const refreshToken = config.getRefreshToken();
        if (!refreshToken || typeof refreshToken !== 'string') {
          console.error('getRefreshToken 必须返回一个字符串', refreshToken);
          return '';
        }
        return refreshToken;
      }
      catch (error) {
        console.error('获取刷新 token 失败', error);
        return '';
      }
    },
    async refreshApi(refreshToken: string) {
      try {
        const accessToken = await config.refreshApi(refreshToken);
        if (!accessToken || typeof accessToken !== 'string') {
          console.error('refreshApi 必须返回一个字符串', accessToken);
          return '';
        }
        return accessToken;
      }
      catch (error) {
        console.error('刷新 token 失败', error);
        return '';
      }
    },
    setAccessToken: typeof config.setAccessToken === 'function' ? config.setAccessToken : noop,
    clearAccessToken: typeof config.clearAccessToken === 'function' ? config.clearAccessToken : noop,
    clearRefreshToken: typeof config.clearRefreshToken === 'function' ? config.clearRefreshToken : noop,
    setRequestConfig: typeof config.setRequestConfig === 'function' ? config.setRequestConfig : noop,
    fulfilled: {
      shouldRefresh: typeof config.fulfilled?.shouldRefresh === 'function'
        ? normalizeShouldDo(config.fulfilled?.shouldRefresh, false)
        : undefined,
    },
    rejected: {
      shouldRefresh: typeof config.rejected?.shouldRefresh === 'function'
        ? normalizeShouldDo(config.rejected?.shouldRefresh, false)
        : undefined,
    },
  } as InternalRefreshTokenConfig;
}
