import type { AxiosError, AxiosResponse } from 'axios';
import type { InternalRetryConfig } from './types';

export const KEY_RETRY_CONFIG = '__RETRY_CONFIG__';

export const DEFAULT_RETRY_CONFIG: InternalRetryConfig = {
  count: 3,
  interval: (_retriesCount: number) => 500,
  fulfilled: {
    shouldRetry: (_response: AxiosResponse) => false,
  },
  rejected: {
    shouldRetry: (_error: AxiosError) => true,
  },
};
