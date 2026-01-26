import type { CronField } from '../types';
import { computed, h, ref, watch } from 'vue';
import Time from '../components/Time.vue';
import { CRON_FIELD_LIST, DEFAULT_MODEL } from '../utils/constants';
import { model2Expressions } from '../utils/model-expression';

export function useModelUI(Component: typeof Time = Time) {
  const cronModel = ref(DEFAULT_MODEL());

  const tabs = computed<{
    label: string
    name: CronField
    component?: Record<string, any>
  }[]>(() => {
    return CRON_FIELD_LIST.map((item) => {
      return {
        label: item.label,
        name: item.value,
        component: h(Component, {
          cronField: item.value,
          modelValue: cronModel.value[item.value],
          'onUpdate:modelValue': (value) => {
            cronModel.value[item.value] = value;
          },
        }),
      };
    });
  });

  const activeField = ref(tabs.value[0].name);

  const expressions = computed(() => model2Expressions(cronModel.value));

  watch(
    () => cronModel.value.dayOfMonth.mode,
    (mode) => {
      if (mode !== 'unspecified') {
        cronModel.value.dayOfWeek.mode = 'unspecified';
      }
    },
    { immediate: true, deep: true },
  );

  watch(
    () => cronModel.value.dayOfWeek.mode,
    (mode) => {
      if (mode !== 'unspecified') {
        cronModel.value.dayOfMonth.mode = 'unspecified';
      }
    },
    { immediate: true, deep: true },
  );

  return {
    cronModel,
    activeField,
    tabs,
    expressions,
  };
}
