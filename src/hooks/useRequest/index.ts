import type { UseRequestOptions } from './types';
import { ref } from 'vue';
import { normalizeApi, normalizeRequestOptions } from './normalize';

export function useRequest<
  Api extends (...args: any) => Promise<any> = (...args: any) => Promise<any>,
>(
  api: string | Api,
  options: UseRequestOptions<Api>,
) {
  const data = ref<any>(null);
  const loading = ref<boolean>(false);
  const error = ref<any>(null);

  const normalizedOptions = normalizeRequestOptions(options);
  const fetcher = normalizeApi(api, normalizedOptions.method);

  data.value = normalizedOptions.initData;

  async function request(...args: Parameters<Api>) {
    loading.value = true;
    let res: any;
    let err: any;
    try {
      normalizedOptions.onBefore(args);
      res = await fetcher(...args);
      data.value = res;
      normalizedOptions.onSuccess(res, args);
    }
    catch (e) {
      err = e;
      error.value = e;
      normalizedOptions.onError(e, args);
    }
    finally {
      loading.value = false;
      normalizedOptions.onFinally(args, res, err);
    }
  }

  if (normalizedOptions.immediate) {
    request(...normalizedOptions.initParams);
  }

  return {
    data,
    loading,
    error,
    request,
  };
}
