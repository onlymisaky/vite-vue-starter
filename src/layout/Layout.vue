<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue';
import useMenuStore from '@/store/modules/menu';
import { computed } from 'vue';
import Breadcrumb from './components/Breadcrumb.vue';
import Logo from './components/Logo.vue';
import Menus from './components/Menu/Menus.vue';
import UserAvatar from './components/UserAvatar.vue';

const menuStore = useMenuStore();

const animationDuration = computed(() => `${menuStore.animationDuration + 0}ms`);
</script>

<template>
  <ElContainer class="h-screen w-screen">
    <ElAside
      class="h-screen flex flex-col aside-transition"
      :class="{
        'w-[220px]': !menuStore.isCollapse,
        'w-[60px]': menuStore.isCollapse,
      }"
      style="border-right: 1px solid var(--el-border-color);"
    >
      <Logo />
      <Menus class="flex-1" />
    </ElAside>

    <ElContainer>
      <ElHeader class="flex items-center">
        <ElIcon
          :size="24"
          class="cursor-pointer"
          @click="menuStore.toggleCollapse"
        >
          <component :is="menuStore.isCollapse ? 'Expand' : 'Fold'" />
        </ElIcon>

        <Breadcrumb class="ml-[10px]" />
        <div class="ml-auto flex items-center">
          <ThemeToggle />
          <UserAvatar class="ml-[10px]" />
        </div>
      </ElHeader>

      <ElMain style="background-color: var(--el-bg-color-page);">
        <RouterView v-slot="{ Component }">
          <component :is="Component" />
        </RouterView>
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>

<style lang="scss" scoped>
.aside-transition {
  transition-property: width;
  transition-duration: v-bind('animationDuration');
}
</style>
