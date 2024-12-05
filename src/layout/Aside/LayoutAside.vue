<script setup lang="ts">
import Menus from '@/layout/Aside/Menu/Menus.vue';
import useMenuStore from '@/store/modules/menu';
import { computed } from 'vue';
import Logo from './Logo.vue';

const menuStore = useMenuStore();

const animationDuration = computed(() => `${menuStore.animationDuration + 0}ms`);
</script>

<template>
  <ElAside
    class="h-screen flex flex-col aside-transition"
    :class="{
      'w-[200px]': !menuStore.isCollapse,
      'w-[60px]': menuStore.isCollapse,
    }"
  >
    <Logo />
    <ElScrollbar class="flex-1" style="background-color: var(--el-menu-bg-color);">
      <Menus />
    </ElScrollbar>
  </ElAside>
</template>

<style lang="scss" scoped>
.aside-transition {
  transition-property: width;
  transition-duration: v-bind('animationDuration');
}
</style>
