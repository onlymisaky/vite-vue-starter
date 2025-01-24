<script setup lang="ts">
import type { InputNumberInstance, InputNumberProps } from 'element-plus';
import type { PropType, Slots } from 'vue';
import { computed, useSlots, useTemplateRef } from 'vue';

const props = defineProps({
  min: Number,
  max: Number,
  step: Number,
  stepStrictly: Boolean,
  precision: Number,
  size: {
    type: String as PropType<InputNumberProps['size']>,
  },
  readonly: Boolean,
  controls: Boolean,
  controlsPosition: {
    type: String as PropType<InputNumberProps['controlsPosition']>,
  },
  valueOnClear: {
    type: [String, Number] as PropType<number | null | InputNumberProps['valueOnClear']>,
  },
  validateEvent: Boolean,
  rangeSeparator: {
    type: String,
    default: '-',
  },
  startPlaceholder: {
    type: String,
    default: '',
  },
  endPlaceholder: {
    type: String,
    default: '',
  },
  start: {
    type: Object as PropType<{
      step: number
      stepStrictly: boolean
      precision: number
      controlsPosition: InputNumberProps['controlsPosition']
      validateEvent: boolean
      valueOnClear: InputNumberProps['valueOnClear']
    }>,
  },
  end: {
    type: Object as PropType<{
      step: number
      stepStrictly: boolean
      precision: number
      controlsPosition: InputNumberProps['controlsPosition']
      validateEvent: boolean
      valueOnClear: InputNumberProps['valueOnClear']
    }>,
  },
});

const emits = defineEmits<{
  (e: 'change', range: [number, number]): void
  (e: 'startChange', value: number, range: [number, number]): void
  (e: 'endChange', value: number, range: [number, number]): void
  (e: 'startFocus', value: FocusEvent): void
  (e: 'endFocus', value: FocusEvent): void
  (e: 'startBlur', value: FocusEvent): void
  (e: 'endBlur', value: FocusEvent): void

}>();

const modelValue = defineModel<[number, number]>({
  type: Array as unknown as PropType<[number, number]>,
  required: true,
});

const startNum = computed<number>({
  get() {
    return modelValue.value[0];
  },
  set(num: number) {
    modelValue.value = [num, modelValue.value[1]];
  },
});

const endNum = computed<number>({
  get() {
    return modelValue.value[1];
  },
  set(num: number) {
    modelValue.value = [modelValue.value[0], num];
  },
});

const startInputNumberAttrs = computed(() => {
  const {
    rangeSeparator: _rangeSeparator,
    startPlaceholder,
    endPlaceholder: _endPlaceholder,
    start,
    end: _end,
    ...rest
  } = props;

  const max = endNum.value === null || Number.isNaN(Number(endNum.value))
    ? {
        max: props.max,
      }
    : {
        max: endNum.value,
      };

  return {
    ...rest,
    ...start,
    ...max,
    placeholder: startPlaceholder,
  } as Omit<InputNumberProps, 'modelValue'>;
});

const endInputNumberAttrs = computed(() => {
  const {
    rangeSeparator: _rangeSeparator,
    startPlaceholder,
    endPlaceholder: _endPlaceholder,
    start,
    end: _end,
    ...rest
  } = props;

  return {
    ...rest,
    ...start,
    placeholder: startPlaceholder,
  } as Omit<InputNumberProps, 'modelValue'>;
});

const slots = useSlots() as Slots;

function firstLetterToLowerCase(str: string) {
  let res = str;
  if (res.startsWith('-')) {
    res = res.slice(1);
  }
  return res[0].toLowerCase() + res.slice(1);
}

function resolveSlotNames(slots: Slots, prefix: 'start' | 'end') {
  const array: { slotName: string, inputNumberSlotName: string }[] = [];
  for (const slotName in slots) {
    if (slotName.startsWith(prefix)) {
      let inputNumberSlotName = slotName.replace(prefix, '');
      inputNumberSlotName = firstLetterToLowerCase(inputNumberSlotName);
      array.push({ slotName, inputNumberSlotName });
    }
  }
  return array;
}

const startSlotNames = computed(() => {
  return resolveSlotNames(slots, 'start');
});
const endSlotNames = computed(() => {
  return resolveSlotNames(slots, 'end');
});

function onChangeRange(_value: number | undefined, index: number) {
  if ((startNum.value || startNum.value === 0) && (endNum.value || endNum.value === 0)) {
    if (startNum.value > endNum.value) {
      modelValue.value[index] = modelValue.value[index === 0 ? 1 : 0] + (index === 0 ? -1 : 1);
      if (index === 0) {
        startNum.value = endNum.value - 1;
      }
      else {
        endNum.value = startNum.value + 1;
      }
    }
  }

  // FUCK Vue
  if (index === 0) {
    emits('startChange', startNum.value, modelValue.value);
  }
  else {
    emits('endChange', endNum.value, modelValue.value);
  }

  emits('change', modelValue.value);
}

const startInputNumberRef = useTemplateRef<InputNumberInstance>('endInputNumberRef');
const endInputNumberRef = useTemplateRef<InputNumberInstance>('startInputNumberRef');

defineExpose({
  focus(pos: 'start' | 'end') {
    if (pos === 'end') {
      endInputNumberRef.value?.focus();
    }
    else {
      startInputNumberRef.value?.focus();
    }
  },
  blur(pos: 'start' | 'end') {
    if (pos === 'end') {
      endInputNumberRef.value?.focus();
    }
    else {
      startInputNumberRef.value?.focus();
    }
  },
});
</script>

<template>
  <ElInputNumber
    v-bind="startInputNumberAttrs"
    ref="startInputNumberRef"
    v-model="startNum"
    @change="onChangeRange($event, 0)"
    @focus="emits('startFocus', $event)"
    @blur="emits('startBlur', $event)"
  >
    <template
      v-for="{ slotName, inputNumberSlotName } in startSlotNames"
      :key="slotName"
      #[inputNumberSlotName]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slotName"
      />
    </template>
  </ElInputNumber>
  <slot
    v-if="$slots.rangeSeparator"
    name="rangeSeparator"
  />
  <template v-else>
    &nbsp;~&nbsp;
  </template>
  <ElInputNumber
    v-bind="endInputNumberAttrs"
    ref="endInputNumberRef"
    v-model="endNum"
    @change="onChangeRange($event, 1)"
    @focus="emits('endFocus', $event)"
    @blur="emits('endBlur', $event)"
  >
    <template
      v-for="{ slotName, inputNumberSlotName } in endSlotNames"
      :key="slotName"
      #[inputNumberSlotName]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slotName"
      />
    </template>
  </ElInputNumber>
</template>
