import type {
  CronField,
  CronFieldMode,
  CronFieldModel,
} from '../types';

export const WEEK_EN_MAP = { SUN: 1, MON: 2, TUE: 3, WED: 4, THU: 5, FRI: 6, SAT: 7 } as const;
export const MONTH_EN_MAP = { JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6, JUL: 7, AUG: 8, SEP: 9, OCT: 10, NOV: 11, DEC: 12 } as const;

export const WEEK_LIST = [
  { label: '周日', value: 1 },
  { label: '周一', value: 2 },
  { label: '周二', value: 3 },
  { label: '周三', value: 4 },
  { label: '周四', value: 5 },
  { label: '周五', value: 6 },
  { label: '周六', value: 7 },
];

// every range step 显示的单位
export const CRON_FIELD_UNIT_MAP: Record<CronField, string> = {
  seconds: '秒',
  minutes: '分',
  hours: '时',
  dayOfMonth: '日',
  month: '月',
  dayOfWeek: '周',
  year: '年',
} as const;

// step 间隔单位
export const STEP_UNIT_MAP: Record<CronField, string> = {
  seconds: '秒',
  minutes: '分',
  hours: '小时',
  dayOfMonth: '天',
  month: '月',
  dayOfWeek: '周',
  year: '年',
} as const;

// seconds minutes hours
export const SECONDS_MODE_LIST: Array<{ value: CronFieldMode, label?: string } | CronFieldMode> = [
  'every',
  'range',
  'step',
  'list',
] as const;

export const DAY_OF_MONTH_MODE_LIST: Array<{ value: CronFieldMode, label?: string } | CronFieldMode> = [
  { value: 'every', label: `每${CRON_FIELD_UNIT_MAP.dayOfMonth}` },
  { value: 'unspecified', label: '不指定' },
  'range',
  'step',
  'nearestWeekday',
  { value: 'lastDay', label: '月最后一天' },
  'lastDayOffset',
  'list',
] as const;

export const MONTH_MODE_LIST: Array<{ value: CronFieldMode, label?: string } | CronFieldMode> = [
  { value: 'every', label: `每${CRON_FIELD_UNIT_MAP.month}` },
  'range',
  'step',
  'list',
] as const;

export const DAY_OF_WEEK_MODE_LIST: Array<{ value: CronFieldMode, label?: string } | CronFieldMode> = [
  { value: 'every', label: `每${CRON_FIELD_UNIT_MAP.dayOfWeek}` },
  { value: 'unspecified', label: '不指定' },
  'range',
  'nthWeekOfMonth',
  'lastWeekdayOfMonth',
  'list',
] as const;

export const YEAR_MODE_LIST: Array<{ value: CronFieldMode, label?: string } | CronFieldMode> = [
  { value: 'every', label: `每${CRON_FIELD_UNIT_MAP.year}` },
  'range',
  'step',
  'list',
] as const;

export const VALUE_RANGE_MAP: Record<CronField, { min: number, max: number, stepMin?: number }> = {
  seconds: { min: 0, max: 59 },
  minutes: { min: 0, max: 59 },
  hours: { min: 0, max: 23 },
  dayOfMonth: { min: 1, max: 31 },
  /**
   * Date: 0-11
   * Quartz: 1-12
   */
  month: { min: 1, max: 12 },
  /**
   * Date: 周日为 0，周六为 6
   * Quartz: 周日为 1，周六为 7
   */
  dayOfWeek: { min: 1, max: 7 },
  year: { min: 1970, stepMin: 1, max: 2099 },
} as const;

export const VALUE_LIST_COUNT_MAP: Record<CronField, number> = Object
  .keys(VALUE_RANGE_MAP)
  .reduce((prev, cur) => {
    const key = cur as CronField;
    return {
      ...prev,
      [key]: VALUE_RANGE_MAP[key].max - VALUE_RANGE_MAP[key].min + 1,
    };
  }, {} as Record<CronField, number>);

export const YEAR_LIST = Array.from({ length: VALUE_RANGE_MAP.year.max - new Date().getFullYear() + 1 }, (_, i) => ({
  label: `${new Date().getFullYear() + i}`,
  value: new Date().getFullYear() + i,
}));

export const CRON_FIELD_LIST: { label: string, value: CronField }[] = [
  { label: '秒', value: 'seconds' },
  { label: '分', value: 'minutes' },
  { label: '时', value: 'hours' },
  { label: '日', value: 'dayOfMonth' },
  { label: '月', value: 'month' },
  { label: '周', value: 'dayOfWeek' },
  { label: '年', value: 'year' },
] as const;

export function DEFAULT_MODEL() {
  return CRON_FIELD_LIST.reduce((prev, cur) => {
    return {
      ...prev,
      [cur.value]: { mode: ['dayOfWeek'].includes(cur.value) ? 'unspecified' : 'every' },
    };
  }, {} as Record<CronField, CronFieldModel>);
}

export const VALIDATE_ERROR_CODE_MAP = {
  NOT_STRING: 'NOT_STRING',
  EMPTY: 'EMPTY',
  LENGTH_ERROR: 'LENGTH_ERROR',
  INVALID_VALUE: 'INVALID_VALUE',
  NOT_INTEGER: 'NOT_INTEGER',
  OUT_OF_RANGE: 'OUT_OF_RANGE',
  START_GREATER_THAN_END: 'START_GREATER_THAN_END',
  NOT_LIST: 'NOT_LIST',
  LIST_LENGTH_EXCEEDED: 'LIST_LENGTH_EXCEEDED',
  LIST_EMPTY: 'LIST_EMPTY',
  LIST_NOT_SORTED: 'LIST_NOT_SORTED',
  DAY_WEEK_CONFLICT: 'DAY_WEEK_CONFLICT',
} as const;

export type ValidateErrorCode = keyof typeof VALIDATE_ERROR_CODE_MAP;

export const VALIDATE_ERROR_MESSAGE_MAP = {
  [VALIDATE_ERROR_CODE_MAP.NOT_STRING]: '表达式必须是字符串',
  [VALIDATE_ERROR_CODE_MAP.LENGTH_ERROR]: '表达式长度错误',
  [VALIDATE_ERROR_CODE_MAP.EMPTY]: '值不能为空',
  [VALIDATE_ERROR_CODE_MAP.INVALID_VALUE]: '无效值',
  [VALIDATE_ERROR_CODE_MAP.NOT_INTEGER]: '不是整数',
  [VALIDATE_ERROR_CODE_MAP.OUT_OF_RANGE]: '不在范围内',
  [VALIDATE_ERROR_CODE_MAP.START_GREATER_THAN_END]: '开始值不能大于或等于结束值',
  [VALIDATE_ERROR_CODE_MAP.NOT_LIST]: '不是列表',
  [VALIDATE_ERROR_CODE_MAP.LIST_LENGTH_EXCEEDED]: '列表长度超出',
  [VALIDATE_ERROR_CODE_MAP.LIST_EMPTY]: '列表不能为空',
  [VALIDATE_ERROR_CODE_MAP.LIST_NOT_SORTED]: '不是有序的列表',
  [VALIDATE_ERROR_CODE_MAP.DAY_WEEK_CONFLICT]: '日和周冲突，不能同时指定',
};
