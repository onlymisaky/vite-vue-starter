<script setup lang="ts">
import useElConfig from '@/store/modules/el-config';

const { elConfig } = useElConfig();
</script>

<template>
  <ElConfigProvider v-bind="elConfig">
    <RouterView />
  </ElConfigProvider>
</template>
