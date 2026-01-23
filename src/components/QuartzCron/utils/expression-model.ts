import type {
  CronExprParseResult,
  CronField,
  CronFieldExprParseResult,
  CronFieldModel,
  CronModel,
} from '../types';
import type { ValidateErrorCode } from './constants';
import {
  CRON_FIELD_LIST,
  MONTH_EN_MAP,
  VALIDATE_ERROR_CODE_MAP,
  VALUE_RANGE_MAP,
  WEEK_EN_MAP,
} from './constants';
import {
  isInRange,
  isInteger,
  validateDay,
  validateDayOffset,
  validateList,
  validateRange,
  validateStep,
  validateWeekday,
  validateWeekNth,
} from './validate';

function transformEnToNumber(value: string, cronField: CronField) {
  if (cronField === 'month') {
    return `${MONTH_EN_MAP[value as keyof typeof MONTH_EN_MAP] || value}`;
  }
  if (cronField === 'dayOfWeek') {
    return `${WEEK_EN_MAP[value as keyof typeof WEEK_EN_MAP] || value}`;
  }
  return value;
}

function parseCommonExpression(
  expr: string,
  { min, max, stepMin}: { min: number, max: number, stepMin?: number },
  cronField: CronField,
): CronFieldExprParseResult<CronFieldModel, ValidateErrorCode> {
  if (expr === '?' && ['dayOfMonth', 'dayOfWeek', 'year'].includes(cronField)) {
    return {
      success: true,
      data: { mode: 'unspecified' },
    };
  }

  if (expr === '*') {
    return {
      success: true,
      data: { mode: 'every' },
    };
  }

  if (expr.includes('-')) {
    let [start, end] = expr.split('-');
    start = transformEnToNumber(start, cronField);
    end = transformEnToNumber(end, cronField);

    const validateResult = validateRange({ start, end, min, max });

    if (!validateResult.success) {
      return validateResult;
    }

    return {
      success: true,
      data: {
        mode: 'range',
        start: Number(start),
        end: Number(end),
      },
    };
  }

  if (expr.includes('/') && cronField !== 'dayOfWeek') {
    const [from, step] = expr.split('/');

    const validateResult = validateStep({
      from: from === '*' ? VALUE_RANGE_MAP[cronField].min : from,
      step,
      min: stepMin === undefined ? min : stepMin,
      max,
    });

    if (!validateResult.success) {
      return validateResult;
    }

    return {
      success: true,
      data: {
        mode: 'step',
        from: from === '*' ? 0 : Number(from),
        step: Number(step),
      },
    };
  }

  if (expr.includes(',')) {
    const values = expr.split(',').map((v) => transformEnToNumber(v, cronField));

    const validateResult = validateList({ list: values, min, max });

    if (!validateResult.success) {
      return validateResult;
    }

    return {
      success: true,
      data: {
        mode: 'list',
        values: values.map((v) => Number(v)),
      },
    };
  }

  if (isInteger(expr)) {
    if (!isInRange(Number(expr), { min, max })) {
      return {
        success: false,
        code: VALIDATE_ERROR_CODE_MAP.OUT_OF_RANGE,
      };
    }

    return {
      success: true,
      data: {
        mode: 'list',
        values: [Number(expr)],
      },
    };
  }

  return {
    success: false,
    code: VALIDATE_ERROR_CODE_MAP.INVALID_VALUE,
  };
}

function parseDayOfMonthExpression(expr: string): CronFieldExprParseResult<CronModel['dayOfMonth'], ValidateErrorCode> {
  if (expr === 'L') {
    return { success: true, data: { mode: 'lastDay' } };
  }

  if (/^L-\d+$/.test(expr)) {
    const offset = Number(expr.slice(2));

    const validateResult = validateDayOffset(offset);

    if (!validateResult.success) {
      return validateResult;
    }

    return {
      success: true,
      data: { mode: 'lastDayOffset', offset },
    };
  }

  if (/^\d+W$/.test(expr)) {
    const day = Number(expr.replace('W', ''));

    const validateResult = validateDay(day);

    if (!validateResult.success) {
      return validateResult;
    }

    return {
      success: true,
      data: { mode: 'nearestWeekday', day },
    };
  }

  return parseCommonExpression(
    expr,
    VALUE_RANGE_MAP.dayOfMonth,
    'dayOfMonth',
  ) as { success: true, data: CronModel['dayOfMonth'] };
}

function parseDayOfWeekExpression(expr: string): CronFieldExprParseResult<CronModel['dayOfWeek'], ValidateErrorCode> {
  if (/^\d+L$/.test(expr)) {
    const weekday = Number(expr.replace('L', ''));

    const validateResult = validateWeekday(weekday);

    if (!validateResult.success) {
      return validateResult;
    }

    return {
      success: true,
      data: { mode: 'lastWeekdayOfMonth', weekday },
    };
  }

  if (/^\d+#\d+$/.test(expr)) {
    const [weekdayNthStr, weekNthStr] = expr.split('#');
    const weekdayNth = Number(weekdayNthStr);
    const weekNth = Number(weekNthStr);

    const validateResult = validateWeekNth(weekNth);

    if (!validateResult.success) {
      return validateResult;
    }

    const validateResult2 = validateWeekday(weekdayNth);

    if (!validateResult2.success) {
      return validateResult2;
    }

    return {
      success: true,
      data: {
        mode: 'nthWeekOfMonth',
        weekdayNth,
        weekNth,
      },
    };
  }

  return parseCommonExpression(
    expr,
    VALUE_RANGE_MAP.dayOfWeek,
    'dayOfWeek',
  ) as { success: true, data: CronModel['dayOfWeek'] };
}

export function expression2Model(expr: string): CronExprParseResult<ValidateErrorCode> {
  if (typeof expr !== 'string') {
    return {
      errors: {
        global: VALIDATE_ERROR_CODE_MAP.NOT_STRING,
      } as Record<CronField | 'global', ValidateErrorCode>,
    };
  }

  if (expr.trim() === '') {
    return {
      errors: {
        global: VALIDATE_ERROR_CODE_MAP.EMPTY,
      } as Record<CronField | 'global', ValidateErrorCode>,
    };
  }

  const parts = expr.trim().split(/\s+/);

  // 表达式必须是6个或7个字段
  if (parts.length < 6 || parts.length > 7) {
    return {
      errors: {
        global: VALIDATE_ERROR_CODE_MAP.LENGTH_ERROR,
      } as Record<CronField | 'global', ValidateErrorCode>,
    };
  }

  // 如果是6个字段，添加默认的年字段为 every
  if (parts.length === 6) {
    parts.push('*');
  }

  const errors = {} as Record<CronField | 'global', ValidateErrorCode>;
  const model: Record<CronField, CronFieldModel> = {} as Record<CronField, CronFieldModel>;

  for (let index = 0; index < CRON_FIELD_LIST.length; index++) {
    const exprItem = parts[index];
    const cronField = CRON_FIELD_LIST[index].value;

    if (exprItem === '') {
      errors[cronField] = VALIDATE_ERROR_CODE_MAP.EMPTY;
      continue;
    }

    if (cronField === 'dayOfMonth') {
      const result = parseDayOfMonthExpression(exprItem);
      if (!result.success) {
        errors[cronField] = result.code;
        continue;
      }
      model[cronField] = result.data;
      continue;
    }

    if (cronField === 'dayOfWeek') {
      if (model.dayOfMonth && model.dayOfMonth.mode !== 'unspecified' && exprItem !== '?') {
        errors[cronField] = VALIDATE_ERROR_CODE_MAP.DAY_WEEK_CONFLICT;
        continue;
      }
      const result = parseDayOfWeekExpression(exprItem);
      if (!result.success) {
        errors[cronField] = result.code;
        continue;
      }
      model[cronField] = result.data;
      continue;
    }

    const result = parseCommonExpression(exprItem, VALUE_RANGE_MAP[cronField], cronField);
    if (!result.success) {
      errors[cronField] = result.code;
      continue;
    }
    model[cronField] = result.data;
    continue;
  }

  return { data: model as CronModel, errors };
}
