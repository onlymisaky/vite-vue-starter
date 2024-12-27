<script setup lang="ts">
import type { ElTooltipProps } from 'element-plus';
import { computed } from 'vue';

const props = defineProps<ElTooltipProps>();

const slots = defineSlots();

const hasContent = computed(() => slots.content
  || (typeof props.content === 'string' && props.content.trim())
  || typeof props.content === 'number',
);

const isStringContent = computed(() => hasContent.value && !slots.content);

const tipProps = computed(() => {
  if (hasContent.value) {
    const { content, ...rest } = props;
    return rest;
  }
  return {};
});
</script>

<template>
  <ElTooltip
    v-if="hasContent"
    v-bind="tipProps"
  >
    <template #content>
      <slot
        v-if="$slots.content"
        name="content"
      />
      <template v-else-if="isStringContent">
        {{ content }}
      </template>
    </template>
    <slot />
  </ElTooltip>
  <slot v-else />
</template>
