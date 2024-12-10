<script setup lang="ts">
import useMenuStore from '@/store/modules/menu';
import MenuItem from './MenuItem.vue';

const menuStore = useMenuStore();
</script>

<template>
  <ElScrollbar class="menu">
    <ElMenu
      :collapse="menuStore.isCollapse"
      :default-active="menuStore.activeMenu"
      class="border-none"
      :show-timeout="menuStore.animationDuration"
      :hide-timeout="menuStore.animationDuration"
    >
      <MenuItem
        v-for="menu in menuStore.menus"
        :key="menu.index"
        :menu="menu"
      />
    </ElMenu>
  </ElScrollbar>
</template>

<style scoped>
.menu {
  background-color: var(--el-menu-bg-color);
}
</style>
