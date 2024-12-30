<script setup lang="ts">
import type { DialogProps, ElDialog } from 'element-plus';
import type { Slots } from 'vue';
import { useVModel } from '@vueuse/core';
import { computed, useAttrs, useSlots, useTemplateRef } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
});

defineEmits(['update:modelValue']);

const visible = useVModel(props, 'modelValue');

const dialogRef = useTemplateRef<InstanceType<typeof ElDialog>>('dialogRef');

const attrs = useAttrs() as Partial<DialogProps>;

const slots = useSlots() as Slots;
const slotNames = computed(() => Object.keys(slots));

defineExpose({
  resetPosition() {
    return dialogRef.value?.resetPosition();
  },
});
</script>

<template>
  <ElDialog
    v-bind="attrs"
    ref="dialogRef"
    v-model="visible"
  >
    <template
      v-for="slot in slotNames"
      :key="slot"
      #[slot]="slotProps"
    >
      <slot
        v-bind="slotProps"
        :name="slot"
      />
    </template>
  </ElDialog>
</template>
