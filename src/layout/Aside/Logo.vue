<script lang="ts" setup>
import IconVite from '@/components/Icons/Vite.vue';
import useMenuStore from '@/store/modules/menu';

const menuStore = useMenuStore();
</script>

<template>
  <div class="h-[60px] flex items-center justify-around px-[10px]">
    <IconVite />
    <h1
      v-show="!menuStore.isCollapse"
      class="flex-1 text-center block overflow-hidden"
    >
      Vite-Vue-Starter
    </h1>
  </div>
</template>
