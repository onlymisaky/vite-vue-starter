<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(defineProps<{
  start: number | ''
  step: number | ''
  disabled?: boolean
  min?: number
  max?: number
}>(), {
  disabled: false,
  min: 0,
  max: Infinity,
});

const emits = defineEmits<{
  (e: 'update:start', val: number | string): void
  (e: 'update:step', val: number | string): void
}>();

const startVal = computed({
  get() {
    return props.start as number;
  },
  set(num: number) {
    emits('update:start', num);
  },
});

const stepVal = computed({
  get() {
    return props.step as number;
  },
  set(num: number) {
    emits('update:step', num);
  },
});

// const startRange = computed(() => {
//   const min = props.min;
//   const max = props.max;

//   // 当 step 为空时，start 最大值为 max - 1
//   if (['', 'null', 'undefined'].includes(`${stepVal.value}`.trim())) {
//     return { min, max: max - 1 };
//   }

//   // 当 step 不为空时，start 最大值为 max - step
//   return { min, max: max - Number(stepVal.value) };
// });

// const stepRange = computed(() => {
//   const max = props.max;

//   // 当 start 为空时，step 最小值为 1
//   if (['', 'null', 'undefined'].includes(`${startVal.value}`.trim())) {
//     return { min: 1, max };
//   }

//   // 当 start 不为空时，step 最小值为 start + 1
//   return { min: 1, max: max - Number(startVal.value) };
// });
</script>

<template>
  <ElInputNumber
    v-model="startVal"
    controls-position="right"
    :disabled="disabled"
    :min="min"
    :max="max"
    :step="1"
    step-strictly
  />
  <slot name="separator" />
  <ElInputNumber
    v-model="stepVal"
    controls-position="right"
    :disabled="disabled"
    :min="1"
    :max="max"
    :step="1"
    step-strictly
  />
</template>
