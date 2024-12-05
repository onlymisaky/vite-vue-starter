<script setup lang="ts">
import ThemeToggle from '@/components/ThemeToggle.vue';
import useMenuStore from '@/store/modules/menu';
import LayoutAside from './Aside/LayoutAside.vue';

const menuStore = useMenuStore();
</script>

<template>
  <ElContainer class="h-screen w-screen">
    <LayoutAside />
    <ElContainer>
      <ElHeader class="flex items-center">
        <ElIcon
          size="24"
          class="cursor-pointer"
          @click="menuStore.toggleCollapse"
        >
          <IEpExpand v-if="menuStore.isCollapse" />
          <IEpFold v-else />
        </ElIcon>
        <ThemeToggle class="ml-auto" />
      </ElHeader>
      <ElMain class="bg-slate-400">
        <RouterView />
      </ElMain>
    </ElContainer>
  </ElContainer>
</template>
