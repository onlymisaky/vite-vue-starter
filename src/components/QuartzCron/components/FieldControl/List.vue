<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  modelValue: Array<number | string>
  disabled?: boolean
  options: Array<{ label: string, value: string | number }>
  lineBreak?: (index: number, item: number | string | { label: string, value: string | number }) => boolean
  getLabel?: (index: number, item: number | string | { label: string, value: string | number }) => string
  width?: number
}>(), {
  disabled: false,
  width: 24,
});

const emits = defineEmits(['update:modelValue']);

const checkedList = computed({
  get() {
    return props.modelValue;
  },
  set(val: Array<number | string>) {
    emits('update:modelValue', val);
  },
});

function getValue(item: number | string | { label: string, value: string | number }) {
  if (typeof item === 'object' && 'value' in item) {
    return item.value;
  }
  return item;
}

defineExpose({
  selectAll() {
    if (!props.disabled) {
      checkedList.value = props.options.map((item) => getValue(item));
    }
  },
  getAll() {
    return props.options;
  },
});
</script>

<template>
  <ElCheckboxGroup
    v-model="checkedList"
    :disabled="disabled"
  >
    <template
      v-for="(item, index) in options"
      :key="index"
    >
      <ElCheckbox
        :value="item.value"
        :label="item.label"
        class="!h-[24px]"
        :style="{ width: `${width}px` }"
      />
      <template v-if="lineBreak">
        <br v-if="lineBreak(index, item)">
      </template>
    </template>
  </ElCheckboxGroup>
</template>
