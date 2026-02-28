import type { InternalRetryConfig } from './types';

export const RETRY_TAG = 'RETRY_TAG';

export const DEFAULT_RETRY_CONFIG: InternalRetryConfig = {
  count: 3,
  interval() {
    return 500;
  },
  fulfilled: {
    shouldRetry() {
      return false;
    },
  },
  rejected: {
    shouldRetry() {
      return true;
    },
  },
};
