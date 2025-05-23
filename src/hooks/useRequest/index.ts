import type { UseRequestOptions } from './types';
import { computed, ref } from 'vue';
import { createAbortablePromise, createSingleCallPromise } from '@/utils/promise';
import { normalizeRequestOptions } from './normalize';

export function useRequest<
  Service extends (...args: any) => Promise<any>,
>(
  service: Service,
  options: Partial<UseRequestOptions<Service>> = {},
) {
  const data = ref<UnwrapPromise<ReturnType<Service>> | null>(null);
  const loading = ref<boolean>(false);
  const error = ref<any>(null);

  const normalizedOptions = normalizeRequestOptions(options);
  const fetcher = createSingleCallPromise(createAbortablePromise(service));

  data.value = normalizedOptions.initData;

  const requesting = ref(false);
  let promise = Promise.resolve() as AbortablePromise<any>;
  promise.abort = (_reason: any) => { };

  function request(...args: Parameters<Service>) {
    requesting.value = true;
    loading.value = true;
    normalizedOptions.onBefore(args);
    promise = fetcher(...args);

    promise
      .then((res) => {
        data.value = res;
        normalizedOptions.onSuccess(res, args);
        return res;
      })
      .catch((err) => {
        error.value = err;
        normalizedOptions.onError(err, args);
        return Promise.reject(err);
      })
      .finally(() => {
        requesting.value = false;
        loading.value = false;
        normalizedOptions.onFinally(args, data.value, error.value);
      });

    return promise;
  }

  if (normalizedOptions.immediate) {
    request(...normalizedOptions.initParams);
  }

  return {
    data,
    loading,
    error,
    request,
    abort(reason?: any) {
      promise.abort(reason);
    },
    abortable: computed(() => requesting.value),
  };
}
