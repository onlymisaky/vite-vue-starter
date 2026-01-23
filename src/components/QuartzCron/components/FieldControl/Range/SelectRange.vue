<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  start: number | string
  end: number | string
  disabled: boolean
  options: { label: string, value: number }[]
}>();

const emits = defineEmits<{
  (e: 'update:start', val: number | string): void
  (e: 'update:end', val: number | string): void
}>();

const startVal = computed({
  get: () => props.start,
  set: (val) => {
    emits('update:start', val);
  },
});

const endVal = computed({
  get: () => props.end,
  set: (val) => {
    emits('update:end', val);
  },
});
</script>

<template>
  <ElSelect
    v-model="startVal"
    :disabled="disabled"
    searchable
    clearable
    class="!w-[120px]"
  >
    <ElOption
      v-for="(item, index) in options"
      :key="index"
      v-bind="item"
      :disabled="index === options.length - 1 || (endVal && item.value >= Number(endVal) ? true : false)"
    />
  </ElSelect>
  <slot name="separator" />
  <ElSelect
    v-model="endVal"
    :disabled="disabled"
    searchable
    clearable
    class="!w-[120px]"
  >
    <ElOption
      v-for="(item, index) in options"
      :key="index"
      v-bind="item"
      :disabled="index === 0 || (startVal && item.value <= Number(startVal) ? true : false)"
    />
  </ElSelect>
</template>
