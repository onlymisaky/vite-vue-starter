<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  list: Array<number | string>
  disabled?: boolean
  /**
   * options 为空或没传时，使用 count 和 startIndex 生成列表项
   */
  count?: number
  startIndex?: number
  /**
   * 优先使用 options 作为列表项
   */
  options?: Array<string | number> | Array<{ label: string, value: string | number }>
  lineBreak?: (index: number, item: number | string | { label: string, value: string | number }) => boolean
  getLabel?: (index: number, item: number | string | { label: string, value: string | number }) => string
  width?: number
}>(), {
  disabled: false,
  startIndex: 0,
  width: 24,
  getLabel: (_index: number, item: number | string | { label: string, value: string | number }) => {
    if (typeof item === 'object' && 'label' in item) {
      return item.label;
    }
    return `${item}`;
  },
});

const emits = defineEmits(['update:list']);

const checkedList = computed({
  get() {
    return props.list;
  },
  set(val: Array<number | string>) {
    emits('update:list', val);
  },
});

const array = computed(() => {
  if (Array.isArray(props.options) && props.options.length > 0) {
    return props.options;
  }
  return Array.from({ length: props.count || 0 }).map((_, i) => i + props.startIndex);
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
      checkedList.value = array.value.map((item) => getValue(item));
    }
  },
  getAll() {
    return array.value;
  },
});
</script>

<template>
  <ElCheckboxGroup
    v-model="checkedList"
    :disabled="disabled"
  >
    <template
      v-for="(item, index) in array"
      :key="index"
    >
      <ElCheckbox
        :label="getValue(item)"
        class="!h-[24px]"
        :style="{ width: `${width}px` }"
      >
        {{ getLabel(index, item) }}
      </ElCheckbox>
      <template v-if="lineBreak">
        <br v-if="lineBreak(index, item)">
      </template>
    </template>
  </ElCheckboxGroup>
</template>
