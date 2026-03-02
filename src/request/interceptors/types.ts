import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

export type InterceptorType = 'fulfilled' | 'rejected';

export type ShouldDo<
  T extends InterceptorType,
  R = any,
  D = any,
  H = Record<string, any>,
> = (res: T extends 'fulfilled' ? AxiosResponse<R, D, H> : AxiosError<R, D>) => boolean;

export type RequestInterceptor<T extends InterceptorType, D = any, R = any> = T extends 'fulfilled'
  ? (res: InternalAxiosRequestConfig<D>) => Promise<InternalAxiosRequestConfig<D>> | InternalAxiosRequestConfig<D>
  : (res: AxiosError<R, D>) => Promise<InternalAxiosRequestConfig<D>> | AxiosError<R, D> | Promise<never>;

export type ResponseInterceptor<T extends InterceptorType, R = any, D = any, H = Record<string, any>> = T extends 'fulfilled'
  ? (res: AxiosResponse<R, D, H>) => Promise<AxiosResponse<R, D, H>> | AxiosResponse<R, D, H>
  : (res: AxiosError<R, D>) => Promise<AxiosResponse<R, D, H>> | AxiosError<R, D> | Promise<never>;
