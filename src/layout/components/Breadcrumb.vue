<script setup lang="ts">
import { useRoute } from 'vue-router';

const route = useRoute();
</script>

<template>
  <ElBreadcrumb>
    <ElBreadcrumbItem
      v-for="(item, index) in route.matched"
      :key="item.path"
    >
      <div class="flex items-center">
        <ElIcon
          v-if="item.meta.icon"
          size="18"
          class="mr-[4px]"
          :class="index === route.matched.length - 1 ? 'text-primary' : 'text-placeholder'"
        >
          <component :is="item.meta.icon" />
        </ElIcon>
        <span :class="index === route.matched.length - 1 ? 'text-primary' : 'text-placeholder'">
          {{ item.meta.title }}
        </span>
      </div>
    </ElBreadcrumbItem>
  </ElBreadcrumb>
</template>

<style scoped>
.text-primary {
  color: var(--el-text-color-primary);
}

.text-placeholder {
  color: var(--el-text-color-placeholder);
}
</style>
