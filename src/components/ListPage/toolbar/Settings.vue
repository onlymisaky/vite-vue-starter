<script setup lang="ts">
import type { PropType } from 'vue';
import type { TableConfig } from '../types';
import IconWithBg from '@/components/IconWithBg.vue';
import { Refresh } from '@element-plus/icons-vue';

interface Config<T> {
  label: string
  value: T
}

defineEmits(['reset']);

const tableConfig = defineModel('tableConfig', {
  type: Object as PropType<TableConfig>,
  required: true,
});

const sizes: Config<TableConfig['size']>[] = [
  { label: '大', value: 'large' },
  { label: '中', value: 'default' },
  { label: '小', value: 'small' },
];
const tooltipEffects: Config<TableConfig['tooltipEffect']>[] = [
  { label: '暗色', value: 'dark' },
  { label: '亮色', value: 'light' },
];
const fitOptions: Config<TableConfig['fit']>[] = [
  { label: '自动', value: true },
  { label: '固定', value: false },
];
const tableLayouts: Config<TableConfig['tableLayout']>[] = [
  { label: '固定', value: 'fixed' },
  { label: '自动', value: 'auto' },
];
</script>

<template>
  <ElPopover
    placement="bottom-end"
    trigger="click"
    width="230"
    popper-class="pb-0"
  >
    <template #reference>
      <IconWithBg
        :size="20"
        :tip="{ content: '表格设置', trigger: 'hover', placement: 'top' }"
      >
        <Setting />
      </IconWithBg>
    </template>
    <ElForm class="pl-[10px]">
      <ElFormItem label="大小">
        <ElRadioGroup
          v-model="tableConfig.size"
          size="small"
        >
          <ElRadioButton
            v-for="size in sizes"
            :key="size.value"
            :label="size.label"
            :value="size.value"
          />
        </ElRadioGroup>
      </ElFormItem>
      <ElFormItem label="边框">
        <ElSwitch
          v-model="tableConfig.border"
          inline-prompt
          :active-value="true"
          active-text="显示"
          :inactive-value="false"
          inactive-text="隐藏"
        />
      </ElFormItem>
      <ElFormItem>
        <template #label>
          <ElTooltip
            content="使用带斑马纹的表格，可以更容易区分出不同行的数据。"
            placement="left"
          >
            <div class="form-label-with-tip">
              <ElIcon size="12">
                <InfoFilled />
              </ElIcon>
              <span>斑马纹</span>
            </div>
          </ElTooltip>
        </template>
        <ElSwitch
          v-model="tableConfig.stripe"
          inline-prompt
          :active-value="true"
          active-text="启用"
          :inactive-value="false"
          inactive-text="关闭"
        />
      </ElFormItem>
      <ElFormItem label="显示表头">
        <ElSwitch
          v-model="tableConfig.showHeader"
          inline-prompt
          :active-value="true"
          active-text="显示"
          :inactive-value="false"
          inactive-text="隐藏"
        />
      </ElFormItem>
      <ElFormItem>
        <template #label>
          <ElTooltip
            content="选中当前行时，表格会高亮当前行。"
            placement="left"
          >
            <div class="form-label-with-tip">
              <ElIcon size="12">
                <InfoFilled />
              </ElIcon>
              <span>高亮当前行</span>
            </div>
          </ElTooltip>
        </template>
        <ElSwitch
          v-model="tableConfig.highlightCurrentRow"
          inline-prompt
          :active-value="true"
          active-text="启用"
          :inactive-value="false"
          inactive-text="关闭"
        />
      </ElFormItem>
      <ElFormItem>
        <template #label>
          <ElTooltip
            content="当单元格内容过长时，鼠标悬浮气泡提示文字样式"
            placement="left"
          >
            <div class="form-label-with-tip">
              <ElIcon size="12">
                <InfoFilled />
              </ElIcon>
              <span>tooltip效果</span>
            </div>
          </ElTooltip>
        </template>
        <ElSwitch
          v-model="tableConfig.tooltipEffect"
          inline-prompt
          :active-value="tooltipEffects[0].value"
          :active-text="tooltipEffects[0].label"
          :inactive-value="tooltipEffects[1].value"
          :inactive-text="tooltipEffects[1].label"
        />
      </ElFormItem>
      <ElFormItem>
        <template #label>
          <ElTooltip
            content="列的宽度是否自撑开"
            placement="left"
          >
            <div class="form-label-with-tip">
              <ElIcon size="12">
                <InfoFilled />
              </ElIcon>
              <span>自动列宽</span>
            </div>
          </ElTooltip>
        </template>
        <ElSwitch
          v-model="tableConfig.fit"
          inline-prompt
          :active-value="fitOptions[0].value"
          :active-text="fitOptions[0].label"
          :inactive-value="fitOptions[1].value"
          :inactive-text="fitOptions[1].label"
        />
      </ElFormItem>
      <ElFormItem label="布局">
        <template #label>
          <ElTooltip
            content="表格布局"
            placement="left"
          >
            <div class="form-label-with-tip">
              <ElIcon size="12">
                <InfoFilled />
              </ElIcon>
              <span>布局</span>
            </div>
          </ElTooltip>
        </template>
        <ElSwitch
          v-model="tableConfig.tableLayout"
          inline-prompt
          :active-value="tableLayouts[0].value"
          :active-text="tableLayouts[0].label"
          :inactive-value="tableLayouts[1].value"
          :inactive-text="tableLayouts[1].label"
        />
      </ElFormItem>
      <ElFormItem>
        <div class="w-full flex justify-end">
          <ElButton
            type="primary"
            size="small"
            :icon="Refresh"
            @click="$emit('reset')"
          >
            重置
          </ElButton>
        </div>
      </ElFormItem>
    </ElForm>
  </ElPopover>
</template>

<style scoped>
.form-label-with-tip {
  @apply flex items-center gap-[2px]
}
</style>
