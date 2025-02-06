<script setup lang="ts">
import { useElConfigStore } from '@/store/modules/el-config';

const { elConfig } = useElConfigStore();
</script>

<template>
  <ElConfigProvider v-bind="elConfig">
    <RouterView />
  </ElConfigProvider>
</template>
