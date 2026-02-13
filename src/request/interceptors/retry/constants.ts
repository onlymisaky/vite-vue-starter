import type { RetryConfig } from './types';

export const RETRY_TAG = 'RETRY_TAG';

export const DEFAULT_RETRY_CONFIG: Required<RetryConfig> = {
  count: 3,
  interval: 500,
  useExponentialBackoff: false,
  shouldRetry: (_error) => true,
};
