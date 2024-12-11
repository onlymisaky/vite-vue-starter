<script setup lang="ts">
import type { PropType } from 'vue';
import type { RouteLocationRaw } from 'vue-router';

defineProps({
  disabled: {
    type: Boolean,
    default: false,
  },
  showDisabledStyle: {
    type: Boolean,
    default: true,
  },
  route: {
    type: Object as PropType<RouteLocationRaw>,
    default: null,
  },
  custom: {
    type: Boolean,
    default: false,
  },
  href: {
    type: String,
    default: null,
  },
  target: {
    type: String,
    default: '_blank',
    validator: (value: string) => {
      if (typeof value === 'string') {
        return ['_blank', '_self', '_parent', '_top'].includes(value);
      }
      return true;
    },
  },
  underline: {
    type: Boolean,
    default: false,
  },
});

const emits = defineEmits(['click']);

function onClick(e: MouseEvent) {
  emits('click', e);
}
</script>

<template>
  <div
    v-if="disabled"
    role="app-link"
    class="block w-full h-full cursor-not-allowed"
    :class="showDisabledStyle ? 'opacity-50 pointer-events-none' : ''"
  >
    <slot />
  </div>
  <template v-else>
    <RouterLink
      v-if="route"
      v-slot="slotProps"
      role="app-link"
      class="block w-full h-full cursor-pointer"
      :to="route"
      :custom="custom"
      v-bind="$attrs"
      @click="onClick"
    >
      <slot v-bind="slotProps" />
    </RouterLink>
    <ElLink
      v-else-if="href"
      role="app-link"
      :href="href"
      :underline="underline"
      :target="target"
      class="block w-full h-full hover:cursor-auto"
      :disabled="disabled"
      v-bind="$attrs"
      @click="onClick"
    >
      <slot />
    </ElLink>
    <slot v-else />
  </template>
</template>

<style scoped>
:deep(.el-link__inner) {
  display: block;
}
</style>
