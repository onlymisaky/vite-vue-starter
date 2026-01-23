<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  start: number | ''
  end: number | ''
  disabled?: boolean
  min?: number
  max?: number
  step?: number
  allowSame?: boolean
}>(), {
  disabled: false,
  step: 1,
  min: 0,
  max: Infinity,
  allowSame: false,
});

const emits = defineEmits<{
  (e: 'update:start', val: number | string): void
  (e: 'update:end', val: number | string): void
}>();

const startVal = computed({
  get() {
    return props.start;
  },
  set(num: number | string) {
    emits('update:start', num);
  },
});

const endVal = computed({
  get() {
    return props.end;
  },
  set(num: number | string) {
    emits('update:end', num);
  },
});

const startRange = computed(() => {
  const min = props.min;
  let max = props.max;

  // 当 endVal 为空时
  if (['', 'null', 'undefined'].includes(`${endVal.value}`.trim())) {
    return { min, max: props.allowSame ? max : max - props.step };
  }

  const endValN = Number(endVal.value);

  if (max >= endValN) {
    max = props.allowSame ? endValN : endValN - props.step;
  }
  return { min, max };
});

const endRange = computed(() => {
  let min = props.min;
  const max = props.max;

  if (['', 'null', 'undefined'].includes(`${startVal.value}`.trim())) {
    return { min: props.allowSame ? min : min + props.step, max };
  }

  const startValN = Number(startVal.value);

  if (min <= startValN) {
    min = props.allowSame ? startValN : startValN + props.step;
  }
  return { min, max };
});
</script>

<template>
  <ElInputNumber
    v-model="startVal"
    controls-position="right"
    :disabled="disabled"
    :min="startRange.min"
    :max="startRange.max"
    :step="step"
    step-strictly
  />
  <slot name="separator" />
  <ElInputNumber
    v-model="endVal"
    controls-position="right"
    :disabled="disabled"
    :min="endRange.min"
    :max="endRange.max"
    :step="step"
    step-strictly
  />
</template>
