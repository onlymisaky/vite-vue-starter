export type CronField
  = | 'seconds'
    | 'minutes'
    | 'hours'
    | 'dayOfMonth'
    | 'month'
    | 'dayOfWeek'
    | 'year';

export type CronFieldMode
  = | 'every' // *
    | 'range' // 1-5
    | 'step' // */5 / 1/5
    | 'list' // 1,3,5
    | 'unspecified' // ?
    | 'lastDay' // L
    | 'lastDayOffset' // L-3
    | 'nearestWeekday' // 15W
    | 'nthWeekOfMonth' // 5#2
    | 'lastWeekdayOfMonth'; // 5L

/**********/

export interface EveryModel { mode: 'every' }

export interface RangeModel { mode: 'range', start: number, end: number }

export interface StepModel { mode: 'step', from: number, step: number }

export interface ListModel { mode: 'list', values: number[] }

export interface UnspecifiedModel { mode: 'unspecified' }

// 月末 : L
export interface LastDayModel { mode: 'lastDay' }

// 月末前第 3 天 : L-3 ，假设本月最后一天是 31 号， 则 L-3 为 28 号， 31-3=28
export interface LastDayOffsetModel { mode: 'lastDayOffset', offset: number }

// 距离 15 号最近的工作日 : 15W
export interface NearestWeekdayModel { mode: 'nearestWeekday', day: number }

// 每月的第二个星期四 : 5#2
export interface NthWeekDayModel { mode: 'nthWeekOfMonth', weekNth: number, weekdayNth: number }

export interface LastWeekdayOfMonthModel { mode: 'lastWeekdayOfMonth', weekday: number }

/**********/

export type CommonModel = EveryModel | RangeModel | StepModel | ListModel;
export type CronFieldModel = CommonModel | UnspecifiedModel | LastDayModel | LastDayOffsetModel | NearestWeekdayModel | NthWeekDayModel | LastWeekdayOfMonthModel;

/**********/

export interface CronModel {
  seconds: CommonModel
  minutes: CommonModel
  hours: CommonModel
  dayOfMonth: CommonModel | LastDayModel | LastDayOffsetModel | NearestWeekdayModel | UnspecifiedModel
  month: CommonModel
  dayOfWeek: EveryModel | RangeModel | ListModel | LastWeekdayOfMonthModel | NthWeekDayModel | UnspecifiedModel
  year: CommonModel
}

/**********/

export type ValueValidateResult<ErrorCode extends string = string> = { success: true } | { success: false, code: ErrorCode };

// 解析表达式中单个字段的结果
export type CronFieldExprParseResult<Data = CronFieldModel, ErrorCode extends string = string> = {
  success: true
  data: Data
} | {
  success: false
  code: ErrorCode
};

// 解析完整表达式的结果
export interface CronExprParseResult<ErrorCode extends string = string> {
  data?: Partial<CronModel>
  errors: Record<CronField | 'global', ErrorCode>
}

export interface CronFieldModelParseResult<ErrorCode extends string = string> {
  success: boolean
  data: string
  errors?: Array<ErrorCode>
}

export interface CronModelParseResult<ErrorCode extends string = string> {
  success: boolean
  data: string
  errors?: Array<ErrorCode>
}
