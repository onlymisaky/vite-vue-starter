<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';

import ExitFullscreen from './Icons/ExitFullscreen.vue';
// import Fullscreen from './Icons/Fullscreen.vue';

const { isFullscreen, isSupported, toggle } = useFullscreen();
</script>

<template>
  <ElIcon
    v-if="isSupported"
    :size="24"
    @click="toggle"
  >
    <FullScreen v-if="!isFullscreen" />
    <ExitFullscreen v-else />
  </ElIcon>
</template>
