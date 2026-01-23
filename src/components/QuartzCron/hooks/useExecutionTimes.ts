import type { MaybeRef } from 'vue';
import type { CronModel } from '../types';
import { ref, unref } from 'vue';
import { formatDate, getNextNTimes } from '../utils/time';

export function useExecutionTimes(cronModel: MaybeRef<CronModel>) {
  const startTime = ref(formatDate(new Date()).toString());

  const numExecutions = ref(5);
  const executionTimes = ref<Date[]>([]);
  const isCalculating = ref(false);

  function calculateExecutionTimes() {
    if (!startTime.value) {
      return;
    }
    isCalculating.value = true;
    try {
      executionTimes.value = getNextNTimes(new Date(startTime.value), unref(cronModel), numExecutions.value);
    }
    catch (error) {
      console.error('Error calculating execution times:', error);
      executionTimes.value = [];
    }
    finally {
      isCalculating.value = false;
    }
  }

  return {
    startTime,
    numExecutions,
    executionTimes,
    isCalculating,
    calculateExecutionTimes,
  };
}
