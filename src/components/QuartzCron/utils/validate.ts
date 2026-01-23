import type { ValueValidateResult } from '../types';
import type { ValidateErrorCode } from './constants';
import { VALIDATE_ERROR_CODE_MAP, VALUE_RANGE_MAP } from './constants';

export function isInteger(num: any): num is number {
  if (['null', 'undefined', ''].includes(`${num}`)) {
    return false;
  }

  const numInt = Number(num);

  if (!Number.isInteger(numInt)) {
    return false;
  }

  return true;
}

export function isInRange(val: any, { min, max }: { min: number, max: number }) {
  if (!isInteger(val)) {
    return false;
  }

  if (val <= min - 1 || val >= max + 1) {
    return false;
  }

  return true;
}

export function validateRange({ start, end, min, max }: { start: any, end: any, min: number, max: number }): ValueValidateResult<ValidateErrorCode> {
  const startNum = Number(start);
  const endNum = Number(end);

  if (!Number.isInteger(startNum) || !Number.isInteger(endNum)) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.NOT_INTEGER,
    };
  }

  if (
    ['null', 'undefined', ''].some((item) => [`${start}`.trim(), `${end}`.trim()].includes(item))
  ) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.EMPTY,
    };
  }

  if (startNum < min || endNum > max) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.OUT_OF_RANGE,
    };
  }

  if (startNum >= endNum) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.START_GREATER_THAN_END,
    };
  }

  return { success: true };
}

export function validateStep({ from, step, min, max }: { from: any, step: any, min: number, max: number }): ValueValidateResult<ValidateErrorCode> {
  const fromNum = Number(from);
  const stepNum = Number(step);

  if (!Number.isInteger(fromNum) || !Number.isInteger(stepNum)) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.NOT_INTEGER,
    };
  }

  if (
    ['null', 'undefined', ''].some((item) => [`${from}`.trim(), `${step}`.trim()].includes(item))
  ) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.EMPTY,
    };
  }

  if (fromNum < min || fromNum > max || stepNum <= min - 1 || stepNum > max) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.OUT_OF_RANGE,
    };
  }

  return { success: true };
}

export function validateList({ list, min, max }: { list: any, min: number, max: number }): ValueValidateResult<ValidateErrorCode> {
  if (!Array.isArray(list)) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.NOT_LIST,
    };
  }

  if (list.length <= 0) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.LIST_EMPTY,
    };
  }

  if (list.length > max - min + 1) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.LIST_LENGTH_EXCEEDED,
    };
  }

  for (let index = 0; index < list.length; index++) {
    const item = list[index];

    const n = Number(item);

    if (!Number.isInteger(n)) {
      return {
        success: false,
        code: VALIDATE_ERROR_CODE_MAP.NOT_INTEGER,
      };
    }

    if (['null', 'undefined', ''].includes(`${item}`.trim())) {
      return {
        success: false,
        code: VALIDATE_ERROR_CODE_MAP.EMPTY,
      };
    }

    if (index > 0) {
      if (n <= list[index - 1]) {
        return {
          success: false,
          code: VALIDATE_ERROR_CODE_MAP.LIST_NOT_SORTED,
        };
      }
    }
  }

  //  if (list[0] < min || list[list.length - 1] > max)
  if (Math.min(...list) < min || Math.max(...list) > max) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.OUT_OF_RANGE,
    };
  }

  return { success: true };
}

function validateIntegerVal(val: any, { min, max }: { min: number, max: number }): ValueValidateResult<ValidateErrorCode> {
  if (!isInteger(val)) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.NOT_INTEGER,
    };
  }

  if (!isInRange(val, { min, max })) {
    return {
      success: false,
      code: VALIDATE_ERROR_CODE_MAP.OUT_OF_RANGE,
    };
  }

  return { success: true };
}

export function validateDay(day: any) {
  return validateIntegerVal(day, VALUE_RANGE_MAP.dayOfMonth);
}

export function validateDayOffset(offset: any) {
  return validateIntegerVal(offset, {
    min: VALUE_RANGE_MAP.dayOfMonth.min,
    max: VALUE_RANGE_MAP.dayOfMonth.max - 1,
  });
}

export function validateWeekday(weekday: any) {
  return validateIntegerVal(weekday, VALUE_RANGE_MAP.dayOfWeek);
}

export function validateWeekNth(weekNth: any) {
  return validateIntegerVal(weekNth, { min: 1, max: 5 });
}
