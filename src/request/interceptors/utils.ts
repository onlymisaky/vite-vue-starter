import type { AxiosError, AxiosResponse } from 'axios';
import type { InterceptorType, ShouldDo } from './types';
import axios from 'axios';

export function validateAxiosError<R = any, D = any>(error: AxiosError<R, D> | any): error is AxiosError<R, D> {
  if (
    !axios.isAxiosError(error)
    || !error.config
    || typeof error.config !== 'object'
    || typeof error.config.url !== 'string'
    || error.config.url.trim() === ''
  ) {
    return false;
  }
  return true;
}

export function validateAxiosResponse<R = any, D = any, H = Record<string, any>>(response: AxiosResponse<R, D, H> | any): response is AxiosResponse<R, D, H> {
  if (
    axios.isAxiosError(response)
    || !response
    || typeof response !== 'object'
    || !response.config
    || typeof response.config !== 'object'
    || typeof response.config.url !== 'string'
    || response.config.url.trim() === ''
  ) {
    return false;
  }
  return true;
}

export function isNumberLike(value: unknown): value is number | string {
  return typeof value === 'number' || (typeof value === 'string' && /^\d+$/.test(value));
}

/**
 * 归一化数字，将值限制在指定范围内
 * @param value 待归一化的值
 * @param options 归一化选项
 * @returns 归一化后的数字或 0
 */
export function normalizeNumber(
  value: unknown,
  options?: Partial<{
    defaultValue: number
    min: number
    max: number
  }>,
): number | 0 {
  if (isNumberLike(value)) {
    const num = Number(value);
    const max = isNumberLike(options?.max) ? Number(options.max) : num;
    const min = isNumberLike(options?.min) ? Number(options.min) : num;
    return Math.min(Math.max(num, min), max);
  }

  if (isNumberLike(options?.defaultValue)) {
    return Number(options.defaultValue);
  }

  return 0;
}

/**
 * 归一化判断函数
 * @param shouldDo 待归一化的判断函数
 * @param defaultResult 默认结果
 * @returns 归一化后的判断函数
 */
export function normalizeShouldDo<
  T extends InterceptorType,
  R = any,
  D = any,
  H = Record<string, any>,
>(shouldDo: ShouldDo<T, R, D, H> | any, defaultResult: boolean) {
  if (typeof shouldDo === 'function') {
    return (...args: Parameters<ShouldDo<T, R, D, H>>) => !!(shouldDo!(...args));
  }
  return (..._args: Parameters<ShouldDo<T, R, D, H>>) => defaultResult;
}
