import type {
  CronField,
  CronFieldModel,
  LastDayOffsetModel,
  LastWeekdayOfMonthModel,
  ListModel,
  NearestWeekdayModel,
  NthWeekDayModel,
  RangeModel,
  StepModel,
} from '../types';
import type { ValidateErrorCode } from './constants';
import { CRON_FIELD_LIST, VALUE_RANGE_MAP } from './constants';
import {
  validateDay,
  validateDayOffset,
  validateList,
  validateRange,
  validateStep,
  validateWeekday,
  validateWeekNth,
} from './validate';

/**
 * 将指定时间单位的 Model 转换为表达式
 */
function fieldModel2Expression(cronField: CronField, fieldModel: CronFieldModel): {
  success: boolean
  data: string
  errors?: Array<ValidateErrorCode>
} {
  const mode = fieldModel.mode;
  const errors: Array<ValidateErrorCode> = [];

  if (mode === 'unspecified') {
    return { success: true, data: '?' };
  }

  if (mode === 'every') {
    return { success: true, data: '*' };
  }

  if (mode === 'range') {
    const { start = '', end = '' } = fieldModel as RangeModel;

    const validateResult = validateRange({ start, end, ...VALUE_RANGE_MAP[cronField] });
    if (!validateResult.success) {
      errors.push(validateResult.code);
    }

    return {
      success: errors.length === 0,
      data: `${start}-${end}`,
      errors,
    };
  }

  if (mode === 'step') {
    const { from = '', step = '' } = fieldModel as StepModel;

    const validateResult = validateStep({
      from,
      step,
      max: VALUE_RANGE_MAP[cronField].max,
      min: VALUE_RANGE_MAP[cronField].stepMin === undefined
        ? VALUE_RANGE_MAP[cronField].min
        : VALUE_RANGE_MAP[cronField].stepMin,
    });
    if (!validateResult.success) {
      errors.push(validateResult.code);
    }

    return {
      success: errors.length === 0,
      data: `${from}/${step}`,
      errors,
    };
  }

  if (mode === 'list') {
    const { values = [] } = fieldModel as ListModel;

    const list = [...values].sort((a, b) => a - b);

    const validateResult = validateList({ list, ...VALUE_RANGE_MAP[cronField] });
    if (!validateResult.success) {
      errors.push(validateResult.code);
    }

    return {
      success: errors.length === 0,
      data: list.join(','),
      errors,
    };
  }

  if (mode === 'nearestWeekday') {
    const { day = '' } = fieldModel as NearestWeekdayModel;

    const validateResult = validateDay(day);

    if (!validateResult.success) {
      errors.push(validateResult.code);
    }

    return {
      success: errors.length === 0,
      data: `${day}W`,
      errors,
    };
  }

  if (mode === 'lastDayOffset') {
    const { offset = '' } = fieldModel as LastDayOffsetModel;

    const validateResult = validateDayOffset(offset);

    if (!validateResult.success) {
      errors.push(validateResult.code);
    }

    return {
      success: errors.length === 0,
      data: `L-${offset}`,
      errors,
    };
  }

  if (mode === 'nthWeekOfMonth') {
    const { weekdayNth = '', weekNth = '' } = fieldModel as NthWeekDayModel;

    const validateResult = validateWeekNth(weekNth);

    if (!validateResult.success) {
      errors.push(validateResult.code);
    }

    const validateResult2 = validateWeekday(weekdayNth);

    if (!validateResult2.success && !errors.includes(validateResult2.code)) {
      errors.push(validateResult2.code);
    }

    return {
      success: errors.length === 0,
      data: `${weekdayNth}#${weekNth}`,
      errors,
    };
  }

  if (mode === 'lastDay') {
    return { success: true, data: 'L' };
  }

  if (mode === 'lastWeekdayOfMonth') {
    const { weekday = '' } = fieldModel as LastWeekdayOfMonthModel;

    const validateResult = validateWeekday(weekday);

    if (!validateResult.success) {
      errors.push(validateResult.code);
    }

    return {
      success: errors.length === 0,
      data: `${weekday}L`,
      errors,
    };
  }

  return { success: false, data: '' };
}

export function model2Expressions(model: Record<CronField, CronFieldModel>): {
  success: boolean
  data: string
  errors?: Array<ValidateErrorCode>
  cronField: CronField
  cronFieldLabel: string
}[] {
  return CRON_FIELD_LIST.map((item) => {
    return {
      ...fieldModel2Expression(item.value, model[item.value]),
      cronField: item.value,
      cronFieldLabel: item.label,
    };
  });
}

/**
 * 将完整的 Model 转换为表达式
 */
export function model2Expression(model: Record<CronField, CronFieldModel>) {
  return model2Expressions(model).map((item) => item.data).join(' ');
}
