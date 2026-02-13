import type { AxiosResponse } from 'axios';
import axios from 'axios';

export const ERR_BUSINESS = 'ERR_BUSINESS';

/**
 * 处理业务层面的成功响应
 * 本项目中，所有请求都会返回 200，通过 success 字段判断业务是否成功
 */
export function businessInterceptor(response: AxiosResponse) {
  const axiosResponse = response as AxiosResponse<ApiResponse<any>>;
  const res = axiosResponse.data;

  if (res && res.success) {
    return axiosResponse;
  }

  // TODO 业务错误处理，先把坑占着
  const axiosError = new axios.AxiosError(
    res.message || '未知错误',
    ERR_BUSINESS,
    axiosResponse.config,
    axiosResponse.request,
    axiosResponse,
  );
  axiosError.status = res.status;

  return Promise.reject(axiosError);
}
