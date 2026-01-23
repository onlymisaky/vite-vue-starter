<script setup lang="ts">
import type { CronFieldMode } from '../types';
import { computed } from 'vue';

const props = defineProps<{
  mode: CronFieldMode
  modeOptions: Array<{ value: CronFieldMode, label?: string } | CronFieldMode>
}>();

const emits = defineEmits<{
  (e: 'update:mode', value: CronFieldMode): void
}>();

const mode = computed({
  get() {
    return props.mode;
  },
  set(value) {
    emits('update:mode', value);
  },
});

function getValue(item: { value: CronFieldMode, label?: string } | CronFieldMode, key: 'value' | 'label') {
  return typeof item === 'string' ? item : item[key] || item.value;
}
</script>

<template>
  <ElRadioGroup
    v-model="mode"
    class="flex flex-col !items-start gap-y-[12px]"
  >
    <ElRadio
      v-for="item in modeOptions"
      :key="getValue(item, 'value')"
      :value="getValue(item, 'value')"
      class="flex !items-baseline !h-auto"
    >
      <div
        :class="{
          '!text-[var(--el-disabled-text-color)]': getValue(item, 'value') !== mode,
        }"
      >
        <slot :name="getValue(item, 'value')">
          {{ getValue(item, 'label') }}
        </slot>
      </div>
    </ElRadio>
  </ElRadioGroup>
</template>
