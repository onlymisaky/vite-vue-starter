<script lang="ts" setup>
import AppLink from '@/components/AppLink.vue';
import IconVite from '@/components/Icons/Vite.vue';
import { useAppStore } from '@/store/modules/app';
import useMenuStore from '@/store/modules/menu';

const menuStore = useMenuStore();
const appStore = useAppStore();
</script>

<template>
  <div class="h-[60px]">
    <AppLink
      class="flex items-center justify-around px-[10px]"
      route="/"
    >
      <IconVite />
      <Transition
        appear
        name="el-zoom-in-center"
      >
        <h1
          v-show="!menuStore.isCollapse"
          class="flex-1 text-center block overflow-hidden text-nowrap"
        >
          {{ appStore.appName }}
        </h1>
      </Transition>
    </AppLink>
  </div>
</template>
