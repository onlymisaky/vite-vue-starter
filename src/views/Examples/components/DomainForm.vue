<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus';
import { computed, nextTick, ref, useTemplateRef, watch } from 'vue';
import { addDomain, editDomain } from '@/api/domain';
import { handleAxiosResult } from '@/request';

const props = defineProps({
  domain: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(['confirm']);

const isEdit = computed(() => props.domain && props.domain.id);

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef');

interface FormModel {
  char: string
  varchar: string
  text?: string
  int: number
  decimal?: number
  boolean?: boolean
  enum?: string
  tinyintToAchieveEnum?: number
  array?: string[]
  date?: string
  time?: string
  datetime?: string
  timestamp?: string
  json?: string
}

const formModel = ref<FormModel>({
  char: '',
  varchar: '',
  text: '',
  int: 0,
  decimal: undefined,
  boolean: false,
  enum: '',
  tinyintToAchieveEnum: undefined,
  array: [],
  date: '',
  time: '',
  datetime: '',
  timestamp: '',
  json: '',
});

function assignPropsToFormModel(domain: Record<string, any>) {
  const keys = Object.keys(formModel.value) as (keyof FormModel)[];
  keys.forEach((key) => {
    const value = domain[key];
    if (key in domain) {
      (formModel.value as any)[key] = value;
    }

    if (key === 'json' && value && typeof value === 'object') {
      formModel.value.json = JSON.stringify(value);
    }
  });
}

watch(() => props.domain, (newVal) => {
  assignPropsToFormModel(newVal);
}, { deep: true, immediate: true });

const formRules = computed<FormRules<typeof formModel.value>>(() => {
  const rules: FormRules<typeof formModel.value> = {
    char: [
      { required: true, message: '请输入 char', trigger: 'blur' },
      { min: 6, max: 6, message: '长度必须为 6', trigger: 'blur' },
    ],
    varchar: [
      { required: true, message: '请输入 varchar', trigger: 'blur' },
    ],
    int: [
      { required: true, message: '请输入 int', trigger: 'blur' },
      { type: 'integer', message: '必须为整数', trigger: 'blur' },
    ],
    decimal: [
      {
        validator(_rule, value, callback) {
          // eslint-disable-next-line regexp/no-unused-capturing-group
          const reg = /^[-+]?(\d+)?(\.(\d{1,2}))?$/;
          if (value && !reg.test(value)) {
            return callback(new Error('必须为数字，且最多保留两位小数'));
          }
          callback();
        },
      },
    ],
    json: [
      {
        validator(_rule, value, callback) {
          if (['', 'undefined', null].includes(`${value}`.trim())) {
            return callback();
          }

          try {
            JSON.parse(value);
            callback();
          }
          catch (e) {
            callback(new Error('必须为合法的 JSON 字符串'));
            console.error('JSON 解析错误:', e);
          }
        },
      },
    ],
  };

  return rules;
});

const submitLoading = ref(false);

const submitFormData = computed(() => {
  const keys = Object.keys(formModel.value) as (keyof FormModel)[];
  return keys.reduce((acc, key) => {
    let val = formModel.value[key];

    if (['', 'undefined', null].includes(`${val}`.trim())) {
      return acc;
    }

    else if (Array.isArray(val) && val.length === 0) {
      return acc;
    }

    if (key === 'timestamp') {
      val = `${val}`;
    }

    acc[key] = val;

    return acc;
  }, {} as Record<string, any>);
});

async function handleAddDomain() {
  const axiosPromise = addDomain(submitFormData.value);
  const [error] = await handleAxiosResult(axiosPromise);

  if (error) {
    ElMessage.error(error.message);
    return false;
  }

  ElMessage.success('添加成功');
  return true;
}

async function handleEditDomain() {
  const axiosPromise = editDomain(props.domain.id, submitFormData.value);
  const [error] = await handleAxiosResult(axiosPromise);

  if (error) {
    ElMessage.error(error.message);
    return false;
  }

  ElMessage.success('编辑成功');
  return true;
}

async function handleConfirm() {
  submitLoading.value = true;
  const valid = await formRef.value?.validate().then(() => true).catch(() => false);
  if (!valid) {
    submitLoading.value = false;
    return;
  }
  const res = await (isEdit.value ? handleEditDomain() : handleAddDomain());
  if (res) {
    emit('confirm');
  }
  submitLoading.value = false;
}

function handleReset() {
  formRef.value?.resetFields();
  assignPropsToFormModel(props.domain);
  nextTick(() => {
    formRef.value?.clearValidate();
  });
}

defineExpose({
  validate() {
    return formRef.value?.validate();
  },
  clearValidate() {
    return formRef.value?.clearValidate();
  },
  resetForm() {
    formRef.value?.resetFields();
    nextTick(() => {
      formRef.value?.clearValidate();
    });
  },
  getFormModel() {
    return formModel.value;
  },
});
</script>

<template>
  <ElForm
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    label-width="170px"
    class="h-[600px] overflow-y-auto"
  >
    <ElFormItem
      label="char"
      prop="char"
    >
      <ElInput
        v-model="formModel.char"
        :minlength="6"
        :maxlength="6"
      />
    </ElFormItem>
    <ElFormItem
      label="varchar"
      prop="varchar"
    >
      <ElInput
        v-model="formModel.varchar"
        :maxlength="255"
      />
    </ElFormItem>
    <ElFormItem
      label="text"
      prop="text"
    >
      <ElInput
        v-model="formModel.text"
        type="textarea"
        :rows="4"
      />
    </ElFormItem>
    <ElFormItem
      label="int"
      prop="int"
    >
      <ElInputNumber
        v-model="formModel.int"
        :min="0"
        :max="1000000"
        :step="1"
        :precision="0"
      />
    </ElFormItem>
    <ElFormItem
      label="decimal"
      prop="decimal"
    >
      <ElInputNumber
        v-model="formModel.decimal"
        :step="0.01"
        :min="0"
        :max="1000"
      />
    </ElFormItem>
    <ElFormItem
      label="boolean"
      prop="boolean"
    >
      <ElSwitch v-model="formModel.boolean" />
    </ElFormItem>
    <ElFormItem
      label="enum"
      prop="enum"
    >
      <ElSelect v-model="formModel.enum">
        <ElOption
          v-for="item in ['active', 'inactive', 'pending']"
          :key="item"
          :label="item"
          :value="item"
        />
      </ElSelect>
    </ElFormItem>
    <ElFormItem
      label="tinyintToAchieveEnum"
      prop="tinyintToAchieveEnum"
    >
      <ElRadioGroup v-model="formModel.tinyintToAchieveEnum">
        <ElRadio
          v-for="(item, index) in [1, 2, 3, 4, 5]"
          :key="index"
          :label="item"
          :value="item"
        >
          {{ item }}
        </ElRadio>
      </ElRadioGroup>
    </ElFormItem>
    <ElFormItem
      label="array"
      prop="array"
    >
      <ElCheckboxGroup v-model="formModel.array">
        <ElCheckbox
          v-for="(item, index) in ['北京', '上海', '广州', '深圳']"
          :key="index"
          :label="item"
          :value="item"
        >
          {{ item }}
        </ElCheckbox>
      </ElCheckboxGroup>
    </ElFormItem>
    <ElFormItem
      label="date"
      prop="date"
    >
      <ElDatePicker
        v-model="formModel.date"
        type="date"
        format="YYYY-MM-DD"
        value-format="YYYY-MM-DD"
      />
    </ElFormItem>
    <ElFormItem
      label="time"
      prop="time"
    >
      <ElTimePicker
        v-model="formModel.time"
        format="HH:mm:ss"
        value-format="HH:mm:ss"
      />
    </ElFormItem>
    <ElFormItem
      label="datetime"
      prop="datetime"
    >
      <ElDatePicker
        v-model="formModel.datetime"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="YYYY-MM-DD HH:mm:ss"
      />
    </ElFormItem>
    <ElFormItem
      label="timestamp"
      prop="timestamp"
    >
      <ElDatePicker
        v-model="formModel.timestamp"
        type="datetime"
        format="YYYY-MM-DD HH:mm:ss"
        value-format="x"
      />
    </ElFormItem>
    <ElFormItem
      label="json"
      prop="json"
    >
      <ElInput
        v-model="formModel.json"
        type="textarea"
        :rows="4"
        placeholder="请输入 JSON 格式的字符串"
      />
    </ElFormItem>
  </ElForm>
  <div class="flex justify-end">
    <ElButton
      :disabled="submitLoading"
      @click="handleReset"
    >
      重置
    </ElButton>
    <ElButton
      type="primary"
      :loading="submitLoading"
      @click="handleConfirm"
    >
      确定
    </ElButton>
  </div>
</template>
