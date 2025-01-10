import type { IRes } from '@/types/res.d';
import axios, { type AxiosResponse } from 'axios';

export const ERR_BUSINESS = 'ERR_BUSINESS';

/**
 * 处理业务层面的成功响应
 * 本项目中，所有请求都会返回 200，通过 success 字段判断业务是否成功
 */
export function businessInterceptor(response: AxiosResponse) {
  const axiosResponse = response as AxiosResponse<IRes<any>>;
  const res = axiosResponse.data;

  if (res.success) {
    return axiosResponse;
  }

  // TODO 业务错误处理，先把坑占着
  const axiosError = new axios.AxiosError(
    res.message,
    ERR_BUSINESS,
    axiosResponse.config,
    axiosResponse.request,
    axiosResponse,
  );
  axiosError.status = res.status;

  return Promise.reject(axiosError);
}
