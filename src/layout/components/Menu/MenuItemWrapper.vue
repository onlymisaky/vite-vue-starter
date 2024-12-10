<script setup lang="ts">
import type { PropType } from 'vue';

defineProps({
  menu: {
    type: Object as PropType<IMenuItem>,
    required: true,
  },
});
</script>

<template>
  <slot v-if="menu.disabled" />
  <RouterLink
    v-else-if="menu.route"
    class="block hover:cursor-auto"
    :to="menu.route"
  >
    <slot />
  </RouterLink>
  <ElLink
    v-else-if="menu.externalLink"
    :href="menu.externalLink"
    :underline="false"
    target="_blank"
    class="block hover:cursor-auto"
  >
    <slot />
  </ElLink>
</template>

<style scoped>
:deep(.el-link__inner) {
  display: block;
}
</style>
