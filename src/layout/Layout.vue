<script setup lang="ts">
import FullscreenToggle from '@/components/FullscreenToggle.vue';
import IconWithBg from '@/components/IconWithBg.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import useLayoutStore from '@/store/modules/layout';
import useMenuStore from '@/store/modules/menu';
import { computed } from 'vue';
import Breadcrumb from './components/Breadcrumb.vue';
import Logo from './components/Logo.vue';
import Menus from './components/Menu/Menus.vue';
import SearchMenuIcon from './components/SearchMenu/SearchMenuIcon.vue';
import UserAvatar from './components/UserAvatar.vue';

const menuStore = useMenuStore();
const layoutStore = useLayoutStore();

const animationDuration = computed(() => `${menuStore.animationDuration + 0}ms`);
</script>

<template>
  <ElContainer class="h-screen w-screen">
    <ElAside
      class="h-screen flex flex-col aside"
      :class="layoutStore.showAside ? 'w-0' : {
        'w-[220px]': !menuStore.isCollapse,
        'w-[65px]': menuStore.isCollapse,
      }"
    >
      <Logo />
      <Menus class="flex-1" />
    </ElAside>

    <ElContainer>
      <ElHeader class="flex items-center">
        <IconWithBg
          :size="24"
          :tip="!layoutStore.showAside ? '显示侧边栏' : '收起侧边栏'"
          @click="layoutStore.toggleShowAside()"
        >
          <component :is="!layoutStore.showAside ? 'Expand' : 'Fold'" />
        </IconWithBg>

        <Breadcrumb class="ml-[10px]" />

        <div class="ml-auto flex items-center">
          <SearchMenuIcon />
          <ThemeToggle class="ml-[10px]" />
          <FullscreenToggle class="ml-[10px]" />
          <UserAvatar class="ml-[10px]" />
        </div>
      </ElHeader>

      <ElMain class="main">
        <RouterView v-slot="{ Component }">
          <Transition
            appear
            name="fade-slide"
            mode="out-in"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>

<style scoped>
.aside {
  border-right: 1px solid var(--el-border-color);
  transition-property: width;
  transition-duration: v-bind('animationDuration');
}

.main {
  background-color: var(--el-bg-color-page);
}
</style>
