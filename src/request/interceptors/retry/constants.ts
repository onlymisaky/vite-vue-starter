import type { InternalRetryConfig } from './types';

export const RETRY_TAG = 'RETRY_TAG';

export const DEFAULT_RETRY_CONFIG: InternalRetryConfig = {
  count: 3,
  interval(_retriesCount) {
    return 500;
  },
  fulfilled: {
    shouldRetry: (_response) => false,
  },
  rejected: {
    shouldRetry: (_error) => true,
  },
};
