<script setup lang="ts">
import { useMenuStore } from '@/store/modules/menu';
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const menuStore = useMenuStore();
function getMenuPath(): IMenuItem[] {
  const menus: IMenuItem[] = [];
  const currentMenu = menuStore.flatMenus.find(menu => menu.index === route.name);
  if (currentMenu) {
    menus.push(currentMenu);
    if (currentMenu.parents) {
      currentMenu.parents.forEach(menu => {
        menus.unshift(menu);
      });
    }
  }
  return menus;
}
// route.matched
const menuPath = computed(() => {
  return getMenuPath();
});
</script>

<template>
  <ElBreadcrumb class="flex items-center">
    <ElBreadcrumbItem
      v-for="(item, index) in menuPath"
      :key="item.index"
    >
      <div
        class="flex items-center"
        :class="index === menuPath.length - 1 ? 'text-primary' : 'text-placeholder cursor-pointer'"
      >
        <ElIcon
          v-if="item.icon"
          size="18"
          class="mr-[4px]"
        >
          <component :is="item.icon" />
        </ElIcon>
        <span>{{ item.title }}</span>
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
