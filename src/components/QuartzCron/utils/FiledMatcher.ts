import type { CommonModel, CronField, CronModel } from '../types';
import { VALUE_RANGE_MAP } from './constants';

/**
 * 获取指定年月 最后一天 的日期
 * @param year
 * @param monthIndex 0-11
 * @returns 1-31
 */
function getLastDay(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

/**
 * 获取指定年月日 最近的工作日 的日期
 * @param year
 * @param monthIndex 0-11
 * @param day 1-31
 * @returns 1-31
 */
function getNearestWeekday(year: number, monthIndex: number, day: number): number {
  const d = new Date(year, monthIndex, day);
  const weekday = d.getDay();
  // 周六
  if (weekday === 6) {
    // 下周一或本周五
    return day === 1 ? 3 : day - 1;
  }
  // 周日
  if (weekday === 0) {
    // 本周五或下周一
    return day === getLastDay(year, monthIndex) ? day - 2 : day + 1;
  }
  return day;
}

/**
 * 获取指定年月 第N个周几 的日期
 * @param year
 * @param monthIndex 0-11
 * @param weekNth 1-5
 * @param weekday 0-6 周日到周六
 * @returns 1-31 或 null ，如果该月份不存在 第N个周几 ，则返回 null ，比如 2025.02 第5个周六 就不存在
 */
function getNthWeekdayOfMonth(year: number, monthIndex: number, weekNth: number, weekday: number) {
  const firstDay = new Date(year, monthIndex, 1);
  // 找到当月第一天的星期
  const firstWeekday = firstDay.getDay() + 1;
  // 计算到目标星期的偏移
  const delta = (weekday - firstWeekday + 7) % 7;
  // 加上 (N-1) 周的偏移
  const day = 1 + delta + (weekNth - 1) * 7;
  // 若计算结果超过当月最后一天，则表示该月份不存在第 N 个该星期，返回 -1
  return day <= getLastDay(year, monthIndex) ? day : null;
}

/**
 * 获取指定年月 最后一个周几 的日期
 * @param year
 * @param monthIndex 0-11
 * @param weekday 0-6 周日到周六
 * @returns 1-31
 */
function getLastWeekdayOfMonth(year: number, monthIndex: number, weekday: number): number {
  const lastDay = getLastDay(year, monthIndex);
  for (let d = lastDay; d >= 1; d--) {
    if (new Date(year, monthIndex, d).getDay() + 1 === weekday)
      return d;
  }
  return -1;
}

/**
 * 在上级时间确定的前提下，根据 fieldModel 获取第一个符合条件的值
 * @param fieldModel Cron 表达式的字段模型
 * @param min 字段的最小值
 * @param date 当前日期
 * @returns 第一个符合条件的值
 *  由于上级时间确定，指定的日期内的  nthWeekOfMonth 可能不存在，比如 2025.02 第5个周六 就不存在
 *  所以该函数可能也会返回 null
 */
function getFirstValidValue(fieldModel: CronModel[CronField], min: number, date: Date) {
  const year = date.getFullYear();
  const monthIndex = date.getMonth();

  switch (fieldModel.mode) {
    case 'every': return min;
    case 'range': return fieldModel.start;
    case 'step': return fieldModel.from;
    case 'list': return Math.min(...fieldModel.values);
    case 'lastDay': {
      const lastDay = getLastDay(year, monthIndex);
      return lastDay;
    }
    case 'lastDayOffset': {
      const lastDay = getLastDay(year, monthIndex);
      return lastDay - fieldModel.offset;
    }
    case 'nearestWeekday': {
      const nearestWeekday = getNearestWeekday(year, monthIndex, fieldModel.day);
      return nearestWeekday;
    }
    case 'nthWeekOfMonth': {
      const nthWeekday = getNthWeekdayOfMonth(year, monthIndex, fieldModel.weekNth, fieldModel.weekdayNth);
      return nthWeekday;
    }
    case 'lastWeekdayOfMonth': {
      const lastWeekday = getLastWeekdayOfMonth(year, monthIndex, fieldModel.weekday);
      return lastWeekday;
    }
    default: return null;
  }
}

/**
 * 根据给定的 value 和 fieldModel，判断 value 是否匹配
 * @param value 要匹配的值
 * @param model Cron 表达式的字段模型
 * @returns 是否匹配
 */
function commonMatch(value: number, model: CommonModel): boolean {
  switch (model.mode) {
    case 'every': return true;
    case 'range': return value >= model.start && value <= model.end;
    case 'step': return value >= model.from && (value - model.from) % model.step === 0;
    case 'list': return model.values.includes(value);
    default: return false;
  }
}

/**
 * 根据给定的 currentValue 和 fieldModel，获取下一个符合条件的值
 * @param currentValue 当前值
 * @param model Cron 表达式的字段模型
 * @param max 字段的最大值
 * @param min 字段的最小值，传入该值则表示在下一个值超过最大值时，允许循环到下个周期的最小值，否则返回 null
 * @returns 下一个符合条件的值，如果超过最大值则返回 null
 */
function commonNext(currentValue: number, model: CommonModel, max: number, min: number | null = null) {
  switch (model.mode) {
    case 'every': {
      const next = currentValue + 1;
      return next <= max ? next : min;
    }
    case 'range': {
      if (currentValue < model.start) {
        return model.start;
      }
      return currentValue < model.end ? currentValue + 1 : min;
    }
    case 'step': {
      const { from, step } = model;

      if (currentValue >= max) {
        return min === null ? null : from;
      }

      for (let next = from; next <= max; next += step) {
        if (next > currentValue) {
          return next;
        }
      }

      return min === null ? null : from;
    }
    case 'list': {
      const sorted = [...model.values].sort((a, b) => a - b);
      for (const v of sorted) {
        if (v > currentValue) {
          return v;
        }
      }
      return min === null ? null : sorted[0];
    }
    default: return null;
  }
}

interface IFieldMatcher {
  match: () => boolean
  next: () => number | null
}

type PickFnNames<T extends object> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? K extends string ? K : never : never
}[keyof T];

type StartWith<Str extends string, Prefix extends string> = Str extends `${Prefix}${string}` ? Str : never;

const DATE_UNIT_LIST = ['year', 'month', 'day', 'hours', 'minutes', 'seconds'] as const;

type DateUnit = typeof DATE_UNIT_LIST[number];

const DATE_API_MAP: Record<DateUnit, {
  get: StartWith<PickFnNames<Date>, 'get'>
  set: StartWith<PickFnNames<Date>, 'set'>
  delta?: number
}> = {
  seconds: { get: 'getSeconds', set: 'setSeconds' },
  minutes: { get: 'getMinutes', set: 'setMinutes' },
  hours: { get: 'getHours', set: 'setHours' },
  day: { get: 'getDate', set: 'setDate' },
  /**
   * setMonth(1) 将月份设置为 2 月
   * 但在 Quartz 中，1 表示 1 月
   * 所以在使用 setMonth 时，应该写为 setMonth(value - delta)
   */
  month: { get: 'getMonth', set: 'setMonth', delta: 1 },
  year: { get: 'getFullYear', set: 'setFullYear' },
} as const;

function getCronFieldByUnit(unit: DateUnit, cronModel: CronModel): CronField {
  if (unit !== 'day') {
    return unit;
  }
  return cronModel.dayOfWeek.mode === 'unspecified' ? 'dayOfMonth' : 'dayOfWeek';
}

const CRON_FIELD_DATE_UNIT_MAP: Record<CronField, DateUnit> = {
  seconds: 'seconds',
  minutes: 'minutes',
  hours: 'hours',
  dayOfMonth: 'day',
  month: 'month',
  dayOfWeek: 'day',
  year: 'year',
} as const;

const CRON_FIELD_API_MAP: Record<CronField, {
  get: StartWith<PickFnNames<Date>, 'get'>
  delta?: number
}> = {
  seconds: { get: 'getSeconds' },
  minutes: { get: 'getMinutes' },
  hours: { get: 'getHours' },
  dayOfMonth: { get: 'getDate' },
  month: { get: 'getMonth', delta: 1 },
  /**
   * getDay() 返回的 value 为 0 星期日，1 星期一
   * 但在 Quartz 中，1 表示 星期日，2 表示 星期一
   * 所以在使用 getDay 时，应该写为 getDay() + delta
   */
  dayOfWeek: { get: 'getDay', delta: 1 },
  year: { get: 'getFullYear' },
} as const;

export class FiledMatcher implements IFieldMatcher {
  constructor(public date: Date, public cronModel: CronModel, public cronField: CronField) { }

  private get unit() {
    return CRON_FIELD_DATE_UNIT_MAP[this.cronField];
  }

  match() {
    const cronField = this.cronField;
    const get = CRON_FIELD_API_MAP[cronField].get;
    const delta = CRON_FIELD_API_MAP[cronField].delta || 0;
    const date = this.date;

    switch (cronField) {
      case 'seconds':
      case 'minutes':
      case 'hours':
      case 'month':
      case 'year': {
        const value = date[get]() + delta;
        const fieldModel = this.cronModel[cronField];
        const match = commonMatch(value, fieldModel);
        return match;
      }

      case 'dayOfMonth':
      case 'dayOfWeek': {
        const value = date[get]() + delta;
        const fieldModel = this.cronModel[cronField];
        const match = commonMatch(value, fieldModel as CommonModel);

        if (match)
          return true;

        const year = date.getFullYear();
        const monthIndex = date.getMonth();
        const day = date.getDate();

        if (cronField === 'dayOfMonth' && fieldModel.mode !== 'unspecified') {
          switch (fieldModel.mode) {
            case 'lastDay': {
              const d = getLastDay(year, monthIndex);
              return day === d;
            }
            case 'lastDayOffset': {
              const d = getLastDay(year, monthIndex);
              return day === d - fieldModel.offset;
            }
            case 'nearestWeekday': {
              const d = getNearestWeekday(year, monthIndex, fieldModel.day);
              return day === d;
            }
            default: return false;
          }
        }

        if (cronField === 'dayOfWeek' && fieldModel.mode !== 'unspecified') {
          switch (fieldModel.mode) {
            case 'nthWeekOfMonth': {
              const d = getNthWeekdayOfMonth(year, monthIndex, fieldModel.weekNth, fieldModel.weekdayNth);
              return day === d;
            }
            case 'lastWeekdayOfMonth': {
              const d = getLastWeekdayOfMonth(year, monthIndex, fieldModel.weekday);
              return day === d;
            }
            default: return false;
          }
        }

        return false;
      }
      default: return false;
    }
  }

  next() {
    const cronField = this.cronField;
    const date = this.date;
    let max = VALUE_RANGE_MAP[cronField].max;

    if (['dayOfMonth'].includes(cronField)) {
      max = getLastDay(date.getFullYear(), date.getMonth());
    }

    switch (cronField) {
      case 'seconds':
      case 'minutes':
      case 'hours':
      case 'month':
      case 'year': {
        const get = CRON_FIELD_API_MAP[cronField].get;
        const delta = CRON_FIELD_API_MAP[cronField].delta || 0;

        const currentValue = date[get]() + delta;
        const fieldModel = this.cronModel[cronField];
        const next = commonNext(currentValue, fieldModel, max);
        return next;
      }
      case 'dayOfMonth': {
        const currentDate = date.getDate();
        const fieldModel = this.cronModel[cronField];
        const nextDate = commonNext(currentDate, fieldModel as CommonModel, max);

        if (nextDate !== null) {
          return nextDate;
        }

        const year = date.getFullYear();
        const monthIndex = date.getMonth();
        const day = date.getDate();

        switch (fieldModel.mode) {
          case 'lastDay': {
            const lastDay = getLastDay(year, monthIndex);
            if (lastDay <= day) {
              return null;
            }
            return lastDay;
          }
          case 'lastDayOffset': {
            const lastDay = getLastDay(year, monthIndex);
            const result = lastDay - fieldModel.offset;
            if (result <= day) {
              return null;
            }
            return result;
          }
          case 'nearestWeekday': {
            const nearestWeekday = getNearestWeekday(year, monthIndex, fieldModel.day);
            if (nearestWeekday <= day) {
              return null;
            }
            return nearestWeekday;
          }
          default: return null;
        }
      }
      case 'dayOfWeek': {
        const year = date.getFullYear();
        const monthIndex = date.getMonth();
        const day = date.getDate();

        const fieldModel = this.cronModel[cronField];

        switch (fieldModel.mode) {
          case 'every':
          case 'range':
          case 'list': {
            const currentWeekday = date.getDay() + 1;
            const currentDate = date.getDate();
            const lastD = getLastDay(year, monthIndex);
            const min = VALUE_RANGE_MAP[cronField].min;
            const nextWeek = commonNext(currentWeekday, fieldModel as CommonModel, max, min) as number;
            const n = nextWeek - currentWeekday;
            const days = n <= 0 ? 7 + n : n;
            const nextDate = currentDate + days;
            if (nextDate > lastD) {
              return null;
            }
            if (nextDate <= day) {
              return null;
            }
            return nextDate;
          }
          case 'nthWeekOfMonth': {
            const d = getNthWeekdayOfMonth(year, monthIndex, fieldModel.weekNth, fieldModel.weekdayNth);
            if (d === null) {
              return null;
            }
            if (d <= day) {
              return null;
            }
            return d;
          }
          case 'lastWeekdayOfMonth': {
            const d = getLastWeekdayOfMonth(year, monthIndex, fieldModel.weekday);
            if (d === null) {
              return null;
            }
            if (d <= day) {
              return null;
            }
            return d;
          }
          default: return null;
        }
      }
      default: return null;
    }
  }

  resetSelfDate() {
    const unit = this.unit;
    const date = this.date;
    const cronField = this.cronField;

    const set = DATE_API_MAP[unit].set;
    const delta = DATE_API_MAP[unit].delta || 0;
    const min = VALUE_RANGE_MAP[cronField].min;
    date[set](min - delta);
  }

  /**
   * 重置当前单位后续所有单位的日期为最小值
   */
  resetBelowDate() {
    const unit = this.unit;
    const date = this.date;
    const cronModel = this.cronModel;

    const unitIndex = DATE_UNIT_LIST.indexOf(unit);
    for (let i = unitIndex + 1; i < DATE_UNIT_LIST.length; i++) {
      const lowerUnit = DATE_UNIT_LIST[i];

      const lowerCronField = getCronFieldByUnit(lowerUnit, cronModel);

      // const firstValidValue = getFirstValidValue(
      //   cronModel[lowerCronField],
      //   VALUE_RANGE_MAP[lowerCronField].min,
      //   date,
      // );

      const firstValidValue = VALUE_RANGE_MAP[lowerCronField].min;

      if (firstValidValue !== null) {
        const set = DATE_API_MAP[lowerUnit].set;
        const delta = DATE_API_MAP[lowerUnit].delta || 0;
        date[set](firstValidValue - delta);
      }
    }
  }

  /**
   * 将当前单位上一级日期往前推进1
   * 需要特别注意:
   *      2025.01.30 === 月份向前推进1 === 2025.02.30，
   *      但 2025.02.30 不是一个有效日期，Date 会自动调整为 2025.03.02
   *      所以请先重置后续单位为最小值，再推进1
   */
  advanceHigherUnitDate() {
    const unit = this.unit;
    const unitIndex = DATE_UNIT_LIST.indexOf(unit);
    const higherUnit = DATE_UNIT_LIST[unitIndex - 1];
    const date = this.date;

    const get = DATE_API_MAP[higherUnit].get;
    const set = DATE_API_MAP[higherUnit].set;
    const value = date[get]() + 1;
    date[set](value);
  }

  setToNextValidDate(nextValue: number | null) {
    const cronField = this.cronField;
    const fieldModel = this.cronModel[cronField];
    const min = VALUE_RANGE_MAP[cronField].min;
    const date = this.date;
    const unit = this.unit;

    let next = nextValue;
    if (next === null) {
      next = getFirstValidValue(fieldModel, min, date);
    }
    if (next !== null) {
      const set = DATE_API_MAP[unit].set;
      const delta = DATE_API_MAP[unit].delta || 0;
      date[set](next - delta);
    }
  }
}
