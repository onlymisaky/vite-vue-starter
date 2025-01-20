import type { UseRequestOptions } from './types';
import { ref } from 'vue';
import { normalizeRequestOptions, normalizeService } from './normalize';

export function useRequest<
  Service extends (...args: any) => Promise<any>,
>(
  service: Service,
  options: UseRequestOptions<Service>,
) {
  const data = ref<any>(null);
  const loading = ref<boolean>(false);
  const error = ref<any>(null);

  const normalizedOptions = normalizeRequestOptions(options);
  const fetcher = normalizeService(service);

  data.value = normalizedOptions.initData;

  let ps: Promise<ReturnType<Service>> & { cancel?: () => void };

  async function request(...args: Parameters<Service>) {
    loading.value = true;
    normalizedOptions.onBefore(args);
    ps = fetcher(...args);
    ps.then((res) => {
      data.value = res;
      normalizedOptions.onSuccess(res, args);
      return res;
    }).catch((err) => {
      error.value = err;
      normalizedOptions.onError(err, args);
      return Promise.reject(err);
    }).finally(() => {
      loading.value = false;
      normalizedOptions.onFinally(args, data.value, error.value);
    });
    return ps;
  }

  function cancel() {
    ps?.cancel?.();
  }

  if (normalizedOptions.immediate) {
    request(...normalizedOptions.initParams);
  }

  return {
    data,
    loading,
    error,
    request,
    cancel,
  };
}
