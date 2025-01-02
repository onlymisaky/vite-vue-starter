<script setup lang="ts">
import IconWithBg from '@/components/IconWithBg.vue';
import { useMenuStore } from '@/store/modules/menu';
import MenuItem from './MenuItem.vue';

const menuStore = useMenuStore();
</script>

<template>
  <div class="menu flex flex-col overflow-hidden">
    <ElScrollbar>
      <ElMenu
        :collapse="menuStore.isCollapse"
        :default-active="menuStore.activeMenu"
        class="border-none"
        :show-timeout="menuStore.animationDuration"
        :hide-timeout="menuStore.animationDuration"
        :router="false"
      >
        <MenuItem
          v-for="menu in menuStore.menus"
          :key="menu.index"
          :menu="menu"
        />
      </ElMenu>
    </ElScrollbar>
    <div class="flex items-center p-[20px] h-[40px] overflow-hidden">
      <span class="flex items-center">
        <IconWithBg
          :size="18"
          :tip="menuStore.isCollapse ? '展开' : '收起'"
          @click="menuStore.toggleCollapse"
        >
          <component :is="menuStore.isCollapse ? 'DArrowRight' : 'DArrowLeft'" />
        </IconWithBg>
      </span>
    </div>
  </div>
</template>

<style scoped>
.menu {
  background-color: var(--el-menu-bg-color);
}
</style>
