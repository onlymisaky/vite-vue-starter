import type { AxiosError } from 'axios';
import axios from 'axios';
import { ERR_BUSINESS } from './business';

/**
 * 处理 axios 错误
 * TODO 先把坑位占着，后续随着业务发展，再完善
 */
export function axiosErrorInterceptor(error: unknown) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;

    // 请求被取消
    if (axios.isCancel(error)) {
      return Promise.reject(axiosError);
    }

    // 业务错误
    if (axiosError.code === ERR_BUSINESS) {
      return Promise.reject(axiosError);
    }

    // 请求成功发出且服务器也响应了状态码，但状态代码不在 validateStatus 的范围内
    if (axiosError.response) {
      return Promise.reject(axiosError);
    }

    // 请求已经成功发起，但没有收到响应
    if (axiosError.request) {
      return Promise.reject(axiosError);
    }
  }

  return Promise.reject(error);
}
