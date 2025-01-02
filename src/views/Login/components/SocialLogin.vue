<script setup lang="ts">
import type { Component, PropType } from 'vue';

defineProps({
  socialList: {
    type: Array as PropType<{
      icon: Component | string
      name: string
      color: string
    }[]>,
    default: () => [],
  },
});

defineEmits(['click']);
</script>

<template>
  <div
    v-if="socialList.length > 0"
    class="mt-8 text-center"
  >
    <p class="text-gray-600 text-sm mb-4">
      其他登录方式
    </p>
    <div class="flex  flex-wrap gap-4">
      <button
        v-for="item in socialList"
        :key="item.name"
        class="social-btn"
        @click="$emit('click', item)"
      >
        <ElIcon :color="item.color">
          <component :is="item.icon" />
        </ElIcon>
      </button>
    </div>
  </div>
</template>

<style scoped>
.social-btn {
  @apply w-10 h-10 rounded-full flex items-center justify-center bg-white/50 backdrop-blur-sm hover:bg-white hover:shadow-md transform hover:scale-110 transition-all duration-300;
}
</style>
