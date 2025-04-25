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
      for (let i = currentMenu.parents.length - 1; i >= 0; i--) {
        menus.unshift(currentMenu.parents[i]);
      }
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
        :class="index === menuPath.length - 1
          ? 'text-[color:var(--app-text-color-primary)]'
          : 'text-[color:var(--app-text-color-placeholder)] cursor-pointer hover:text-[color:var(--app-color-primary)]'"
      >
        <ElIcon
          v-if="item.icon"
          size="18"
          class="mr-[4px]"
        >
          <component :is="item.icon" />
        </ElIcon>
        <RouterLink
          v-slot="{ navigate }"
          :to="item.route"
          custom
        >
          <span
            data-role="link"
            @click="navigate"
          >
            {{ item.title }}
          </span>
        </RouterLink>
      </div>
    </ElBreadcrumbItem>
  </ElBreadcrumb>
</template>
