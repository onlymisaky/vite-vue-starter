<script lang="ts" setup>
import type { MaybeRef } from 'vue';
import type { CronField, CronFieldModel, CronModel } from './types';
import type { ValidateErrorCode } from './utils/constants';
import { computed, h, nextTick, ref, shallowRef, watch } from 'vue';
import Time from './components/Time.vue';
import { useExecutionTimes } from './hooks/useExecutionTimes';
import { CRON_FIELD_LIST, DEFAULT_MODEL, VALIDATE_ERROR_MESSAGE_MAP } from './utils/constants';
import { expression2Model } from './utils/expression-model';
import { model2Expression, model2Expressions } from './utils/model-expression';
import { formatDate } from './utils/time';

const model = ref(DEFAULT_MODEL());

const tabs = computed<{
  label: string
  name: CronField
  component?: Record<string, any>
}[]>(() => {
  return CRON_FIELD_LIST.map((item) => {
    return {
      label: item.label,
      name: item.value,
      component: h(Time, {
        cronField: item.value,
        modelValue: model.value[item.value],
        'onUpdate:modelValue': (value) => model.value[item.value] = value,
      }),
    };
  });
});

const activeTab = ref(tabs.value[0].name);

const expressions = computed(() => model2Expressions(model.value));

watch(
  () => model.value.dayOfMonth.mode,
  (mode) => {
    if (mode !== 'unspecified') {
      model.value.dayOfWeek.mode = 'unspecified';
    }
  },
  { immediate: true, deep: true },
);

watch(
  () => model.value.dayOfWeek.mode,
  (mode) => {
    if (mode !== 'unspecified') {
      model.value.dayOfMonth.mode = 'unspecified';
    }
  },
  { immediate: true, deep: true },
);

const expression = ref('');
const expressionErrorList = shallowRef([] as {
  value: string
  cronField: CronField | 'global'
  cronFieldLabel: string
  code: ValidateErrorCode
  errorMessage: string
}[]);

async function handleExpression2Model() {
  expressionErrorList.value = [];
  await nextTick();
  const { errors, data } = expression2Model(expression.value);

  expressionErrorList.value = CRON_FIELD_LIST.reduce((prev, cur, index) => {
    if (errors[cur.value]) {
      prev.push({
        value: expression.value.split(' ')[index] || '',
        cronField: cur.value,
        cronFieldLabel: cur.label,
        code: errors[cur.value],
        errorMessage: VALIDATE_ERROR_MESSAGE_MAP[errors[cur.value]],
      });
    }
    return prev;
  }, [] as {
    value: string
    cronField: CronField | 'global'
    cronFieldLabel: string
    code: ValidateErrorCode
    errorMessage: string
  }[]);

  if (errors.global) {
    expressionErrorList.value.unshift({
      value: expression.value,
      cronField: 'global',
      cronFieldLabel: '表达式',
      code: errors.global,
      errorMessage: VALIDATE_ERROR_MESSAGE_MAP[errors.global],
    });
  }

  if (expressionErrorList.value.length > 0) {
    return;
  }
  if (data) {
    model.value = data as Record<CronField, CronFieldModel>;
  }
}

watch(
  () => model.value,
  (value) => {
    expression.value = model2Expression(value);
  },
  { immediate: true, deep: true },
);

const itemWrapperClass = 'flex items-center gap-x-[12px]';
const itemLabelClass = 'w-[70px] text-right text-[color:var(--el-text-color-regular)] text-[13px] font-[500]';

const {
  startTime,
  numExecutions,
  executionTimes,
  isCalculating,
  calculateExecutionTimes,
} = useExecutionTimes(model as MaybeRef<CronModel>);
</script>

<template>
  <ElTabs
    v-model="activeTab"
    type="border-card"
  >
    <ElTabPane
      v-for="item in tabs"
      :key="item.name"
      :label="item.label"
      :name="item.name"
    >
      <Component
        :is="item.component"
        v-if="item.component"
      />
      <template v-else>
        {{ item.name }}
      </template>
    </ElTabPane>
  </ElTabs>
  <br>
  <ElCard>
    <div class="flex flex-col gap-y-[12px]">
      <div :class="[itemWrapperClass]">
        <span :class="[itemLabelClass]">表达式字段</span>
        <ElTooltip
          v-for="exprItem in expressions"
          :key="exprItem.cronField"
          placement="top"
          :disabled="exprItem.success"
          :content="(exprItem.errors || []).map((code) => VALIDATE_ERROR_MESSAGE_MAP[code]).join('<br>')"
        >
          <template
            v-if="exprItem.errors && exprItem.errors.length > 0"
            #content
          >
            <template
              v-for="errorCode in exprItem.errors"
              :key="errorCode"
            >
              {{ VALIDATE_ERROR_MESSAGE_MAP[errorCode] }}
              <br>
            </template>
          </template>
          <span
            class="flex flex-col items-center w-[90px] text-[14px] cursor-pointer"
            @click="activeTab = exprItem.cronField"
          >
            <span
              class="w-full text-center text-white rounded-t-[4px]"
              :class="[
                exprItem.cronField === activeTab ? {
                  'bg-[var(--el-color-primary)]': exprItem.success,
                  'bg-[var(--el-color-error)]': !exprItem.success,
                } : {
                  'bg-[var(--el-color-primary-light-5)]': exprItem.success,
                  'bg-[var(--el-color-error-light-5)]': !exprItem.success,
                },
              ]"
            >
              {{ exprItem.cronFieldLabel }}
            </span>
            <span
              class="w-full h-[23px] text-center text-[var(--el-text-color-secondary)] border rounded-b-[4px] text-ellipsis overflow-hidden whitespace-nowrap"
              :class="[
                exprItem.cronField === activeTab ? {
                  'border-[var(--el-color-primary)]': exprItem.success,
                  'border-[var(--el-color-error)]': !exprItem.success,
                } : {
                  'border-[var(--el-color-primary-light-5)]': exprItem.success,
                  'border-[var(--el-color-error-light-5)]': !exprItem.success,
                },
              ]"
            >
              {{ exprItem.data }}
            </span>
          </span>
        </ElTooltip>
      </div>
      <div :class="[itemWrapperClass]">
        <span :class="[itemLabelClass]">QuartzCron</span>
        <ElInput
          v-model="expression"
          class="w-[350px]"
        >
          <template #append>
            <ElButton
              type="primary"
              @click="handleExpression2Model"
            >
              反解析
            </ElButton>
          </template>
        </ElInput>
      </div>
      <ElAlert
        v-if="expressionErrorList.length > 0"
        closeable
        title="表达式解析失败"
        type="error"
      >
        <template #default>
          <div
            v-for="item in expressionErrorList"
            :key="item.cronField"
            class="flex items-center gap-x-[4px]"
          >
            {{ item.cronFieldLabel }}:&nbsp;&nbsp;[&nbsp;{{ item.value }}&nbsp;]&nbsp;&nbsp;{{ item.errorMessage }}
          </div>
        </template>
      </ElAlert>
    </div>
  </ElCard>
  <br>
  <ElCard>
    <template #header>
      <span class="flex items-center gap-x-[8px]">
        <span class="text-[14px] font-[500]">从</span>
        <ElDatePicker
          v-model="startTime"
          type="datetime"
          value-format="YYYY-MM-DD HH:mm:ss"
          class="w-[200px]"
        />
        <span class="text-[14px] font-[500]">开始，最近</span>
        <ElInputNumber
          v-model="numExecutions"
          :min="1"
          :max="20"
          class="w-[120px]"
          controls-position="right"
        />
        <span class="text-[14px] font-[500]">次执行时间</span>
        <ElButton
          type="primary"
          :loading="isCalculating"
          @click="calculateExecutionTimes"
        >
          计算
        </ElButton>
      </span>
    </template>
    <div class="flex flex-col gap-y-[12px]">
      <div v-if="executionTimes.length > 0" class="space-y-2">
        <div
          v-for="(time, index) in executionTimes"
          :key="index"
          class="flex items-center gap-x-[8px] text-[14px]"
        >
          <span class="w-[20px] text-[var(--el-text-color-secondary)]">{{ index + 1 }}.</span>
          <span class="text-[var(--el-text-color-regular)]">{{ formatDate(time).toString() }}</span>
        </div>
      </div>
    </div>
  </ElCard>
</template>
