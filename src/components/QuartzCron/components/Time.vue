<script setup lang="ts">
import type { CronField, CronFieldModel, LastDayOffsetModel, LastWeekdayOfMonthModel, ListModel, NearestWeekdayModel, NthWeekDayModel, RangeModel, StepModel } from '../types';
import { computed, useTemplateRef } from 'vue';
import { usePickModelValue } from '../hooks/usePickModelValue';
import {
  CRON_FIELD_UNIT_MAP,
  DAY_OF_MONTH_MODE_LIST,
  DAY_OF_WEEK_MODE_LIST,
  MONTH_MODE_LIST,
  SECONDS_MODE_LIST,
  STEP_UNIT_MAP,
  VALUE_LIST_COUNT_MAP,
  VALUE_RANGE_MAP,
  WEEK_LIST,
  YEAR_LIST,
  YEAR_MODE_LIST,
} from '../utils/constants';
import List from './FieldControl/List.vue';
import InputNumberRange from './FieldControl/Range/InputNumberRange.vue';
import Step from './FieldControl/Step.vue';
import FieldModeRadioGroup from './FieldModeRadioGroup.vue';

type ModeOptions = InstanceType<typeof FieldModeRadioGroup>['$props']['modeOptions'];

const props = defineProps<{
  modelValue: CronFieldModel
  cronField?: CronField
}>();

const emits = defineEmits<{
  (e: 'update:modelValue', value: CronFieldModel): void
}>();

const cronFieldLabel = computed(() => {
  return CRON_FIELD_UNIT_MAP[props.cronField || 'seconds'];
});

const stepUnitLabel = computed(() => {
  return STEP_UNIT_MAP[props.cronField || 'seconds'];
});

const modeOptions = computed<ModeOptions>(() => {
  if (['seconds', 'minutes', 'hours'].includes(props.cronField || 'seconds')) {
    return SECONDS_MODE_LIST.map((item) => {
      if ((typeof item === 'object' && item.value === 'every')) {
        return {
          ...item,
          label: item.label || `每${cronFieldLabel.value}`,
        };
      }
      if (item === 'every') {
        return {
          value: item,
          label: `每${cronFieldLabel.value}`,
        };
      }
      return item;
    });
  }
  else if (props.cronField === 'dayOfMonth') {
    return DAY_OF_MONTH_MODE_LIST;
  }
  else if (props.cronField === 'month') {
    return MONTH_MODE_LIST;
  }
  else if (props.cronField === 'dayOfWeek') {
    return DAY_OF_WEEK_MODE_LIST;
  }
  else if (props.cronField === 'year') {
    return YEAR_MODE_LIST;
  }

  return [];
});

const max = computed(() => {
  return VALUE_RANGE_MAP[props.cronField || 'seconds'].max;
});

const min = computed(() => {
  return VALUE_RANGE_MAP[props.cronField || 'seconds'].min;
});

const lineBreak = computed(() => {
  if (['seconds', 'minutes'].includes(props.cronField || 'seconds')) {
    return (index: number) => {
      return index > 1 && (index + 1) % 10 === 0;
    };
  }
  if (props.cronField === 'hours') {
    return (index: number) => {
      return index === 11;
    };
  }
  if (props.cronField === 'month') {
    return (index: number) => {
      return index === 5;
    };
  }
  if (props.cronField === 'dayOfMonth') {
    return (index: number) => {
      return (index + 1) % 10 === 0;
    };
  }

  if (props.cronField === 'year') {
    return (index: number) => {
      return (index + 1) % 10 === 0;
    };
  }

  return (_index: number) => false;
});

const fieldMode = usePickModelValue<CronFieldModel>(props, 'mode', emits);

const rangeStart = usePickModelValue<RangeModel, number>(props, 'start', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const rangeEnd = usePickModelValue<RangeModel, number>(props, 'end', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const stepStart = usePickModelValue<StepModel, number>(props, 'from', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const stepValue = usePickModelValue<StepModel, number>(props, 'step', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const dayValue = usePickModelValue<NearestWeekdayModel, number>(props, 'day', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const lastOffsetValue = usePickModelValue<LastDayOffsetModel, number>(props, 'offset', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const weekdayNthValue = usePickModelValue<NthWeekDayModel, number>(props, 'weekdayNth', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const weekNthValue = usePickModelValue<NthWeekDayModel, number>(props, 'weekNth', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const weekdayValue = usePickModelValue<LastWeekdayOfMonthModel, number>(props, 'weekday', emits, (val) => {
  const n = Number(val);
  return (Number.isNaN(n) ? '' : n) as number;
});

const listValue = usePickModelValue<ListModel, number[]>(props, 'values', emits, (val) => {
  return Array.isArray(val) ? val : [];
});

const listOptions = computed(() => {
  if (props.cronField === 'dayOfWeek') {
    return WEEK_LIST;
  }
  if (props.cronField === 'year') {
    return YEAR_LIST;
  }
  return Array.from({
    length: VALUE_LIST_COUNT_MAP[props.cronField || 'seconds'],
  }, (_, i) => {
    const value = i + min.value;
    return {
      label: value < 10 ? `0${value}` : `${value}`,
      value,
    };
  });
});

const listRef = useTemplateRef('listRef');
</script>

<template>
  <FieldModeRadioGroup
    v-model="fieldMode"
    :mode-options="modeOptions"
  >
    <template #range>
      <div class="flex items-center gap-x-[4px]">
        <span>区间</span>
        <span>从</span>
        <template v-if="cronField !== 'dayOfWeek'">
          <InputNumberRange
            v-model:start="rangeStart"
            v-model:end="rangeEnd"
            :max="max"
            :min="min"
            :disabled="fieldMode !== 'range'"
          >
            <template #separator>
              <span>{{ cronFieldLabel }}到</span>
            </template>
          </InputNumberRange>
          <span>{{ cronFieldLabel }}</span>
        </template>
        <template v-else>
          <SelectRange
            v-model:start="rangeStart"
            v-model:end="rangeEnd"
            class="w-auto"
            :disabled="fieldMode !== 'range'"
            :options="WEEK_LIST"
          >
            <template #separator>
              <span>到</span>
            </template>
          </SelectRange>
        </template>
      </div>
    </template>
    <template #step>
      <div class="flex items-center gap-x-[4px]">
        <span>循环</span>
        <span>从</span>
        <Step
          v-model:start="stepStart"
          v-model:step="stepValue"
          :max="max"
          :min="min"
          :disabled="fieldMode !== 'step'"
        >
          <template #separator>
            <span>{{ cronFieldLabel }}开始，间隔</span>
          </template>
        </Step>
        <span>{{ stepUnitLabel }}</span>
      </div>
    </template>
    <template #nearestWeekday>
      <div class="flex items-center gap-x-[4px]">
        <span>距离</span>
        <ElInputNumber
          v-model="dayValue"
          controls-position="right"
          :max="31"
          :min="1"
          :disabled="fieldMode !== 'nearestWeekday'"
        />
        <span>号最近的工作日</span>
      </div>
    </template>
    <template #lastDayOffset>
      <div class="flex items-center gap-x-[4px]">
        <span>月末前</span>
        <ElInputNumber
          v-model="lastOffsetValue"
          controls-position="right"
          :max="30"
          :min="1"
          :disabled="fieldMode !== 'lastDayOffset'"
        />
        <span>天(不包括最后一天)</span>
      </div>
    </template>
    <template #nthWeekOfMonth>
      <div class="flex items-center gap-x-[4px]">
        <span>第</span>
        <ElInputNumber
          v-model="weekNthValue"
          controls-position="right"
          :max="5"
          :min="1"
          :disabled="fieldMode !== 'nthWeekOfMonth'"
        />
        <span>个</span>
        <ElSelect
          v-model="weekdayNthValue"
          :disabled="fieldMode !== 'nthWeekOfMonth'"
          :options="WEEK_LIST"
          class="!w-[120px]"
        />
      </div>
    </template>
    <template #lastWeekdayOfMonth>
      <div class="flex items-center gap-x-[4px]">
        <span>月最后一个</span>
        <ElSelect
          v-model="weekdayValue"
          :disabled="fieldMode !== 'lastWeekdayOfMonth'"
          :options="WEEK_LIST"
          class="!w-[120px]"
        />
      </div>
    </template>
    <template #list>
      <div class="flex flex-col">
        <span class="flex items-center gap-x-[4px]">指定
          <ElButton
            v-if="fieldMode === 'list' && listValue.length > 0"
            type="text"
            size="small"
            @click="listValue = []"
          >
            清空
          </ElButton>
          <ElButton
            v-if="fieldMode === 'list' && listValue.length < (listRef?.getAll?.()?.length ?? 0)"
            class="!ml-[0px]"
            type="text"
            size="small"
            @click="listRef?.selectAll?.()"
          >
            全选
          </ElButton>
        </span>
        <List
          ref="listRef"
          v-model="listValue"
          :width="['dayOfWeek', 'year'].includes(cronField as string) ? 30 : 24"
          :options="listOptions"
          :line-break="lineBreak"
          :disabled="fieldMode !== 'list'"
        />
      </div>
    </template>
  </FieldModeRadioGroup>
</template>

<style scoped lang="scss">
:deep(.el-input-number) {
  width: 100px;
}
</style>
