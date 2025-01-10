import type { IRes } from '@/types/res';
import type { AxiosResponse } from 'axios';

/**
 * 以 Go 风格处理 axios 响应和错误
 * 返回 [error, data] 元组，便于解构处理结果
 * @template T 响应数据的类型
 * @template D 请求数据的类型
 * @param axiosPromise Axios 请求Promise
 * @returns [error, data] 元组，error 为 null 时表示请求成功
 */
export function handleAxiosResult<T = any, D = any>(
  axiosPromise: Promise<AxiosResponse<IRes<T>, D>>,
): Promise<[Error, null] | [null, T]> {
  return axiosPromise
    .then((response) => {
      return [null, response.data.data] as [null, T];
    })
    .catch((error) => {
      return [error, null];
    });
}
