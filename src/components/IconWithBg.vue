<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  bgPadding: {
    type: Number,
    default: 8,
  },
});

const padding = computed(() => `-${props.bgPadding}px`);
</script>

<template>
  <ElIcon
    v-bind="$attrs"
    class="icon-wrapper"
  >
    <slot />
  </ElIcon>
</template>

<style lang="scss" scoped>
.icon-wrapper {
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--el-text-color-primary);
  border-radius: 50%;
  position: relative;
  z-index: 1;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background-color: var(--el-bg-color-page);
    z-index: -1;
    transform: scale(0);
    transition: all 0.1s ease;
  }

  &:hover::after {
    inset: v-bind('padding');
    transform: scale(1);
  }
}
</style>
