<script setup lang="ts">
import type { ElForm, FormRules } from 'element-plus';
import { createReusableTemplate } from '@vueuse/core';
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

const [DefineFormItemTemplate, ReuseFormItemTemplate] = createReusableTemplate();

const isEdit = computed(() => props.domain && props.domain.id);

const formRef = useTemplateRef<InstanceType<typeof ElForm>>('formRef');

interface FormModel {

}

const formModel = ref<FormModel>({

});

function assignPropsToFormModel(domain: Record<string, any>) {
  Object.keys(formModel.value).forEach((key) => {
    if (false) {
      // formModel.value.xxx = xxxx
    }
    else if (key in domain) {
      (formModel.value as any)[key] = domain[key];
    }
  });
}

watch(() => props.domain, (newVal) => {
  assignPropsToFormModel(newVal);
}, { deep: true, immediate: true });

const formRules = computed<FormRules<typeof formModel.value>>(() => {
  const rules: FormRules<typeof formModel.value> = {};

  return rules;
});

const submitLoading = ref(false);

const submitFormData = computed(() => {
  const { ...formData } = formModel.value;
  return {
    ...formData,
  };
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
  <DefineFormItemTemplate>
    <div class="flex items-center gap-[20px]">
      <div class="w-[25%]">
        <ElSkeletonItem variant="h1" />
      </div>
      <div class="flex-1">
        <ElSkeletonItem variant="h1" />
      </div>
    </div>
  </DefineFormItemTemplate>

  <ElForm
    ref="formRef"
    :model="formModel"
    :rules="formRules"
    label-width="110px"
  >
    <ElSkeleton animated>
      <template #template>
        <div class="flex flex-col gap-[20px] mb-[20px]">
          <ReuseFormItemTemplate
            v-for="i in 7"
            :key="i"
          />
        </div>
      </template>
    </ElSkeleton>
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
