import type { AxiosError, AxiosResponse } from 'axios';

export type InterceptorType = 'fulfilled' | 'rejected';

export type ShouldDo<
  T extends InterceptorType,
  R = any,
  D = any,
  H = Record<string, any>,
> = (res: T extends 'fulfilled' ? AxiosResponse<R, D, H> : AxiosError<R, D>) => boolean;

export type ResponseInterceptor<T extends InterceptorType, R = any, D = any, H = Record<string, any>> = T extends 'fulfilled'
  ? (res: AxiosResponse<R, D, H>) => Promise<AxiosResponse<R, D, H>> | AxiosResponse<R, D, H>
  : (res: AxiosError<R, D>) => Promise<never> | Promise<AxiosResponse<R, D, H>> | AxiosError<R, D>;
