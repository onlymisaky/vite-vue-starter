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
          :style="{ color: index === route.matched.length - 1 ? 'var(--el-text-color-primary)' : 'var(--el-text-color-placeholder)' }"
        >
          <component :is="item.meta.icon" />
        </ElIcon>
        <span
          :style="{ color: index === route.matched.length - 1 ? 'var(--el-text-color-primary)' : 'var(--el-text-color-placeholder)' }"
        >
          {{
            item.meta.title }}</span>
      </div>
    </ElBreadcrumbItem>
  </ElBreadcrumb>
</template>
