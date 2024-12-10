<script setup lang="ts">
import { useFullscreen } from '@vueuse/core';

import ExitFullscreen from './Icons/ExitFullscreen.vue';
import IconWithBg from './IconWithBg.vue';

const { isFullscreen, isSupported, toggle } = useFullscreen();
</script>

<template>
  <IconWithBg
    v-if="isSupported"
    :size="24"
    @click="toggle"
  >
    <ExitFullscreen v-if="isFullscreen" />
    <FullScreen v-else />
  </IconWithBg>
</template>
