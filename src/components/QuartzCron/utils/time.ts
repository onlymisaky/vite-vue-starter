import type { CronField, CronModel } from '../types';
import { FiledMatcher } from './FiledMatcher';

export function formatDate(date: Date) {
  const yyyy = date.getFullYear();
  const MM = (`0${date.getMonth() + 1}`).slice(-2);
  const DD = (`0${date.getDate()}`).slice(-2);
  const HH = (`0${date.getHours()}`).slice(-2);
  const mm = (`0${date.getMinutes()}`).slice(-2);
  const ss = (`0${date.getSeconds()}`).slice(-2);
  return { yyyy, MM, DD, HH, mm, ss, toString() {
    return `${yyyy}-${MM}-${DD} ${HH}:${mm}:${ss}`;
  } };
}

export function getNextNTimes(afterDate: Date, cronModel: CronModel, n: number): Date[] {
  const dateCursor = new Date(afterDate.getTime() + 1000);

  const results: Date[] = [];

  const cronFields: CronField[] = ['year', 'month', 'dayOfMonth', 'dayOfWeek', 'hours', 'minutes', 'seconds'];
  const matchers = cronFields.map((cronField) => new FiledMatcher(dateCursor, cronModel, cronField));

  while (results.length < n) {
    let match = true;
    for (const matcher of matchers) {
      if (matcher.cronField === 'dayOfMonth' && cronModel.dayOfMonth.mode === 'unspecified') {
        continue;
      }

      if (matcher.cronField === 'dayOfWeek' && cronModel.dayOfWeek.mode === 'unspecified') {
        continue;
      }

      if (!matcher.match()) {
        match = false;
        const nextValue = matcher.next();
        if (nextValue === null && matcher.cronField === 'year') {
          return results;
        }
        matcher.resetBelowDate();
        if (nextValue === null) {
          matcher.resetSelfDate();
          matcher.advanceHigherUnitDate();
        }
        matcher.setToNextValidDate(nextValue);
        break;
      }
    }

    if (!match) {
      continue;
    }

    results.push(new Date(dateCursor));

    dateCursor.setSeconds(dateCursor.getSeconds() + 1);
  }

  return results;
}

/**
 * 1. [ 0 0 0 28-31 * ? * ] 会跳过 2 月所有天数
 * 2. [ 0 0 0 15W * ? * ] 获取的日期有问题，完全一样
 * 3. [ 0 0 0 L-10 * ? * ] 获取的日期有问题，完全一样
 * 4. [ 0 0 0 ? * 1,7 * ] 结果不对
 * 5. [ 0 0/30 9-17 * * ? ]
 */
