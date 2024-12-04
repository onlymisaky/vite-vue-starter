<script setup lang="ts">
import Menus from '@/components/Menus.vue';
import ThemeToggle from '@/components/ThemeToggle.vue';
import useElConfig from '@/store/modules/el-config';
import { ref } from 'vue';

const { elConfig, setConfigItem } = useElConfig();

const sizes = ['large', 'default', 'small'] as const;
const index = ref(0);

function switchSize() {
  index.value > sizes.length - 1 ? (index.value = 0) : index.value++;
  setConfigItem('size', sizes[index.value]);
}
</script>

<template>
  <ElConfigProvider v-bind="elConfig">
    <ElButton @click="switchSize">
      切换大小
    </ElButton>
    <ThemeToggle />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <Menus />
    <RouterView />
  </ElConfigProvider>
</template>
