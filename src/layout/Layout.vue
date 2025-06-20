<script setup lang="ts">
import { computed } from 'vue';
import FullscreenToggle from '@/components/FullscreenToggle.vue';
import IconWithBg from '@/components/IconWithBg.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import { useLayoutStore } from '@/store/modules/layout';
import { useMenuStore } from '@/store/modules/menu';
import { usePageCacheStore } from '@/store/modules/page-cache';
import Breadcrumb from './components/Breadcrumb.vue';
import Logo from './components/Logo.vue';
import Menus from './components/Menu/Menus.vue';
import SearchMenuIcon from './components/SearchMenu/SearchMenuIcon.vue';
import UserAvatar from './components/UserAvatar.vue';
import ViewTab from './components/ViewTab.vue';

const menuStore = useMenuStore();
const layoutStore = useLayoutStore();
const pageCacheStore = usePageCacheStore();

const animationDuration = computed(() => `${menuStore.animationDuration + 0}ms`);
</script>

<template>
  <section class="v-container h-screen w-screen">
    <aside
      class="aside h-screen flex flex-col aside-animation border-r border-solid border-[var(--app-border-color)]"
      :class="layoutStore.showAside ? 'w-0' : {
        'w-[220px]': !menuStore.isCollapse,
        'w-[65px]': menuStore.isCollapse,
      }"
    >
      <Logo />
      <Menus class="flex-1" />
    </aside>

    <section class="v-container is-vertical">
      <header class="header flex items-center">
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
      </header>

      <ViewTab />

      <main class="main bg-[var(--app-bg-color-page)] h-full">
        <RouterView v-slot="{ Component }">
          <Transition
            appear
            name="fade-slide"
            mode="out-in"
          >
            <KeepAlive
              :include="pageCacheStore.cachedPages"
              :max="pageCacheStore.cachePageSize"
            >
              <component :is="Component" />
            </KeepAlive>
          </Transition>
        </RouterView>
      </main>
    </section>
  </section>
</template>

<style scoped>
.v-container {
  box-sizing: border-box;
  display: flex;
  flex: 1;
  flex-basis: auto;
  flex-direction: row;
  min-width: 0;

  &.is-vertical {
    flex-direction: column;
  }
}

.aside {
  box-sizing: border-box;
  flex-shrink: 0;
  overflow: auto;
}

.aside-animation {
  transition-property: width;
  transition-duration: v-bind('animationDuration');
}

.header {
  box-sizing: border-box;
  flex-shrink: 0;
  height: var(--header-height);
  padding: var(--header-padding);
}

.main {
  box-sizing: border-box;
  display: block;
  flex: 1;
  flex-basis: auto;
  overflow: auto;
  padding: var(--main-padding);
}
</style>
